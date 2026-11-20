// POST /api/stripe-webhook — Stripe calls this when an audit order has been paid.
// It verifies Stripe's signature, creates the audit fee credit (half the fee excl. VAT, single use, 30 days;
// see _lib/credit.js), then emails the order brief to the studio and a confirmation to the buyer.
// Stripe sends the receipt and VAT invoice itself (invoice_creation in /api/checkout).
//
// Stripe setup: Developers → Webhooks → Add endpoint
//   URL:    https://<site>/api/stripe-webhook
//   Events: checkout.session.completed, checkout.session.async_payment_succeeded
//
// Environment variables:
//   STRIPE_WEBHOOK_SECRET  required. The endpoint's signing secret (whsec_…).
//   STRIPE_SECRET_KEY      required (shared with /api/checkout). Creates the credit coupon and promotion code.
//   RESEND_API_KEY         required (already used by /api/contact).
//   AUDIT_ORDERS_TO        optional. Where order briefs go. Default: CONTACT_TO, then info@netyello.com.
//   CONTACT_FROM           optional. Sender, as for /api/contact. The buyer's confirmation is only sent once this
//                          is a verified domain sender (Resend's shared test sender can't reach outside addresses).

const crypto = require('node:crypto');
const { NAMES } = require('./_lib/audit');
const { ensureCredit, fmtDate } = require('./_lib/credit');

const TOLERANCE = 300; // seconds

// Vercel's body helpers parse JSON lazily; reading the stream ourselves keeps the exact bytes Stripe signed.
async function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

function verify(raw, header, secret, now = Math.floor(Date.now() / 1000)) {
  if (!header || !secret) return false;
  const parts = Object.create(null);
  const sigs = [];
  for (const p of header.split(',')) {
    const [k, v] = p.split('=');
    if (k === 'v1') sigs.push(v); else parts[k] = v;
  }
  const t = Number(parts.t);
  if (!t || Math.abs(now - t) > TOLERANCE || !sigs.length) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.`).update(raw).digest('hex');
  return sigs.some((s) => s && s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

const euros = (cents) => (cents / 100).toLocaleString('fi-FI', { minimumFractionDigits: 2 }) + ' €';
const money = (cents, lang) => (lang === 'en' ? '€' + (cents / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 }) : euros(cents));

function studioText(s, credit, creditError) {
  const m = s.metadata || {};
  const n = NAMES.fi;
  const audits = { site: n.site, ai: n.ai, both: `${n.site} + ${n.ai}` }[m.audit] || m.audit;
  const qs = [1, 2, 3, 4, 5].map((i) => m[`q${i}`]).filter(Boolean);
  return [
    `UUSI AUDITOINTITILAUS — ${m.business}`,
    '',
    `Auditointi:   ${audits}${m.site_type ? ` (${n.types[m.site_type]})` : ''}`,
    `Sivusto:      ${m.url}`,
    `Yritys:       ${m.business}`,
    `Toimiala:     ${m.industry}`,
    m.area ? `Alue:         ${m.area}` : null,
    m.competitors ? `Kilpailijat:  ${m.competitors}` : null,
    m.platform ? `Alusta:       ${{ wordpress: 'WordPress', shopify: 'Shopify', wix: 'Wix', custom: 'räätälöity tai muu', unknown: 'ei tiedä' }[m.platform] || m.platform}` : null,
    m.maintainer ? `Ylläpitäjä:   ${m.maintainer}` : null,
    m.goal ? `Tavoite/huoli: ${m.goal}` : null,
    m.key_services ? `Tärkeimmät palvelut: ${m.key_services}` : null,
    m.languages ? `Kieliversiot: ${m.languages}` : null,
    m.gbp ? `Google-profiili itse hallinnassa: ${{ yes: 'kyllä', no: 'ei', unknown: 'ei tiedä' }[m.gbp] || m.gbp}` : null,
    m.no_publish ? `EI JULKAISTA: ${m.no_publish}` : null,
    m.audit !== 'site' ? `Kysymykset:   ${qs.length ? '' : '(asiakas ei antanut — laadi itse)'}` : null,
    ...qs.map((q, i) => `  ${i + 1}. ${q}`),
    '',
    `Tilaaja:      ${m.name}`,
    `Sähköposti:   ${(s.customer_details && s.customer_details.email) || s.customer_email}`,
    m.phone ? `Puhelin:      ${m.phone}` : null,
    `Kieli:        ${m.lang}`,
    '',
    `Maksettu:     ${euros(s.amount_total)} (alv 0 %: ${euros(s.amount_subtotal)})`,
    `Stripe:       https://dashboard.stripe.com/${s.livemode ? '' : 'test/'}payments/${s.payment_intent}`,
    '',
    credit
      ? `Hyvitys:      ${credit.code} — ${euros(credit.amount)} (alv 0 %), kertakäyttöinen, voimassa ${fmtDate(credit.expires)} asti. Kuponki: ${credit.coupon}`
      : `Hyvitys:      KOODIN LUONTI EPÄONNISTUI (${creditError || 'tuntematon virhe'}). Luo kuponki Stripessä käsin: 50 % alv 0 -summasta, kertakäyttöinen, 30 päivää.`,
    '',
    'Raportti luvattu 3 arkipäivän kuluessa maksusta. Tarkista sivustotyyppi ennen aloitusta.',
  ].filter((l) => l !== null).join('\n');
}

