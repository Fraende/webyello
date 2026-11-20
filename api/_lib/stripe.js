// Minimal Stripe REST client: form-encoded requests with a pinned API version, so a Stripe account
// created on a newer default version still gets the parameters this code was written for.

const STRIPE_VERSION = '2024-06-20';

// Stripe takes form-encoded nested keys: line_items[0][price_data][currency]=eur. Empty values are left out.
function form(obj, prefix, out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

class StripeError extends Error {
  constructor(status, body) {
    super(`Stripe ${status}: ${(body && body.error && body.error.message) || 'request failed'}`);
    this.status = status;
    this.code = body && body.error && body.error.code;
  }
}

// stripe('POST', '/v1/coupons', { … }, 'idempotency-key') → parsed JSON, or throws StripeError
async function stripe(method, path, params, idempotencyKey) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeError(500, { error: { message: 'STRIPE_SECRET_KEY is not set' } });
  const headers = { Authorization: `Bearer ${key}`, 'Stripe-Version': STRIPE_VERSION };
  let url = 'https://api.stripe.com' + path;
  let body;
  if (method === 'GET') {
    if (params) url += '?' + form(params).toString();
  } else {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = form(params || {}).toString();
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  }
  const r = await fetch(url, { method, headers, body });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw new StripeError(r.status, out);
  return out;
}

module.exports = { STRIPE_VERSION, form, stripe, StripeError };
