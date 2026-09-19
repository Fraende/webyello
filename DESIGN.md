---
name: WebYello
description: A brand-new website design & development studio's marketing site
colors:
  riso-yellow: "#F7C600"
  riso-yellow-ink: "#8A6D00"
  riso-blue: "#0078BF"
  overlap-olive: "#5B8C3E"
  uncoated-paper: "#E4E6E2"
  riso-black: "#1A1A1A"
  ink-muted: "#404040"
  ink-faint: "#5A5A5A"
  paper-muted: "#C9C9C9"
  white-stock: "#FFFFFF"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(2.3rem, 4.6vw, 3.6rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "normal"
  body:
    fontFamily: "Karla, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  pill: "999px"
spacing:
  sm: "14px"
  md: "22px"
  lg: "24px"
  section: "84px"
components:
  button-primary:
    backgroundColor: "{colors.riso-yellow}"
    textColor: "{colors.riso-black}"
    rounded: "{rounded.sm}"
    padding: "14px 28px"
  button-secondary:
    backgroundColor: "{colors.riso-blue}"
    textColor: "{colors.uncoated-paper}"
    rounded: "{rounded.sm}"
    padding: "14px 28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.riso-black}"
    rounded: "{rounded.sm}"
    padding: "14px 28px"
  card-ticket:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.riso-black}"
    rounded: "{rounded.lg}"
  card-pricing-featured:
    backgroundColor: "{colors.riso-yellow}"
    textColor: "{colors.riso-black}"
    rounded: "{rounded.lg}"
---

# Design System: WebYello

## Overview

**Creative North Star: "The Riso Print Desk"**

