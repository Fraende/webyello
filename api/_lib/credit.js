// The audit fee credit: half of the audit fee paid (excl. VAT) comes off fix work or a new website
// ordered within 30 days. It is a credit, never a refund.
//
// For each paid Checkout Session this makes, once:
//   • a coupon  id "audit-credit-<session id>"  amount_off = 50 % of amount_subtotal, single use, redeem_by = expiry
//   • a promotion code "AUDIT-XXXXXX" for that coupon, single use, same expiry, tied to the Stripe customer
//   • payment intent metadata audit_credit_* so the credit can be found from the payment later
// Every step first looks for what an earlier attempt already made, so webhook retries never create a second credit.

const crypto = require('node:crypto');
const { stripe } = require('./stripe');

const DAYS = 30;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I, so the code is easy to type

function codeFor(sessionId, length = 6) {
  const bytes = crypto.createHash('sha256').update(sessionId).digest();
  let s = '';
  for (let i = 0; i < length; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return 'AUDIT-' + s;
}

// The Helsinki-time offset (in minutes) at a given instant, e.g. 120 in winter, 180 in summer
function helsinkiOffset(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Helsinki', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

// End of the 30th calendar day after the payment date, Helsinki time (23:59:59), as a Unix timestamp.
// Counting calendar days from the Helsinki date keeps the summer-time change from moving the expiry.
function expiryFor(paidAt) {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Helsinki' }).format(new Date(paidAt * 1000)); // YYYY-MM-DD
  const [y, mo, d] = ymd.split('-').map(Number);
  const guess = Date.UTC(y, mo - 1, d + DAYS, 23, 59, 59);
  return Math.floor((guess - helsinkiOffset(new Date(guess - 3 * 3600 * 1000)) * 60000) / 1000);
}

const fmtDate = (ts) => new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date(ts * 1000));

async function ensureCredit(session, paidAt) {
  const pi = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent && session.payment_intent.id;
  const customer = typeof session.customer === 'string' ? session.customer : session.customer && session.customer.id;

  // 1. Already done on an earlier attempt?
  if (pi) {
    const intent = await stripe('GET', `/v1/payment_intents/${pi}`);
    const md = intent.metadata || {};
    if (md.audit_credit_code && md.audit_credit_amount && md.audit_credit_expires) {
      return { code: md.audit_credit_code, amount: Number(md.audit_credit_amount), expires: Number(md.audit_credit_expires), coupon: md.audit_credit_coupon, reused: true };
    }
  }

  const amount = Math.round((session.amount_subtotal || 0) / 2); // cents, excl. VAT
  if (amount <= 0) throw new Error('nothing to credit');
  const couponId = `audit-credit-${session.id}`;
  let code = codeFor(session.id);

  // 2. Coupon (look it up first; the fixed id also stops duplicates after Stripe's 24 h idempotency window)
  let coupon;
  try {
    coupon = await stripe('GET', `/v1/coupons/${couponId}`);
  } catch (e) {
    if (e.status !== 404) throw e;
    coupon = await stripe('POST', '/v1/coupons', {
      id: couponId,
      name: `Auditointihyvitys ${code}`.slice(0, 40),
      amount_off: amount,
      currency: 'eur',
      duration: 'once',
      max_redemptions: 1,
      redeem_by: expiryFor(paidAt),
      metadata: { kind: 'webyello_audit_credit', session: session.id, payment_intent: pi || '' },
    }, `audit-credit-coupon-${session.id}`);
  }
  const expires = coupon.redeem_by || expiryFor(paidAt);

  // 3. Promotion code for that coupon
  const existing = await stripe('GET', '/v1/promotion_codes', { coupon: couponId, limit: 1 });
  let promo = existing.data && existing.data[0];
  if (!promo) {
    const params = {
      coupon: couponId, code, max_redemptions: 1, expires_at: expires, customer,
      metadata: { kind: 'webyello_audit_credit', session: session.id },
    };
    try {
      promo = await stripe('POST', '/v1/promotion_codes', params, `audit-credit-promo-${session.id}`);
    } catch (e) {
      // the 6-character code is already taken by another credit: use a longer one
      if (e.status !== 400) throw e;
      code = codeFor(session.id, 10);
      promo = await stripe('POST', '/v1/promotion_codes', { ...params, code }, `audit-credit-promo2-${session.id}`);
    }
  }

  const credit = { code: promo.code, amount: coupon.amount_off, expires, coupon: couponId, reused: false };

  // 4. Note it on the payment so it can be found from the Stripe payment page
  if (pi) {
    await stripe('POST', `/v1/payment_intents/${pi}`, {
      metadata: {
        audit_credit_code: credit.code, audit_credit_amount: credit.amount, audit_credit_expires: credit.expires, audit_credit_coupon: couponId,
      },
    }, `audit-credit-pi-${session.id}`);
  }
  return credit;
}

module.exports = { ensureCredit, codeFor, expiryFor, fmtDate, DAYS };