// The credit paragraph in the buyer's language. It is a credit on a later invoice, never a refund.
const CREDIT = {
  fi: (c) => `Hyvitys: kun tilaat meiltä korjaustyöt tai uuden sivuston viimeistään ${fmtDate(c.expires)}, puolet auditoinnin hinnasta (${money(c.amount, 'fi')}, alv 0 %) hyvitetään laskusta. Hyvityskoodisi on ${c.code}. Se on kertakäyttöinen. Hyvitys ei ole palautus, eikä sitä makseta rahana.\n\n`,
  sv: (c) => `Kreditering: om du beställer åtgärdsarbete eller en ny webbplats av oss senast ${fmtDate(c.expires)} krediteras hälften av granskningsavgiften (${money(c.amount, 'sv')}, exkl. moms) på fakturan. Din krediteringskod är ${c.code} och kan användas en gång. Krediteringen är ingen återbetalning och betalas inte ut kontant.\n\n`,
  en: (c) => `Credit: if you order fix work or a new website from us by ${fmtDate(c.expires)}, half of the audit fee (${money(c.amount, 'en')} excl. VAT) is credited on that invoice. Your credit code is ${c.code} and can be used once. The credit is not a refund and is not paid out in cash.\n\n`,
};

const BUYER = {
  fi: (m, cr) => ({
    subject: `Tilausvahvistus: auditointi sivustolle ${m.url}`,
    text: `Hei ${m.name},\n\nkiitos tilauksesta! Olemme vastaanottaneet maksusi, ja Stripe lähettää kuitin ja ALV-laskun erikseen.\n\nAloitamme sivuston ${m.url} auditoinnin, ja raportti saapuu sähköpostiisi 3 arkipäivän kuluessa. Jos sivustostasi pitää tarkistaa jotain ennen aloitusta, otamme yhteyttä.\n\n${cr ? CREDIT.fi(cr) : ''}Kysyttävää? Vastaa tähän viestiin.\n\nYstävällisin terveisin\nWebYello\n\nWebYello on NetYellon palvelu · NetYello, Y-tunnus 2301971-6`,
  }),
  sv: (m, cr) => ({
    subject: `Orderbekräftelse: granskning av ${m.url}`,
    text: `Hej ${m.name},\n\ntack för beställningen! Vi har tagit emot din betalning, och Stripe skickar kvittot och momsfakturan separat.\n\nVi börjar granska ${m.url}, och rapporten kommer per e-post inom 3 arbetsdagar. Om något på din webbplats behöver kontrolleras först kontaktar vi dig.\n\n${cr ? CREDIT.sv(cr) : ''}Frågor? Svara på det här meddelandet.\n\nVänliga hälsningar\nWebYello\n\nWebYello är en tjänst från NetYello · NetYello, FO-nummer 2301971-6`,
  }),
  en: (m, cr) => ({
    subject: `Order confirmation: audit of ${m.url}`,
    text: `Hi ${m.name},\n\nthank you for your order! We have received your payment, and Stripe will send the receipt and VAT invoice separately.\n\nWe will now audit ${m.url}, and your report will arrive by email within 3 business days. If anything about your site needs checking first, we will contact you.\n\n${cr ? CREDIT.en(cr) : ''}Questions? Just reply to this email.\n\nBest regards\nWebYello\n\nWebYello is a NetYello service · NetYello, Business ID 2301971-6`,
  }),
};

async function send(payload, idempotencyKey) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text().catch(() => '')}`);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const raw = await rawBody(req);
  if (!verify(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).json({ error: 'bad_signature' });
  }

  let event;
  try { event = JSON.parse(raw.toString('utf8')); } catch (e) { return res.status(400).json({ error: 'bad_json' }); }

  const s = event.data && event.data.object;
  const relevant = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type);
  if (!relevant || !s || (s.metadata || {}).kind !== 'webyello_audit' || s.payment_status !== 'paid') {
    return res.status(200).json({ received: true, ignored: true });
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('stripe-webhook: RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'not_configured' }); // Stripe retries, so the order isn't lost
  }

  const m = s.metadata;
  // The credit comes first so both emails can carry its code. If it can't be made, the studio still gets the
  // order at once (with a warning), the buyer's confirmation waits, and Stripe is asked to retry: the retry
  // finishes the credit without duplicating anything and then sends the brief again with the code.
  let credit = null;
  let creditError = '';
  try {
    credit = await ensureCredit(s, event.created || s.created || Math.floor(Date.now() / 1000));
  } catch (e) {
    creditError = e.message;
    console.error('stripe-webhook: credit not created', e);
  }

  const from = process.env.CONTACT_FROM || 'WebYello <onboarding@resend.dev>';
  const buyerEmail = (s.customer_details && s.customer_details.email) || s.customer_email;
  try {
    await send({
      from,
      to: [process.env.AUDIT_ORDERS_TO || process.env.CONTACT_TO || 'info@netyello.com'],
      reply_to: buyerEmail,
      subject: `Auditointitilaus: ${m.business} (${m.url})`.slice(0, 200),
      text: studioText(s, credit, creditError),
    }, `audit-studio-${s.id}-${credit ? 'credit' : 'nocredit'}`);
  } catch (e) {
    console.error('stripe-webhook: studio email failed', e);
    return res.status(502).json({ error: 'email_failed' }); // Stripe retries; the idempotency key stops duplicates
  }
  if (!credit) return res.status(503).json({ error: 'credit_pending' }); // Stripe retries with backoff for up to 3 days
  if (process.env.CONTACT_FROM && buyerEmail) {
    try {
      const msg = (BUYER[m.lang] || BUYER.fi)(m, credit);
      await send({ from, to: [buyerEmail], reply_to: process.env.AUDIT_ORDERS_TO || process.env.CONTACT_TO || 'info@netyello.com', ...msg }, `audit-buyer-${s.id}`);
    } catch (e) {
      console.error('stripe-webhook: buyer confirmation failed', e); // the studio has the order; don't make Stripe retry
    }
  }
  return res.status(200).json({ received: true });
};

module.exports.verify = verify;
module.exports.studioText = studioText;
