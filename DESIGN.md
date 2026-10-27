---
name: WebYello
description: A brand-new website design & development studio's marketing site
source: "Accessible Gold shadcn/ui theme by @dhxwhy (21st.dev), with two WebYello overrides: square corners, riso-blue links"
colors:
  background: { light: "oklch(0.985 0.006 92)", dark: "oklch(0.17 0.026 92)" }
  foreground: { light: "oklch(0.20 0.03 92)", dark: "oklch(0.965 0.008 92)" }
  card: { light: "oklch(1.00 0 0)", dark: "oklch(0.21 0.03 92)" }
  primary: { light: "oklch(0.84 0.163 92)", dark: "oklch(0.78 0.151 92)" }
  primary-foreground: { light: "oklch(0.20 0.03 92)", dark: "oklch(0.20 0.03 92)" }
  secondary: { light: "oklch(0.95 0.06 92)", dark: "oklch(0.28 0.054 92)" }
  accent: { light: "oklch(0.94 0.06 92)", dark: "oklch(0.31 0.06 92)" }
  muted: { light: "oklch(0.96 0.012 92)", dark: "oklch(0.26 0.025 92)" }
  muted-foreground: { light: "oklch(0.50 0.03 92)", dark: "oklch(0.72 0.03 92)" }
  border: { light: "oklch(0.91 0.015 92)", dark: "oklch(0.31 0.03 92)" }
  ring: { light: "oklch(0.52 0.101 92)", dark: "oklch(0.78 0.151 92)" }
  destructive: { light: "oklch(0.55 0.20 27)", dark: "oklch(0.68 0.19 27)" }
  link: { light: "#0078BF", dark: "#4DA3E0" }
typography:
  display: { fontFamily: "Bricolage Grotesque, system-ui, sans-serif", fontWeight: 800 }
  body: { fontFamily: "Karla, system-ui, sans-serif", fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 }
  mono: { fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontWeight: 500 }
rounded:
  all: "0"
---

# Design System: WebYello

## Overview

**North star: "Accessible Gold."** One saturated gold on a warm off-white page, every neutral tinted toward the same hue (92), square corners everywhere, and the riso blue kept as the single second voice for links. It replaces "The Riso Print Desk" (yellow/blue duotone, hard offset shadows, rotated stickers, cool paper). The same tokens live in the WebYello Design System artifact; keep the two in sync.

**Key characteristics**
- One hue family. `primary` (gold) carries every large colour field; `link` (riso blue) is the only other colour, and only for links and small accents.
- Square corners (`--radius: 0`). No pills, no rounded cards, no circles.
- No shadows and no rotation. Hierarchy comes from size, weight, colour fields, hairlines (`border`) and thick top rules.
- Light and dark are both first-class. Dark follows the visitor's system setting (`prefers-color-scheme`); `.dark` / `.light` on `<html>` force one.
- The site measures itself: the home hero shows this page's real load time, first content and page weight, read from the browser's Performance API.

## Colors

| Token | Job |
| --- | --- |
| `background` | Page ground. |
| `foreground` | Text, strong borders, the current nav underline, active language. |
| `card` | Cards, plans, the form, the receipt, inputs. |
| `primary` / `primary-foreground` | Gold fields: primary buttons, hero panel, the "smile" highlight, featured plan rule, selected chips and size cards, step numbers. Text on gold is always `primary-foreground` (dark). |
| `secondary` | Soft gold band: the sketch section, the care-plan strip. |
| `muted` | Quiet band: the quote section, the mock browser bar. |
| `accent` | Hover on chips and size cards. |
| `muted-foreground` | Secondary copy and fine print. |
| `border` | Decorative hairlines only. Controls use `foreground` or `muted-foreground` so their edge reaches 3:1. |
| `ring` | Focus outlines (3px). |
| `destructive` | Form send errors, always with text. |
| `link` | Links and small accents (ticket top rules). |

**Contrast (measured):** every text pair is ≥4.5:1 in both themes. `link` light `#0078BF` is 4.53:1 on `background` and 4.73:1 on `card`, but only 4.2:1 on `muted` and 4.1:1 on `secondary`, so **never put a link on `muted` or `secondary`**. That is why the contact section sits on `background`. `link` dark `#4DA3E0` is 5.3–7:1 on every dark ground.

## Typography

- **Display:** Bricolage Grotesque 800 for h1, 700 for h2/h3 and prices.
- **Body:** Karla 400; 700 for labels, nav, buttons (buttons are uppercase, tracked .06em).
- **Mono:** IBM Plex Mono 500 for numbers that are measurements or prices in the quote: the performance readout, size-card prices, step numbers, the mock URL.
- The source theme defines no fonts; these are carried over from the riso era and remain an open decision.

## Layout

`.wrap` caps content at 1140px with 24px gutters (16px on phones). Sections are 88px top and bottom (64px on phones). Breaks: 1000px (process to two columns), 900px (single-column hero, quote and contact; hamburger nav; bottom dock), 640px (everything one column).

## Components

- **Buttons:** square, 48px tall, uppercase label. Primary = gold fill; ghost = 2px `foreground` outline that fills on hover.
- **Tickets (services / home links):** `card` with a 6px top rule cycling foreground → gold → blue.
- **Process cards:** `card`, 44px gold square holding the step number in mono.
- **Plans:** `card` with list rows divided by hairlines; the featured plan gets a 2px `foreground` border, a 10px gold top rule and a square "Most popular" tag above its corner.
- **Chips and size cards:** 2px `foreground` border; selected = gold fill plus a drawn check (selection never relies on colour alone).
- **Receipt:** `card`, 2px border, 10px gold top rule, dashed rules between package and total, total stamped in gold.
- **Sketch mock:** browser frame in `foreground`; inside, only gold and foreground squares.
- **Sub-page header:** h1 + lead + two static squares (gold, foreground), hidden on phones.
- **Inputs:** 2px `muted-foreground` border, `foreground` on focus, 3px `ring` outline.
- **Nav:** sticky, `background`, hairline bottom; current page gets a 3px `foreground` underline.

## Do's and don'ts

- **Do** keep every corner square.
- **Do** keep gold for fields and blue for links; don't introduce a third hue.
- **Do** put text on gold in `primary-foreground` only.
- **Do** draw marks (one masked SVG check) rather than using glyphs as icons.
- **Don't** add shadows, blur, rotation or blend modes.
- **Don't** put `link` on `muted` or `secondary`.
- **Don't** use `border` as the only edge of an interactive control.
