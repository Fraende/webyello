// POST /api/stripe/checkout — starts a Stripe-hosted Checkout for the care plan on the pricing page.
// Body: { item: "care", lang: "fi" | "sv" | "en" }  →  { url } to redirect the browser to.
//
// Prices are looked up by lookup key, so a price change in the Stripe Dashboard needs no code change:
// create the new price, move the lookup key to it (transfer_lookup_key) and archive the old one.
// Audits are ordered on /order.html (/api/checkout). Quoted work (website projects, custom engraving and
// 3D-printing jobs, extra hours) is invoiced from the Stripe Dashboard after the quote is accepted.

const { stripe, json } = require('../_stripe');

const ITEMS = {
  care: { lookupKey: 'webyello_care_monthly', mode: 'subscription' },
};
const PREFIX = { fi: '', sv: '/sv', en: '/en' };

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  // Same-origin only, like /api/contact.
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch (e) { /* fall through */ }
    if (host !== req.headers.host) return json(res, 403, { error: 'forbidden' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const item = ITEMS[body.item];
  if (!item) return json(res, 400, { error: 'invalid', fields: ['item'] });
  const lang = body.lang in PREFIX ? body.lang : 'fi';

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const site = `${proto}://${req.headers.host}${PREFIX[lang]}/pricing.html`;

  try {
    const s = stripe();
    const prices = await s.prices.list({ lookup_keys: [item.lookupKey], active: true, limit: 1 });
    const price = prices.data[0];
    if (!price) {
      console.error(`checkout: no active price with lookup key ${item.lookupKey}`);
      return json(res, 500, { error: 'not_configured' });
    }

    const params = {
      mode: item.mode,
      line_items: [{ price: price.id, quantity: 1 }],
      // No payment_method_types: the payment methods enabled in the Dashboard are offered dynamically.
      automatic_tax: { enabled: true },
      // EU businesses can enter their VAT ID; Stripe Tax then applies reverse charge to cross-border B2B sales.
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      locale: lang,
      success_url: `${site}?checkout=success&item=${body.item}#pay`,
      cancel_url: `${site}#pay`,
      metadata: { item: body.item },
      // Labels these sessions in the Dashboard so the pricing-page flow can be told apart from other checkouts.
      integration_identifier: 'webyello_pricing_qkvtmnrz',
    };
    if (item.mode === 'subscription') params.subscription_data = { metadata: { item: body.item } };

    const session = await s.checkout.sessions.create(params);
    return json(res, 200, { url: session.url });
  } catch (e) {
    console.error('checkout: Stripe error', e?.type, e?.code, e?.message);
    return json(res, 502, { error: 'checkout_failed' });
  }
};

function safeParse(s) {
  try { return JSON.parse(s) || {}; } catch (e) { return {}; }
}
