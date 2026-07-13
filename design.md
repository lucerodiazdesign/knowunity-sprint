# design.md — Knowunity design tokens

Source: Figma **`Yummy_Knowie_Lucero`** (`TurkFO3G27tGwaRIQAbp98`). Tokens read directly from the file's
variable collections, text styles, and effect styles via the Figma Plugin API (not sampled, not guessed).
Prototype target: **mobile, 390px, dark mode only.** Token names below are the **exact Figma names** — wire
them 1:1 to CSS variables / Tailwind theme keys.

> **Correction note:** an earlier draft of this file claimed the Figma had no variables/text styles. That was
> wrong — it came from checking only nodes that happened to be flat screenshots. The file has a full token
> system, documented below.

## What's defined (inventory)

| Collection / style set | Count | Modes | Purpose |
|---|---|---|---|
| `Semantic color token` | 55 | **Dark** | The tokens you build with (background, text, interactive, accents, feedback, mascot). |
| `Color primitives` | 260 | Mode 1 | Raw ramps (Tailwind-style scales + the bespoke **Homie** brand ramp). Semantics alias into these. |
| `Size` | 40 | Default | Space, radius, stroke, icon, illustration sizes. |
| `Responsive` | 4 | Desktop / Mobile / Tablet | Breakpoint width + scale factor (Mobile width = 375). |
| Text styles (`Greed/…`) | 19 | — | The type ramp. |
| Effect styles | 15 | — | 6 drop shadows, 6 inner shadows, 3 blurs. |
| Paint styles | 4 | — | 3 gradients (`Pro`, `BG Top`, `BG Top Modal`) + image placeholder. |

