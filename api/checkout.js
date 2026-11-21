// POST /api/checkout — validates an audit order from /order.html and opens a Stripe Checkout page for it.
// Returns { url } to redirect the buyer to. Nothing is stored here: the order details travel in the
// Checkout Session's metadata, and /api/stripe/webhook acts on them once Stripe confirms the payment.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   STRIPE_SECRET_KEY    required. Stripe → Developers → API keys. Use the test key (sk_test_…) for Preview.
//   STRIPE_TAX_RATE_ID   required. Stripe → Product catalog → Tax rates: "ALV", Finland, 25.5 %, exclusive (txr_…).
//   SITE_URL             optional. Where Stripe sends the buyer back. Default: this request's own host.

const { lineItems } = require('./_lib/audit');
const { form, STRIPE_VERSION } = require('./_lib/stripe');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Whitespace collapsed and cut to `max` characters without splitting an emoji or other character in two.
// Also kept within 500 UTF-16 units, so every value fits Stripe's 500-character metadata limit however it counts.
function clean(v, max) {
  if (typeof v !== 'string') return '';
  let out = '';
  let n = 0;
  for (const ch of v.replace(/\s+/g, ' ').trim()) {
    if (n >= max || out.length + ch.length > 500) break;
    out += ch;
    n += 1;
  }
  return out.trim();
}
const json = (res, status, body) => res.status(status).setHeader('Cache-Control', 'no-store').json(body);
const PREFIX = { fi: '', sv: '/sv', en: '/en' };

function normUrl(v) {
  v = clean(v, 200);
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  try {
    const u = new URL(v);
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname) ? u.href.slice(0, 200) : '';
  } catch (e) { return ''; }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch (e) { /* fall through */ }
    if (host !== req.headers.host) return json(res, 403, { error: 'forbidden' });
  }

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (typeof body.website === 'string' && body.website.trim() !== '') return json(res, 400, { error: 'invalid' });

  const audit = ['site', 'ai', 'both'].includes(body.audit) ? body.audit : '';
  const withSite = audit === 'site' || audit === 'both';
  const withAi = audit === 'ai' || audit === 'both';
  const order = {
    audit,
    siteType: withSite && ['small', 'large', 'store'].includes(body.siteType) ? body.siteType : '',
    url: normUrl(body.url),
    business: clean(body.business, 100),
    industry: clean(body.industry, 100),
    area: withAi ? clean(body.area, 100) : '',
    questions: withAi && Array.isArray(body.questions) ? body.questions.map((q) => clean(q, 200)).filter(Boolean).slice(0, 5) : [],
    competitors: withAi ? clean(body.competitors, 300) : '',
    // optional background for the report
    platform: ['wordpress', 'shopify', 'wix', 'custom', 'unknown'].includes(body.platform) ? body.platform : '',
    maintainer: clean(body.maintainer, 100),
    goal: clean(body.goal, 300),
    keyServices: clean(body.keyServices, 300),
    languages: clean(body.languages, 100),
    gbp: ['yes', 'no', 'unknown'].includes(body.gbp) ? body.gbp : '',
    noPublish: clean(body.noPublish, 300),
    name: clean(body.name, 100),
    email: clean(body.email, 200),
    phone: clean(body.phone, 40),
    lang: ['en', 'sv'].includes(body.lang) ? body.lang : 'fi',
  };

  const fields = [];
  if (!audit) fields.push('audit');
  if (withSite && !order.siteType) fields.push('siteType');
  if (!order.url) fields.push('url');
  if (!order.business) fields.push('business');
  if (!order.industry) fields.push('industry');
  if (withAi && !order.area) fields.push('area');
  if (!order.name) fields.push('name');
  if (!EMAIL_RE.test(order.email)) fields.push('email');
  if (body.terms !== true) fields.push('terms');
  if (fields.length) return json(res, 400, { error: 'invalid', fields });

  const key = process.env.STRIPE_SECRET_KEY;
  const taxRate = process.env.STRIPE_TAX_RATE_ID;
  if (!key || !taxRate) {
    console.error('checkout: STRIPE_SECRET_KEY or STRIPE_TAX_RATE_ID is not set');
    return json(res, 500, { error: 'not_configured' });
  }

  const base = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '') + PREFIX[order.lang];
  const items = lineItems(order);
  // Stripe metadata: up to 50 keys, 500 characters per value
  const metadata = {
    kind: 'webyello_audit',
    audit: order.audit, site_type: order.siteType, url: order.url, business: order.business, industry: order.industry,
    area: order.area, competitors: order.competitors, name: order.name, phone: order.phone, lang: order.lang,
    platform: order.platform, maintainer: order.maintainer, goal: order.goal, key_services: order.keyServices,
    languages: order.languages, gbp: order.gbp, no_publish: order.noPublish,
  };
  // empty values are left out by form() below, so unanswered optional fields don't reach Stripe
  order.questions.forEach((q, i) => { metadata[`q${i + 1}`] = q; });

  const params = form({
    mode: 'payment',
    locale: order.lang,
    customer_email: order.email,
    customer_creation: 'always',
    billing_address_collection: 'required',
    tax_id_collection: { enabled: true },
    invoice_creation: { enabled: true, invoice_data: { metadata: { kind: 'webyello_audit' }, footer: 'WebYello on NetYellon palvelu · NetYello, Y-tunnus 2301971-6' } },
    success_url: `${base}/order.html?status=paid`,
    cancel_url: `${base}/order.html?status=cancelled`,
    metadata,
    payment_intent_data: { description: items.map((i) => i.name).join(' + ') + ' — ' + order.business, metadata: { kind: 'webyello_audit', url: order.url } },
  });
  items.forEach((it, i) => {
    form({
      price_data: { currency: 'eur', unit_amount: it.amount, tax_behavior: 'exclusive', product_data: { name: it.name } },
      quantity: 1,
      tax_rates: [taxRate],
    }, `line_items[${i}]`, params);
  });

  let upstream, out;
  try {
    upstream = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Stripe-Version': STRIPE_VERSION, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    out = await upstream.json();
  } catch (e) {
    console.error('checkout: could not reach Stripe', e);
    return json(res, 502, { error: 'payment_unavailable' });
  }
  if (!upstream.ok || !out.url) {
    console.error('checkout: Stripe refused the session', upstream.status, out && out.error && out.error.message);
    return json(res, 502, { error: 'payment_unavailable' });
  }
  return json(res, 200, { url: out.url });
};

