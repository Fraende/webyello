// Pricing page: "Pay online" buttons. Asks /api/stripe/checkout for a Stripe-hosted Checkout URL and goes there.
// All visible text is in the page (tagged data-i18n), so this script only shows and hides it.
(function () {
  const box = document.getElementById('pay');
  if (!box) return;
  const lang = ['en', 'sv'].includes(document.documentElement.lang) ? document.documentElement.lang : 'fi';
  const wait = document.getElementById('payWait');
  const err = document.getElementById('payErr');
  const buttons = box.querySelectorAll('[data-checkout]');

  // Back from a completed checkout: show the matching thank-you and drop the query so a reload doesn't repeat it.
  const q = new URLSearchParams(location.search);
  if (q.get('checkout') === 'success') {
    const done = document.getElementById('payDoneCare');
    if (done && q.get('item') === 'care') done.hidden = false;
    history.replaceState(null, '', location.pathname + '#pay');
  }

  buttons.forEach(b => b.addEventListener('click', async () => {
    buttons.forEach(x => { x.disabled = true; });
    err.hidden = true;
    wait.hidden = false;
    try {
      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: b.dataset.checkout, lang }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.url) throw new Error(data.error || 'checkout_failed');
      location.assign(data.url);
    } catch (e) {
      wait.hidden = true;
      err.hidden = false;
      buttons.forEach(x => { x.disabled = false; });
    }
  }));

  // Coming back with the browser's Back button from Stripe: re-enable the buttons.
  window.addEventListener('pageshow', () => {
    buttons.forEach(x => { x.disabled = false; });
    wait.hidden = true;
  });
})();
