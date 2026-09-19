// POST /api/contact — emails a contact-form enquiry to the studio via Resend.
//
// Environment variables (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  required. From resend.com → API Keys.
//   CONTACT_TO      optional. Where enquiries go. Default: hello@webyello.com
//   CONTACT_FROM    optional. Sender. Default: "WebYello <onboarding@resend.dev>" (Resend's shared test sender,
//                   which can only deliver to the address your Resend account was created with). Once webyello.com
//                   is verified in Resend, use e.g. "WebYello <hello@webyello.com>".

const LIMITS = { name: 100, email: 200, type: 100, msg: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const oneLine = (v) => v.replace(/[\r\n]+/g, ' ');

function json(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  // Same-origin only: a browser form on another site shouldn't be able to use this endpoint.
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch (e) { /* fall through */ }
    if (host !== req.headers.host) return json(res, 403, { error: 'forbidden' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  // Honeypot: real visitors never see or fill this field. Pretend success so bots don't retry.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json(res, 200, { ok: true });

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const type = clean(body.type, LIMITS.type);
  const msg = clean(body.msg, LIMITS.msg);
  const lang = body.lang === 'en' ? 'en' : 'fi';
  const page = clean(body.page, 100);

  const fields = [];
  if (!name) fields.push('name');
  if (!EMAIL_RE.test(email)) fields.push('email');
  if (!msg) fields.push('msg');
  if (fields.length) return json(res, 400, { error: 'invalid', fields });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('contact: RESEND_API_KEY is not set');
    return json(res, 500, { error: 'not_configured' });
  }

  const text = [
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Needs:    ${type || '-'}`,
    `Language: ${lang === 'fi' ? 'Finnish' : 'English'}`,
    `Page:     ${page || '-'}`,
    '',
    msg,
  ].join('\n');

  let upstream;
  try {
    upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'WebYello <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO || 'hello@webyello.com'],
        reply_to: email, // hitting Reply in your inbox answers the visitor
        subject: oneLine(`New enquiry from ${name}` + (type ? ` — ${type}` : '')).slice(0, 200),
        text,
      }),
    });
  } catch (e) {
    console.error('contact: could not reach Resend', e);
    return json(res, 502, { error: 'send_failed' });
  }

  if (!upstream.ok) {
    console.error('contact: Resend rejected the message', upstream.status, await upstream.text().catch(() => ''));
    return json(res, 502, { error: 'send_failed' });
  }
  return json(res, 200, { ok: true });
};

function safeParse(s) {
  try { return JSON.parse(s) || {}; } catch (e) { return {}; }
}
