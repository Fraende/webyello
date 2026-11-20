// POST /api/stripe/webhook — receives Stripe events. Required: payments, renewals, failed payments, refunds and
// disputes all happen after the customer leaves the checkout page, so the success page can't be relied on.
//
// The site has no database, so "fulfilment" means telling the studio: every handled event emails the studio inbox
// (via Resend, like the contact form) with what happened and a link to the object in the Stripe Dashboard.
//
// Register in Stripe Dashboard → Developers → Webhooks → Add endpoint: https://<site>/api/stripe/webhook with the
// events listed in HANDLERS below, then put its signing secret in STRIPE_WEBHOOK_SECRET.
// Stripe retries failed deliveries, and an event can arrive more than once: duplicates only mean a duplicate email.

const { stripe, json, notifyStudio } = require('../_stripe');

const eur = (cents, currency = 'eur') =>
  new Intl.NumberFormat('fi-FI', { style: 'currency', currency: currency.toUpperCase() }).format((cents || 0) / 100);

function dash(event, path) {
  return `https://dashboard.stripe.com${event.livemode ? '' : '/test'}/${path}`;
}

const ITEM_NAME = { audit: 'Website audit', care: 'Care plan' };

const HANDLERS = {
  // Checkout finished. With delayed payment methods (e.g. bank debits) the money may not be in yet:
  // only treat it as paid when payment_status says so; async_payment_succeeded follows otherwise.
  'checkout.session.completed': async (e) => {
    const s = e.data.object;
    const item = ITEM_NAME[s.metadata?.item] || 'Checkout';
    const who = s.customer_details || {};
    const paid = s.payment_status !== 'unpaid';
    await notifyStudio(`${paid ? 'Paid' : 'Pending payment'}: ${item} — ${who.name || who.email || 'customer'}`, [
      `${item} ${paid ? 'was paid' : 'checkout completed, payment still pending'} through the website.`,
      '',
      `Customer: ${who.name || '-'} <${who.email || '-'}>`,
      `Business VAT ID: ${(who.tax_ids || []).map(t => t.value).join(', ') || '-'}`,
      `Country: ${who.address?.country || '-'}`,
      `Total: ${eur(s.amount_total, s.currency)} (VAT ${eur(s.total_details?.amount_tax, s.currency)})`,
      '',
      s.metadata?.item === 'care' ? 'Next: add the site to the care rota.' : 'Next: book the audit with the customer.',
      dash(e, `checkout/sessions/${s.id}`),
    ]);
  },
  'checkout.session.async_payment_succeeded': async (e) => {
    const s = e.data.object;
    await notifyStudio(`Payment arrived: ${ITEM_NAME[s.metadata?.item] || 'Checkout'} — ${s.customer_details?.email || ''}`, [
      'A delayed payment from the website checkout has now cleared.',
      `Total: ${eur(s.amount_total, s.currency)}`,
      dash(e, `checkout/sessions/${s.id}`),
    ]);
  },
  'checkout.session.async_payment_failed': async (e) => {
    const s = e.data.object;
    await notifyStudio(`Payment FAILED: ${ITEM_NAME[s.metadata?.item] || 'Checkout'} — ${s.customer_details?.email || ''}`, [
      'A delayed payment from the website checkout failed. Contact the customer before starting work.',
      dash(e, `checkout/sessions/${s.id}`),
    ]);
  },

  // Invoices: care-plan renewals and the invoices you send from the Dashboard for quoted work.
  'invoice.paid': async (e) => {
    const inv = e.data.object;
    await notifyStudio(`Invoice paid: ${inv.number || inv.id} — ${eur(inv.amount_paid, inv.currency)}`, [
      `Invoice ${inv.number || inv.id} for ${inv.customer_name || inv.customer_email || 'a customer'} is paid.`,
      `Reason: ${inv.billing_reason || '-'}`,
      inv.hosted_invoice_url || dash(e, `invoices/${inv.id}`),
    ]);
  },
  'invoice.payment_failed': async (e) => {
    const inv = e.data.object;
    await notifyStudio(`Invoice payment FAILED: ${inv.number || inv.id} — ${inv.customer_email || ''}`, [
      `Payment for invoice ${inv.number || inv.id} failed (attempt ${inv.attempt_count || 1}).`,
      'Stripe retries automatically (Smart Retries) and emails the customer a link to update their card.',
      dash(e, `invoices/${inv.id}`),
    ]);
  },

  // Care plan changes made in the customer portal.
  'customer.subscription.updated': async (e) => {
    const sub = e.data.object;
    const prev = e.data.previous_attributes || {};
    // Only cancellation scheduling is worth an email; renewals already produce invoice.paid.
    if (!('cancel_at_period_end' in prev) && !('cancel_at' in prev)) return;
    const ending = sub.cancel_at_period_end || sub.cancel_at;
    await notifyStudio(`Care plan ${ending ? 'cancellation scheduled' : 'cancellation withdrawn'}`, [
      ending
        ? `The customer cancelled. Care continues until ${new Date((sub.cancel_at || sub.items?.data?.[0]?.current_period_end) * 1000).toLocaleDateString('fi-FI')}.`
        : 'The customer undid their cancellation; the care plan continues.',
      dash(e, `subscriptions/${sub.id}`),
    ]);
  },
  'customer.subscription.deleted': async (e) => {
    const sub = e.data.object;
    await notifyStudio('Care plan ended', [
      'A care plan subscription has ended. Remove the site from the care rota.',
      dash(e, `subscriptions/${sub.id}`),
    ]);
  },

  // Money going back out.
  'charge.refunded': async (e) => {
    const c = e.data.object;
    await notifyStudio(`Refund: ${eur(c.amount_refunded, c.currency)} — ${c.billing_details?.email || ''}`, [
      `A refund of ${eur(c.amount_refunded, c.currency)} was issued. Stripe Tax adjusts the VAT on taxed invoices automatically.`,
      dash(e, `payments/${c.payment_intent || c.id}`),
    ]);
  },
  'charge.dispute.created': async (e) => {
    const d = e.data.object;
    await notifyStudio(`DISPUTE opened: ${eur(d.amount, d.currency)} — respond before the deadline`, [
      `A customer disputed a payment (reason: ${d.reason}). Submit evidence in the Dashboard before ${new Date((d.evidence_details?.due_by || 0) * 1000).toLocaleDateString('fi-FI')}.`,
      dash(e, `disputes/${d.id}`),
    ]);
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('webhook: STRIPE_WEBHOOK_SECRET is not set');
    return json(res, 500, { error: 'not_configured' });
  }

  // The signature covers the exact bytes Stripe sent, so read the raw body (never touch req.body here).
  let event;
  try {
    const raw = await readRaw(req);
    event = await stripe().webhooks.constructEventAsync(raw, req.headers['stripe-signature'], secret);
  } catch (e) {
    console.error('webhook: signature check failed', e?.message);
    return json(res, 400, { error: 'bad_signature' });
  }

  const handle = HANDLERS[event.type];
  if (!handle) return json(res, 200, { received: true, ignored: event.type });
  try {
    await handle(event);
  } catch (e) {
    // Non-2xx makes Stripe retry later, which is what we want for an unexpected failure.
    console.error(`webhook: handling ${event.type} ${event.id} failed`, e);
    return json(res, 500, { error: 'handler_failed' });
  }
  return json(res, 200, { received: true });
};

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

module.exports.HANDLERS = HANDLERS;