WebYello's site reads like something pulled fresh off a risograph — a small print shop's duplicator loaded with exactly two ink drums, printing slightly out of register so the two colors overlap into a third wherever they meet. The drums are now **yellow and blue**, chosen to match the studio's own logo mark (a yellow-and-black badge with a dog mascot); their overlap prints a warm olive-green rather than the system's earlier pink-and-blue-made-purple. Everything else about the mechanism holds: a two-ink budget, hard flat shadows instead of soft ones (ink doesn't blur), and paper that's an honest uncoated gray-green rather than a warm designer cream.

This is the system's second recoloring. It first replaced an original neobrutalist yellow-and-black identity with a pink/blue duotone, then swapped pink for yellow to align with the logo — deliberately returning toward yellow, but through the same light, airy, two-drum mechanism rather than reverting to the old heavy black-on-cream neobrutalist look. The result keeps the airiness of the pink/blue era (light paper ground, generous whitespace, a bright accent trio) while reading as unmistakably one brand with the logo.

**Key Characteristics:**
- Exactly two saturated inks (yellow, blue) plus their overlap (olive) — never a fourth first-class color
- Flat, zero-blur, offset color shadows standing in for depth ("stickers peeling off the page")
- Alternating small rotations (±1–2°) on adjacent cards so nothing lines up too perfectly
- Cool, gray-green uncoated paper as neutral ground — deliberately not cream, even now that yellow leads
- No kicker/eyebrow labels above any heading, anywhere
- The nav/footer logo (`/logo.png`, yellow-and-black badge with a dog mascot) now matches the page palette natively — no more tracked exception

## Colors

Two inks and what they make when they overlap — nothing else is a first-class color in this system.

### Primary
- **Riso Yellow** (`#F7C600`): the loudest ink, sampled to match the logo. Primary CTA buttons, the hero's "smile" highlight, the featured pricing plan's full-bleed fill, one accent shadow color in the services/process grids.

### Secondary
- **Riso Blue** (`#0078BF`): the second ink drum, carried over unchanged from the previous palette. Pairs with yellow wherever the two need to visibly overlap (the hero's duotone blob), the alternate CTA/shadow accent, the care-plan strip fill.

### Tertiary
- **Overlap Olive** (`#5B8C3E`): the color the two drums make where they misregister — literally what yellow and blue produce under multiply blending in the hero blob. Used only as a third shadow/accent color in rotation — never as a fill of its own — so it reads as a byproduct of yellow+blue, not a fourth invented color.

### Neutral
- **Uncoated Paper** (`#E4E6E2`): page background. A cool, slightly gray-green stock, not a warm cream — held constant through both recolorings.
- **Riso Black** (`#1A1A1A`): body text, borders, dark section fills (process, footer). Matches the logo's black exactly.
- **Yellow Ink** (`#8A6D00`): a darker, text-safe variant of Riso Yellow for small text sitting on paper (process step numbers) where full-saturation yellow fails contrast.
- **Ink Muted** (`#404040`): secondary body copy on paper (hero lead, section descriptions, card body text, contact lead). One value — don't reintroduce a second near-identical gray for the same job.
- **Ink Faint** (`#5A5A5A`): fine print on paper (hero note, VAT note).
- **Paper Muted** (`#C9C9C9`): secondary body copy on dark ink sections (process section description).
- **White Stock** (`#FFFFFF`, tokens `--surface` / `--on-blue`): raised surfaces (tickets, plans, receipt, fields, the sketch window) and the only text colour used on riso blue (4.73:1). It is paper's brighter sheet, not a fourth ink.

### Named Rules
**The Role Rule.** Colour is assigned by job, and each job has a token. **Yellow** (`--selected`, primary buttons) means *act or chosen*. **Blue** (`--focus`) means *structure and focus*: focus rings, the sketch section, link-hover underlines, the caret. **Ink** carries text and every edge. **Olive** appears only where the drums overlap, as a shadow. **White stock** lifts a surface off the paper. A new use of a colour has to fit one of these jobs, and selection or state is never carried by colour alone: chosen chips and size cards also get a drawn check.

**The Two-Drum Rule.** The entire page is built from exactly two saturated inks plus what happens when they overlap. Before adding a new accent color, ask which of the two drums it's supposed to be — if the answer is "neither," it doesn't belong. The drums themselves can change (they already have, twice); the rule that there are only ever two has not.

**The No-Cream Rule.** Neutral ground is a cool uncoated paper (`#E4E6E2`), never a warm off-white/cream. Cream is the reflexive AI-template default this system explicitly rejects — this holds even now that the primary accent is warm yellow; the cool paper is what keeps the pairing from reading as a generic "sunny SaaS" cliché.

## Typography

**Display Font:** Bricolage Grotesque (with sans-serif fallback)
**Body Font:** Karla (with sans-serif fallback)

**Character:** a loud, slightly raw-edged display face (its letterforms carry visible construction quirks, like hand-set zine type) over a plain, warm humanist body face that stays out of the way for paragraphs and forms.

### Hierarchy
- **Display** (800, `clamp(2.3rem, 4.6vw, 3.6rem)`, 1.05): hero headline only.
- **Headline** (800, `clamp(1.85rem, 3vw, 2.4rem)`, 1.05): section headings (h2).
- **Title** (700–800, 1.05–1.4rem, 1.05): card and plan headings (h3), prices.
- **Body** (400, 1rem, 1.6): paragraph copy, form fields. Measure capped at the `.hero p` / `.lead` `max-width` (~32rem).
- **Label** (600–700, .74–.95rem, uppercase for nav only): nav links, buttons, badges, form labels.

### Named Rules
**The No-Eyebrow Rule.** No small tracked label ever sits directly above a heading as its own block. If a section needs a category word, it goes in a corner badge or nowhere — never as a kicker.

## Layout

Single content column capped at `max-width: 1140px` (`.wrap`), with 26px side gutters below that width. Section vertical rhythm is a flat 84px top and bottom, uninterrupted by an internal scale — density comes from the card grids inside each section, not from varying section padding.

Card grids use CSS Grid with a shared border as the gutter (services/process: `gap: 24px`/`22px`) rather than whitespace alone. Responsive breaks: 1000px drops the four process cards to two columns; 900px collapses 3–4 column grids to 2, stacks the contact form and the sketch/quote layouts, and swaps the inline nav (which needs ~770px) for a slide-down sheet under a hamburger, with the dock taking over the main action; 640px collapses everything to a single column, compacts the hero and the sketch mock, and raises reading text to 16px.

## Elevation & Depth

Flat, hard-edged color shadows only — no blur, ever. Depth reads as a printed sticker sitting slightly proud of the page: a solid-color rectangle offset 4–6px behind a card, using one of the three system colors (yellow/blue/olive) per card, rotated 1–2° so the shadow peeks out unevenly rather than symmetrically.

### Shadow Vocabulary
- **Card accent** (`box-shadow: 5px 5px 0 <accent>`): services tickets, alternating yellow/blue/olive per card.
- **Pricing accent** (`box-shadow: 6px 6px 0 <ink|olive>`): pricing plan cards, ink-colored for the featured plan, olive for the rest.
- **Button/form accent** (`box-shadow: 4px 4px 0 var(--ink)` or `6px 6px 0 var(--yellow)`): primary buttons and the contact form card.

### Named Rules
**The No-Blur Rule.** Nothing in this system ever combines a shadow with blur or a soft glow — ink doesn't blur on paper, and neither does this page's depth.

## Shapes

Gently rounded rectangles (6–10px radius) bordered everywhere in a consistent 2.5px ink stroke — the border, not the shadow, is what defines an element's edge. Pills (`999px`) are reserved for true toggles and badges only: the lang switch, the pricing "Most popular" ribbon, the hero's circular founding-date badge.

## Components

### Buttons
- **Shape:** 6px radius, 2.5px ink border, 14px/28px padding.
- **Primary:** yellow fill, ink text, hard ink shadow (`4px 4px 0`).
- **Secondary:** blue fill, paper text, same hard shadow.
- **Ghost:** transparent fill, ink text and border, no shadow.
- **Hover:** lift 2px (`translateY(-2px)`); no color change.

### Cards / Containers
- **Ticket (services):** white fill, 10px radius, 2.5px ink border, a circular "perforation" dot centered on the top edge, alternating ±1° tilt, one accent-color hard shadow per card cycling yellow → blue → olive.
- **Process card:** paper fill, same border/radius language, a large yellow-ink numeral leading each card, alternating tilt.
- **Pricing plan:** white fill (yellow fill for the featured plan), olive hard shadow (ink shadow if featured), corner ribbon badge for "Most popular" — never a label above the heading.
- **Internal padding:** 22–30px depending on card size.

### Sub-page Header
- **Where:** top of `services`, `pricing` (and `process`, without art). An h1 in Headline scale up to `3rem`, one lead paragraph, and a small two-blob yellow/blue multiply overlap on the right (hidden below 640px) that registers in like the hero's. On the dark process page the blobs are omitted, because multiply on ink reads as black.
- **Rule:** pages open with the header and go straight to content; no eyebrow above the h1 (the No-Eyebrow Rule holds on every page).
- **Nav state:** the current page's nav link gets a 3px ink underline (`aria-current="page"`); it must not rely on yellow, which is too faint on paper.
- **Link tickets:** on the homepage, the three "have a look around" tickets are whole-card links reusing the services ticket (tilt, perforation dot, colored hard shadow) with an underlined "See … →" line.

### Interactive Sketch (`#sketch`)
- **Section:** the one full-bleed riso-blue section, bordered top and bottom in 3px ink. White text on it stays at full white (never a tint) to hold contrast on the blue.
- **Sketch window:** white browser frame, 2.5px ink border, `8px 8px 0` yellow hard shadow, +1° tilt, a dashed "just a sketch" stamp on the corner. Inside, only yellow, blue and their multiply-overlap appear; layouts and which ink leads vary by trade.
- **Chips (trade / extras):** pill toggles with a 2.5px ink border and `3px 3px 0` ink shadow; selected = yellow fill and pressed-in shadow. Checkbox chips add a "✓" so selection never relies on color alone. Real radio/checkbox inputs sit invisibly on top, so focus rings are drawn on the chip (white on blue, blue on white).

### Quote Receipt (`#quote`)
- **Receipt:** white ticket in the same perforation-dot language as the services tickets, `6px 6px 0` blue shadow, -1° tilt, dashed ink rules between package, lines and total. The total is a yellow "stamp" that re-prints (clip-path wipe, no blur) whenever the package changes.
- **Size cards:** full-width rows with a 2.5px border and `4px 4px 0` ink shadow; selected = yellow fill.
- **Content rule:** the receipt may only show published package prices (see PRODUCT.md). Anything not priced is labelled "quoted on the call", never estimated.

### Inputs / Fields
- **Style:** 2.5px ink border, 8px radius, white fill.
- **Focus:** border color shifts to riso blue; no glow, no outline ring.
- **Labels:** display-font, 700 weight, sit directly above the field.

### Navigation
- **Style:** sticky top bar, 3px ink bottom border, paper background carried through scroll.
- **Default:** uppercase label type, .95rem, 600 weight; wordmark is the logo badge image (`/logo-480.png`, a 2x copy of the `/logo.png` master, with width/height set; 44–80px nav / 32px footer), not a text-plus-dot mark.
- **Language toggle:** pill-shaped two-button group, ink fill + paper text on the active language.
- **Mobile:** links collapse behind a 44×44px hamburger at 900px and below; the menu slides down as a full-width paper sheet with the same ink border language. The language toggle stays in the bar with 44px targets.
- **Dock (900px and below):** a fixed bottom bar on paper with a 3px ink top border keeps the main action in thumb reach ("Start a project"; on pricing, the live package and price beside "Send this quote"). It steps aside while the contact form is on screen.

## Do's and Don'ts

### Do:
- **Do** keep the color vocabulary to exactly yellow, blue, and their olive overlap — the Two-Drum Rule.
- **Do** use uncoated paper (`#E4E6E2`) as the neutral ground, never a warm cream — the No-Cream Rule.
- **Do** give every shadow a hard, zero-blur edge — the No-Blur Rule.
- **Do** put any "featured"/"popular" style badge in a corner ribbon, positioned absolutely, never stacked above a heading in normal flow.
- **Do** keep body copy in Karla and every headline/label in Bricolage Grotesque; don't mix in a third typeface.
- **Do** use `--yellow-ink` (`#8A6D00`), never full-saturation yellow, for any small text — full yellow only passes contrast at large/bold sizes or as a fill behind ink text. `--yellow-ink` is 3.92:1 on paper, so keep it to large numerals and to text on white stock (4.92:1); hover states stay ink and change their underline instead.
- **Do** draw marks (the check in chips, size cards, plan lists, the receipt and the success badge is one masked SVG in `currentColor`) and never use Unicode glyphs as icons.
- **Do** theme the browser surfaces from the palette: caret, form-control accent, scrollbar and selection.

### Don't:
- **Don't** add a kicker or eyebrow label above any heading, page-level or component-level — the No-Eyebrow Rule, learned the hard way during this build.
- **Don't** soften a shadow with blur, or combine a shadow with a glow.
- **Don't** introduce a fourth accent color; if something needs a new color, it's a tint of yellow, blue, or olive, not a new hue.
- **Don't** use sharp (0px) or fully pill-shaped corners on cards — reserve full pills for toggles and badges only.
- **Don't** revert to the original neobrutalist yellow-and-black system just because yellow is back — the light paper ground, the two-drum overlap mechanic, and the no-eyebrow/no-blur rules are what keep this feeling airy rather than heavy.