There is **one color mode: `Dark`.** No light-mode semantic set exists in this file (light-mode mockups appear
in the deck but aren't tokenized) — fine, since the prototype is dark-only.

---

## 1. Color — Semantic tokens (dark mode)

These are the **real tokens to style with**, grouped by purpose. Hex is the fully-resolved value (aliases
followed to primitives). `A0.xx` = alpha. The system uses a **bold / onBold / subtle / onSubtle** quad per
accent — `bold` = the strong fill, `onBold` = content on top of it, `subtle` = tinted background, `onSubtle`
= content on the subtle background.

### Backgrounds
| Token | Hex | For |
|---|---|---|
| `background/page` | `#090C18` | App base / page background (dark navy-black). **This is the canonical dark base** — use it, not the `#0A0A0B` I'd sampled off a screenshot. |
| `background/surface` | `#22242F` | Raised surfaces: cards, sheets, control backgrounds. |
| `background/floating` | `#3D3D3D @ 60%` | Floating elements (menus, toasts) over content. |
| `background/stacking` | `#FFFFFF @ 10%` | Stacked/overlay layer tint on dark. |
| `background/scrim` | `#0A0A0A @ 50%` | Modal/dialog scrim behind overlays. |
| `background/inverse` | `#F4F2FF` | Inverse (light) background block on a dark screen. |

### Text
| Token | Hex | For |
|---|---|---|
| `text/primary` | `#F4F2FF` | Primary text / headings (near-white, faint violet tint). |
| `text/secondary` | `#F5F3FF @ 68%` | Secondary / supporting copy. |
| `text/disabled` | `#FFFFFF @ 40%` | Disabled / lowest-emphasis text. |
| `text/inverse` | `#090C18` | Text on light/inverse surfaces. |
| `text/link` | `#9178E6` | Links (brand purple). |

### Interactive (buttons / controls)
| Token | Hex | For |
|---|---|---|
| `interactive/primary` | `#F4F2FF` | Primary button fill — **near-white** in the new brand (with dark text). |
| `interactive/onPrimary` | `#090C18` | Label/icon on a primary button. |
| `interactive/secondary` | `#FFFFFF @ 10%` | Secondary/ghost button fill. |
| `interactive/onSecondary` | `#F4F2FF` | Label on secondary button. |
| `interactive/destructive` | `#FF6B6B` | Destructive action. |
| `interactive/disabled` | `#FFFFFF @ 10%` | Disabled control fill. |
| `interactive/pressed` | `#FFFFFF @ 10%` | Pressed state (on dark). |
| `interactive/pressedInverse` | `#0A0A0A @ 10%` | Pressed state (on light). |

> Note: the new-brand **primary CTA is light** (`#F4F2FF` on `#090C18` text). The purple "Continue" button in
> the older screenshots maps to **`accent/brand/bold`** (below), not `interactive/primary`. Decide per-screen
> which you want; for Voice Recall the brand-purple primary reads more on-brand.

### Brand & mascot
| Token | Hex | For |
|---|---|---|
| `accent/brand/bold` | `#9178E6` | **Primary brand purple** (Homie/Inkwell) — headline accents, brand CTAs. |
| `accent/brand/onBold` | `#0E0A18` | Content on brand-bold. |
| `accent/brand/subtle` | `#15103A` | Tinted brand background (chips, subtle fills). |
| `accent/brand/onSubtle` | `#7B65E0` | Content on brand-subtle. |
| `mascot/primary` | `#9178E6` | Knowie/Noe body fill (same Inkwell purple). |
| `mascot/eyes` | `#FFFFFF` | Mascot eye whites. |
| `mascot/pupils` | `#0A0A0A` | Mascot pupils. |

### Accent families (for stat cards, tags, illustration)
Each has `bold` / `onBold` / `subtle` / `onSubtle`. Bold values:
| Family | `bold` | `subtle` | For |
|---|---|---|---|
| `accent/coral` | `#FB7E5B` | `#512E2C` | Warm accent. |
| `accent/magenta` | `#E879C0` | `#380D29` | Pink/magenta accent. |
| `accent/blue` | `#5FA0FC` | `#0A1635` | Blue accent (e.g. "Time" stat). |
| `accent/green` | `#00C386` | `#0A2E22` | Green accent (e.g. "Perfect"). `onBold` = `#0A1F18` (dark ground for a pass tag). |

### Feedback / states
| Token | Hex | For |
|---|---|---|
| `feedback/success/bold` | `#00C386` | **Correct** / pass. |
| `feedback/success/subtle` | `#0A2E22` | Success background. |
| `feedback/success/onSubtle` | `#4AE5B0` | Text on success-subtle. |
| `feedback/error/bold` | `#FF6B6B` | **Incorrect** (transient verdict only — no persisted `fail` state, per CLAUDE.md). |
| `feedback/error/subtle` | `#532831` | Error background. |
| `feedback/error/onSubtle` | `#FCA5A5` | Text on error-subtle. |
| `feedback/error/onBold` | `#2A0808` | Dark ground for an error tag (bold text on onBold bg). |

### Pro / premium (gold) — likely out of scope, included for completeness
`pro/bold` `#F5B53D` · `pro/onBold` `#2A1D04` · `pro/subtle` `#3A2D0B` · `pro/onSubtle` `#FCD34D`.

### Borders
`border/default` = `#FFFFFF @ 10%` — the only border token (hairline on dark). No opaque neutral border token.

---

## 2. Color — Primitives (underlying ramps)

Semantics alias into these; use semantics in the build, reach for primitives only when no semantic fits.
**23 families × ~11 steps (50→950):** Neutral, Neutral Transparent, Red, Orange, Amber, Yellow, Lime, Green,
Emerald, Teal, Cyan, Sky, Blue, Indigo, Violet, Purple, Rose, Pink, `Fucksia` *(sic — misspelled in the file,
flag to the token owner)*, plus bespoke brand families **Homie, Sage, Navy, Cream**. Generic ramps follow
standard Tailwind values (e.g. `Neutral/950 #0A0A0A`, `Neutral/0 #FFFFFF`).

### Homie — the Knowunity brand ramp (bespoke, 17 swatches)
This is the distinctive brand palette (named after the mascot). The most load-bearing values:
| Primitive | Hex | Notes |
|---|---|---|
| `Homie/Inkwell` | `#9178E6` | **The** brand purple — mascot + brand accent + links. |
| `Homie/Inkwell shade` | `#BF90E4` | Lighter lilac shade. |
| `Homie/Inkwell CTA` | `#36278B` | Deep purple for CTA depth/pressed. |
| `Homie/Violet` | `#CD99F8` | Light violet. |
| `Homie/Ballpoint` | `#3713CB` | Deep blue-purple. |
| `Homie/Ultramarine` | `#001FDF` | Vivid blue. |
| `Homie/Neutral Dark` | `#090C18` | Brand near-black = `background/page`. |
| `Homie/Neutral Dark 2` | `#161A26` | Second dark surface. |
| `Homie/Neutral` | `#CBD0CC` | Warm light neutral. |
| `Homie/Neutral Light` | `#F4F1EB` | Cream-white. |
| `Homie/Yellow` | `#F6FF7D` | Highlighter yellow. |
| `Homie/Blue` | `#92CAFF` | Soft blue. |
| `Homie/Green` | `#BCFA83` | Lime green. |
| `Homie/Pink` | `#F8ADE1` | Soft pink. |
| `Homie/Highlight - Dark` | `#FECF01` | Gold highlight. |
| `Homie/Highlight - Light` | `#DEE87A` | Yellow-green highlight. |
| `Homie/Eyes` | `#0A0A0A` | Mascot pupils. |

---

## 3. Type scale — `Greed/…` (19 text styles)

**⚠️ Font reconciliation needed.** Every text style is named `Greed/…` and the Figma resolves the family to
**`ADLaM Display` (Regular)**. That means the intended brand font is **Greed** (a display typeface — this is
the deck's "A BOLDER FONT" direction), and **ADLaM Display is the substitute** shown because Greed isn't
installed in this environment. Meanwhile the project brief/CLAUDE.md specifies **Inter Variable**. So:
- **Display / headlines → Greed** (confirm you have a licensed webfont; else pick a close rounded-bold fallback).
- **Body / UI → Inter Variable** (per brief) — note the file does *not* define an Inter text-style ramp, so the
  numeric ramp below is the Greed ramp; apply the same sizes to Inter for body if you split the fonts.
- Every style's weight shows as `Regular` (Greed's own weight); the "Bold"/"Regular" suffix in the names is the
  intended emphasis, not a Figma weight — confirm the real weights with the token owner.

| Style | Size | Line height | Tracking | Use |
|---|---|---|---|---|
| `Greed/Display L` | 103 | 104 | -1% | Hero display (rare on mobile). |
| `Greed/Display M` | 76 | 76 | -1% | Large display. |
| `Greed/Display S` | 59 | 60 | -1% | Display. |
| `Greed/Headline XL` | 44 | 44 | -1% | Big screen title. |
| `Greed/Headline L` | 33 | 36 | -1% | Screen title. |
| `Greed/Headline M` | 28 | 28 | -1% | Section / celebration title ("Amazing job!"). |
| `Greed/Headline S` | 21 | 24 | 0% | Subsection title. |
| `Greed/Headline XS Bold` / `Regular` | 18 | 20 | 1% | Card title. |
| `Greed/Headline XXS Bold` / `Regular` | 15 | 16 | 1% | Small title. |
| `Greed/Body M Bold` / `Regular` | 18 | 24 | 1% | Primary body. |
| `Greed/Body S Bold` / `Regular` | 15 | 20 | 1% | Secondary body. |
| `Greed/Caption M Bold` / `Regular` | 12 | 16 | 1% | Captions / labels ("XP", "Time"). |
| `Greed/Caption S Bold` / `Regular` | 9 | 12 | 1% | Micro labels. |

All sizes in px. On a 390px mobile screen, expect `Headline M/S`, `Body M/S`, and `Caption M` to do most of the work.

---

## 4. Spacing, radius, stroke, icon, illustration (`Size` collection, px)

### Spacing — `Space/*` (bind to gap/padding/margin)
| Token | px | Token | px |
|---|---|---|---|
| `Space/0` | 0 | `Space/600` | 24 |
| `Space/050` | 2 | `Space/700` | 28 |
| `Space/100` | 4 | `Space/800` | 32 |
| `Space/150` | 6 | `Space/1200` | 48 |
| `Space/200` | 8 | `Space/1600` | 64 |
| `Space/300` | 12 | `Space/2400` | 96 |
| `Space/400` | 16 | `Space/4000` | 160 |
Negative gaps also exist for overlap layouts: `Negative 100/200/300/400/600` = -4/-8/-12/-16/-24.

### Radius — `Radius/*`
| Token | px | Use |
|---|---|---|
| `Radius/100` | 4 | Small chips. |
| `Radius/150` | 6 | — |
| `Radius/200` | 8 | Inputs / small cards. |
| `Radius/400` | 16 | Cards. |
| `Radius/600` | 24 | Large cards / sheets. |
| `Radius/800` | 32 | XL cards (flashcard). |
| `Radius/900` | 36 | — |
| `Radius/Full` | 9999 | Pills (CTAs), circular icon buttons. |

### Stroke — `Stroke/*`
`Stroke/Border` = 1px · `Stroke/Heavy Border` = 2px.

### Icon sizes — `Icon/*`
8 · 12 · 16 · 20 · 24 · 32 px.

### Illustration / mascot sizes — `Illustration/*`
40 · 64 · 120 · 200 · 320 px (use for Knowie sizing on celebration/result screens).

---

## 5. Elevation — effect styles

### Drop shadows (`Drop Shadow/*`, color ≈ `#0C0C0D`)
| Token | Layers (x,y,blur,spread @ alpha) | Use |
|---|---|---|
| `Drop Shadow/100` | 0,1,4,0 @5% | Subtle lift. |
| `Drop Shadow/200` | +0,1,4 @10% | Cards. |
| `Drop Shadow/300` | 0,4,4,-1 @5%+10% | Raised cards. |
| `Drop Shadow/400` | 0,16,32,-4 @10% | Floating / sheets. |
| `Drop Shadow/500` | 0,16,16,-8 @10% | Popovers. |
| `Drop Shadow/600` | 0,16,32,-8 @40% | Modals (strong). |
Inner shadows `Inner Shadow/100–600` exist for inset/pressed treatments.

### Blurs
`Blur/Overlay` = 4px background blur · `Blur/Glass` = 32px background blur (glassmorphism) · `Blur/Layer` = 4px layer blur.

### Gradients (paint styles)
`Gradient/Pro` (premium gold sheen), `Gradient/BG Top`, `Gradient/BG Top Modal` (top-of-screen background washes).

---

## 6. How the UI is composed (patterns from the real screens)

Composition read from the actual product screenshots in the file (exam/quiz flow — the path Voice Recall lives in).

### Screen shell / nav
- **Focus mode, minimal chrome.** The exam/quiz flow **hides the app's bottom tab bar.** Each screen has a small
  top bar: circular dark icon button **left** (close `✕`), a **progress bar** center, circular dark icon button
  **right** (settings `⚙`). Icon buttons use `background/surface`, `Radius/Full`, `Icon/200`–`Icon/250`.
- A centered **"Knowunity" blue pill** logo sits in the top status area on some screens.
- Layout is **single-column, vertically centered**, with the primary action **pinned near the bottom** and
  ~`Space/600` (24px) horizontal page padding. → Reuse this exact shell for Voice Recall.

### Cards & lists
- **Flashcard = stacked-card metaphor:** an active card (brand teal/blue) on top of 1–2 offset cards peeking
  behind (uses negative-space `Space/Negative *` offsets + `Radius/800`). Small swap icon top-right.
- **Stat cards:** a horizontal row of 3 equal rounded cards (`Radius/400`), each keyed to an accent family
  (`accent/*` or `feedback/*`) — colored label + icon + value (`⚡ +10`, `🎯 100%`, `⏱ 0:19`). → Reuse directly
  for the Voice-Recall **summary** (explained-on-your-own count, XP), honoring "no score / no mastered."

### Buttons
- **Primary CTA:** full-width **pill** (`Radius/Full`). New-brand token is light (`interactive/primary`
  `#F4F2FF` + `interactive/onPrimary` text); the on-brand purple alternative is `accent/brand/bold` `#9178E6`.
- **Binary answer controls:** two large pills — destructive `#FF6B6B` (X) and success `#00C386` (check) on
  `background/surface` grounds.
- **Tertiary:** plain text link in `text/link` `#9178E6` (e.g. "Skip") — always reachable, low emphasis.

### Mascot (Knowie / "Noe")
- The purple mascot is the **emotional centerpiece** on celebration / streak / result beats: large, centered,
  sized from `Illustration/*` (≈200–320px). Fill `mascot/primary`, eyes `mascot/eyes`, pupils `mascot/pupils`.
- In Voice Recall the mascot replies in **text only** (per spec) but can anchor the verdict/summary beats.

### Rhythm
- Airy and calm: one focal element per screen (mascot or card), generous gaps (`Space/600`–`Space/1200`)
  between title → subtitle → action. Keep the two-beat verdict→hint pause breathing in this same roomy rhythm.

---

## 7. Build notes

- **Style only from tokens** (CLAUDE.md rule). Suggested wiring: expose semantics as CSS vars named after the
  Figma tokens — `--background-page`, `--text-primary`, `--accent-brand-bold`, `--feedback-error-bold`,
  `--space-400`, `--radius-full`, etc. — so code mirrors the design source 1:1.
- **Dark base = `#090C18`** (`background/page`). Ignore the `#0A0A0B` from my earlier screenshot sampling.
- **Resolve the font question before locking type:** Greed (display) vs Inter Variable (body) — the file only
  defines the Greed ramp; confirm licensing + the Inter split with the token owner.
- **Two file typos to flag upstream:** primitive family `Fucksia` (should be *Fuchsia*); text-style weights all
  read `Regular` despite `Bold`/`Regular` name suffixes.
