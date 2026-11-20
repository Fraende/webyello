// GET /api/stripe/manage — sends care-plan customers to the Stripe customer portal, where they sign in with their
// email and can update their card, see invoices and cancel. The link lives in an env var so the site never hardcodes it.

module.exports = function handler(req, res) {
  const url = process.env.STRIPE_PORTAL_LOGIN_URL;
  if (!url || !/^https:\/\/billing\.stripe\.com\//.test(url)) {
    console.error('manage: STRIPE_PORTAL_LOGIN_URL is not set or not a billing.stripe.com link');
    res.status(503).setHeader('Cache-Control', 'no-store');
    return res.send('Billing portal is not available right now. Email info@netyello.com and we will help.');
  }
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, url);
};
