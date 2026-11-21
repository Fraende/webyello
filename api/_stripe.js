// Shared helpers for the Stripe functions. Files in api/ whose name starts with "_" are not endpoints on Vercel.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   STRIPE_SECRET_KEY       required. Use a restricted key (rk_…) with write access to Checkout Sessions and
//                           Customers and read access to Prices. Test-mode key in Preview, live key in Production.
//   STRIPE_WEBHOOK_SECRET   required by /api/stripe/webhook. The endpoint's signing secret (whsec_…).
//   STRIPE_PORTAL_LOGIN_URL optional. The customer portal login link from Dashboard → Settings → Billing →
//                           Customer portal. /api/stripe/manage redirects there.
//   RESEND_API_KEY, CONTACT_TO, CONTACT_FROM   reused from /api/contact for payment notifications.

const Stripe = require('stripe');

let client;
function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
  // One client per warm function instance. The SDK pins the API version it was built for.
  client ||= new Stripe(process.env.STRIPE_SECRET_KEY, { appInfo: { name: 'webyello-site' } });
  return client;
}

function json(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

// Sends a plain-text note to the studio inbox. Failures are logged, never thrown: a lost
// notification must not make Stripe retry a webhook that was otherwise handled.
async function notifyStudio(subject, lines) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.error('stripe: RESEND_API_KEY is not set, notification skipped:', subject); return; }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'WebYello <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO || 'info@netyello.com'],
        subject: subject.replace(/[\r\n]+/g, ' ').slice(0, 200),
        text: lines.join('\n'),
      }),
    });
    if (!r.ok) console.error('stripe: Resend rejected the notification', r.status, await r.text().catch(() => ''));
  } catch (e) {
    console.error('stripe: could not reach Resend', e);
  }
}

module.exports = { stripe, json, notifyStudio };
