// Shared by /api/checkout and /api/stripe-webhook: prices, names and the order fields kept in Stripe metadata.
// The server is the only place prices are decided; the order page only displays them.

const SITE_PRICES = { small: 390, large: 590, store: 890 }; // € excl. VAT
const AI_PRICE = 249;

const NAMES = {
  fi: { site: 'Sivustoauditointi', ai: 'AI-näkyvyysauditointi', types: { small: 'pieni sivusto', large: 'laajempi tai WordPress-sivusto', store: 'verkkokauppa' } },
  sv: { site: 'Webbplatsgranskning', ai: 'AI-synlighetsgranskning', types: { small: 'liten webbplats', large: 'större webbplats eller WordPress', store: 'webbutik' } },
  en: { site: 'Website audit', ai: 'AI visibility audit', types: { small: 'small site', large: 'larger or WordPress site', store: 'online store' } },
};

// Line items for an order: [{ name, amount (cents) }]
function lineItems(order) {
  const n = NAMES[order.lang] || NAMES.fi;
  const items = [];
  if (order.audit === 'site' || order.audit === 'both') {
    items.push({ name: `${n.site} (${n.types[order.siteType]})`, amount: SITE_PRICES[order.siteType] * 100 });
  }
  if (order.audit === 'ai' || order.audit === 'both') items.push({ name: n.ai, amount: AI_PRICE * 100 });
  return items;
}

module.exports = { SITE_PRICES, AI_PRICE, NAMES, lineItems };
