# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Small business owners and entrepreneurs (Finland-based, served bilingually in Finnish and English) who need a new website, a redesign of an existing site, an online store, or ongoing site care — and are choosing a design/development studio rather than doing it themselves.

## Product Purpose

WebYello is a website design & development studio. It designs, builds, and maintains websites for small businesses — from a single-page launch site, to a multi-page business site, to a full online store — plus branding/identity, SEO, and ongoing care plans. Success on the marketing site means turning a visitor into a booked discovery call and, from there, a paying client.

## Positioning

A brand-new studio that says so out loud (no invented portfolio, no fake reviews) but offers "big agency polish, small studio heart": founder-level attention, honest fixed-price quotes, no jargon, and a friendly four-step process with no surprises (Discover → Design → Build → Launch & grow).

## Operating Context

Client journey: free 30-minute discovery call → clickable design mockups the client reacts to → build with progress previews → launch, followed by an ongoing €59/month care plan (updates, backups, security, small changes). The site serves both Finnish and English-speaking visitors via an EN/FI language toggle.

## Capabilities and Constraints

- Services offered: Website Design, Web Development, E-commerce, SEO & Performance, Branding & Identity, Care & Support.
- Pricing tiers (quoted, fixed after discovery call, VAT 25.5% excluded): **Launch** from €690 (one-page site, mobile-first, contact form + map, basic SEO); **Business** from €1,390 (up to 5 custom pages, multilingual site structure, blog/news, SEO + analytics); **Store** from €2,490 (full online store, payments/shipping, product page templates, owner training). **Care plan** €59/month.
- Current implementation is a small static multi-page site — `index.html` (hero, homepage sketch, links to the sub-pages, contact), `services.html`, `process.html`, `pricing.html` (plans + quote builder) — sharing `style.css`, `site.js` (nav, EN/FI text toggling, contact form) and page scripts `sketch.js` / `quote.js`. Vanilla JS, no framework, no build step; the only server code is one Vercel function, `api/contact.js`, which validates the contact form and emails it to the studio via Resend (env vars `RESEND_API_KEY`, optional `CONTACT_TO` / `CONTACT_FROM`). Every page ends with the contact form so the quote builder can hand off into it; the thank-you is shown only after the server confirms the send, and a failure keeps the visitor's text and offers the mailto fallback. The EN/FI choice is remembered in `localStorage` (Finnish by default); the sketch's business name and trade follow the visitor to the pricing page via `sessionStorage`. The sketch and quote builder are client-side only (the quote uses only the published package prices above); the contact form is the one thing that sends data, and only to the studio's inbox. Existing codebase already answers the stack question; future work should preserve this unless the user decides to introduce a framework (e.g. for the planned blog/news section).
- Contact: hello@webyello.com. Promise of a reply within one business day.

## Brand Commitments

- Name: **WebYello**. Tagline: "Websites that make people smile — and click." Sign-off: "Made with plenty of pink and blue."
- Visual identity (palette, type, component language) is owned by [DESIGN.md](DESIGN.md) — current identity is "The Riso Print Desk" (risograph pink/blue duotone), replacing an earlier neobrutalist yellow-and-black identity. Do not restate token values here; update DESIGN.md when the identity changes.
- Bilingual EN/FI parity is a standing commitment, not a one-off feature.

## Evidence on Hand

Full marketing copy for hero, six services, four-step process, three pricing tiers + care plan, and a contact form is already live at the site's Vercel deployment and cloned into this repo (the pages above). **No portfolio pieces, case studies, testimonials, or client logos exist yet** — the site explicitly states this ("no imaginary portfolio, no invented reviews"), and future work must not fabricate any.

## Product Principles

1. Never fabricate portfolio pieces, reviews, client names, or metrics — WebYello's honesty about being new is a stated differentiator, not a gap to paper over.
2. Keep every touchpoint jargon-free and friendly.
3. Pricing stays fixed and transparent — no hidden surprises.
4. Bilingual (EN/FI) parity: new surfaces should work in both languages, not just English.
5. Founder-level care: small-studio warmth paired with big-agency execution quality.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established yet.
