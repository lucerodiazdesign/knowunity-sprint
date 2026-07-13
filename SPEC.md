# SPEC.md — Knowunity Voice Recall (Flow 2A) build plan

A declarative build plan for the Voice Recall prototype. A fresh session should be able to
follow this end-to-end without the designer in the room. Read it alongside the source files —
this spec **decides** the open questions; those files hold the full rationale and tokens.

- **Concept & flow rationale:** [sprint-context.md](sprint-context.md)
- **Tokens (colors, type ramp, spacing, radius, shadows):** [design.md](design.md) — *the only source of visual values*
- **Build rules (native feel, a11y, mocking):** [prototype-rules.md](prototype-rules.md)
- **Motion presets & recipes:** [motion-guide.md](motion-guide.md)
- **Invariants that must not be violated:** [CLAUDE.md](CLAUDE.md)

> This is a **test prototype**: the recall intelligence is **mocked and deterministic**. No real
> speech-to-text, audio capture, model, or API — ever. Knowie replies in **text only**. Happy path only.

---

## 0. Decisions locked in this interview

| Question | Decision |
|---|---|
| Visual reference + mascot | **Mascot delivered** — 17 Knowie pose PNGs + 1 iOS mic-permission mockup now in `public/images/` (mapped to states in §8). **`reference/` frames still pending** — screen-layout build stays gated on them (see §2). |
| Screen model | **One morphing Recall screen** holds the whole per-term loop; **intro** is an overlay sheet, **Summary** is a pushed route. Retry queue reuses the Recall screen. |
| Demo length & path | **3 terms**, tighter path (see §7). |
| Term content | **Biology**, copy drafted in this spec (§7) for designer approval. |
| Mic gesture | **Tap to start, tap to stop** → review take → explicit **Send**. No auto-endpointing. |
| Text fallback | Secondary **"Type instead"** link on **Idle only** → **bottom sheet** with input + Send. Same judge, ladder, terminal states. |
| Reveal UI | Opens an **AI-chat-styled drawer** (bottom sheet) showing Knowie's full written answer + a Continue CTA. Same drawer for opt-in "See answer" and automatic retry reveal. |
| Typography | **Inter Variable everywhere** (display + body), applying the Greed numeric ramp from design.md. Rationale below; Greed swap deferred. |
| Primary CTA | **Light button** — `interactive/primary` `#F4F2FF` fill, `interactive/onPrimary` `#090C18` text. Purple reserved for mascot + accents. |
| Entry / first run | **Always show intro** (soft-gate sheet → **mocked** mic primer, no real OS prompt) → Idle. No persistence — fresh for every tester. |
| Summary exits | **Continue** → collect-XP beat → reset to the very start (intro), ready for the next tester. **Try again** → replay **only the missed terms** (non-`unaided_pass`). |

**Typography rationale:** design.md flags a conflict — the Figma ramp is named *Greed* (a display face,
shown via ADLaM Display) while the brief specifies *Inter Variable*. Inter is freely licensable, needs no
font-file handoff, and deploys clean to Vercel, so the build uses **Inter Variable for all text**, applying
the Greed size/line-height/tracking values from design.md §3. If Greed is later licensed, it can be swapped
in for display/headline styles only — keep headline styles in their own CSS class so the swap is one place.

---

## 1. Stack & scaffold

- **Framework:** Next.js (App Router) + TypeScript.
- **Styling:** Tailwind CSS, themed **only** from design.md tokens (see §4). No raw hex, no inline styles.
- **Animation:** Motion (`npm install motion`, import from `motion/react`). Every file using it needs `"use client"`.
- **Font:** Inter Variable (self-hosted via `next/font` — no external font CDN).
- **Deploy target:** Vercel.
- **Viewport:** mobile only, **390px** wide, full height, **dark mode only**. No desktop/responsive breakpoints.

**Commands (fill in once scaffolded, then record back into [CLAUDE.md](CLAUDE.md)):**
- Install: `npm install`
- Dev (local preview — start this so the designer can watch it build): `npm run dev`
- Build: `npm run build`
- Deploy: Vercel (push to connected repo, or `vercel`).

---

## 2. Asset gate (blocking — do not skip)

The definition of done is "matches my Figma frames," and the rules say match `reference/` screenshots and pull
the mascot from `/public/images/`.

**Mascot: delivered.** `public/images/` now holds the full Knowie set (18 files, mapped to states in §8).
**`reference/` frames: still pending.** Screen-layout build is gated on them. Before building any screen:

1. Confirm `reference/` contains the Figma frame exports for: intro sheet, mic primer, idle, recording,
   review-take, processing, verdict, verdict+hint, reveal drawer, retry-queue term, summary.
2. **Before building each screen, open its matching frame in `reference/` and match its layout and feel.**
3. If a frame is missing when its screen comes up, **pause and ask** — do not invent the layout.

**Image rule (strict):** the **only** images used are files that actually exist in `public/images/` (enumerated
in §8), referenced as `/images/[filename]`. **No** placeholder image URLs, external URLs, or made-up paths —
ever. Never reference an `/images/...` path whose file isn't in the §8 list.

---

## 3. Screen architecture

Four surfaces total. Everything else is state within them.

1. **Intro (overlay sheets over a dimmed Idle):** soft-gate intro bottom sheet → mocked mic-permission primer.
   Skippable in one tap. Shown on every fresh load, then dismissed to reveal Idle.
2. **Recall screen (the morphing core):** a single route that holds the entire per-term loop as animated
   internal states (§5). The end-of-session **retry queue reuses this same screen** — same states, different
   term set and hint level. Persistent top bar + progress here.
3. **Summary (pushed route):** per-term breakdown + unaided count + XP, with Continue / Try again.
4. **Two bottom sheets** layered over the Recall screen when invoked:
   - **Text-fallback sheet** (from the Idle "Type instead" link).
   - **AI-chat reveal drawer** (Knowie's full written answer).

**Connections:**
`Intro sheet → (skip or continue) → mic primer → (Allow, mocked) → Idle`
`Recall loop per term → Verdict → branch (§5) → next term`
`After last main-pass term → retry queue (same screen) → Summary route`
`Summary: Continue → XP beat → reset to Intro · Try again → Recall loop with missed terms only`

---

## 4. Token wiring (from design.md)

Expose semantics as CSS variables named after the Figma tokens, then map them into Tailwind theme keys. Use
semantics in the build; reach for primitives only when no semantic fits. Dark base is **`#090C18`**
(`background/page`) — never the old `#0A0A0B`.

Minimum set this flow needs (all from design.md):
- **Backgrounds:** `background/page` `#090C18`, `background/surface` `#22242F` (cards/sheets/controls),
  `background/scrim` (modal scrim behind sheets).
- **Text:** `text/primary` `#F4F2FF`, `text/secondary` (68%), `text/inverse` `#090C18` (on light buttons),
  `text/link` `#9178E6` (Skip / secondary links).
- **Interactive:** `interactive/primary` `#F4F2FF` + `interactive/onPrimary` `#090C18` (**primary CTAs**),
  `interactive/secondary` (ghost fill) + `interactive/onSecondary`.
- **Mascot:** `mascot/primary` `#9178E6`, `mascot/eyes` `#FFFFFF`, `mascot/pupils` `#0A0A0A`.
- **Brand accent:** `accent/brand/bold` `#9178E6`, `accent/brand/subtle` `#15103A` (chips/tints).
- **Feedback (transient verdict copy only):** `feedback/success/*` (`bold #00C386`) for pass;
  `feedback/error/*` (`bold #FF6B6B`) for the "not quite" verdict. **Never persist a fail state** (§6).
- **Sizing:** `Space/*` for gap/padding (page padding `Space/600` = 24), `Radius/Full` (pill CTAs, circular
  icon buttons), `Radius/600` (sheets), `Radius/400` (cards/stat cards), `Radius/800` (any flashcard).
- **Stroke:** `border/default` `#FFFFFF @10%` hairline.
- **Elevation:** `Drop Shadow/400` for sheets/floating, `Drop Shadow/600` for modal-strength.
- **Icon sizes:** `Icon/*` (16/20/24). **Illustration sizes:** `Illustration/*` (200–320) for the mascot on
  verdict/summary beats.

---

## 5. The state machine (per-term loop)

Implement as an explicit state machine on the Recall screen. **Terminal states are exactly four** —
`unaided_pass`, `passed_with_hints`, `revealed`, `skipped`. **There is no `fail` state**; "fail"/"not quite"
is transient verdict copy that drives tone and is never stored.

States and transitions:

1. **Idle** — term shown, mic ready (large, the one focal control). Below the mic, low-emphasis
   **"Type instead"** link (→ fallback sheet, §8) and an always-reachable **Skip** link (→ logs `skipped`,
   advances). Top bar: close `✕` left, progress bar center, settings `⚙` right (settings is decorative/no-op).
2. **Recording** — entered by tapping the mic. Unmistakable live state: calm looping pulse (scale 1↔1.08) +
   a label/shape change (not color alone). Mic now acts as a **stop** control. No auto-endpointing.
3. **Review take** — tapping stop shows the **canned transcript** (what the student "said", §7) with an
   explicit **Send** (primary) and a way to redo. Nothing is judged until Send.
4. **Processing** — a **staged/animated "thinking" state, not a spinner** (three sequenced dots or gentle
   shimmer). Mocked delay **≈1.5s** (target <4s). Mirrors the app's multi-step generating screen.
5. **Verdict beat** — the verdict copy appears **alone**, nothing else on screen (pass / not-quite). This is a
   **separate beat** from any hint.
6. **Branch — attempt 1 (the main pass):**
   - **`unaided_pass`** → short affirmation from Knowie → **auto-advance** after a short hold (~1.8s, tap to
     skip the hold) to the next term. No CTA, no hint.
   - **Miss** — a **partial** OR a **fully-wrong** answer → the verdict appears **inline** in a Knowie bubble
     with **Hint 1** below as a covered **"Little Hint"** card; the student **taps to reveal** the hint text in
     place — the tap is the deliberate forced-retrieval gate (it replaced the earlier timed ~2.5s pause).
     Partial and fully-wrong share this same inline-hint treatment, differing only in the heading
     (**"Almost there!"** vs **"Not quite"**) and whether a *what-you-covered* checkmark list is shown (partial:
     yes; fully-wrong: none). CTAs below: **Next** (primary) / **See answer** (ghost).
     - **Next** → term is queued into the **end-of-session retry queue**; advance to next term.
     - **See answer** → opens the answer reveal (§8), locks **`revealed`**, advances.
7. **Retry queue — attempt 2** (after all terms have had their main pass): every non-`unaided_pass` term is
   re-presented on the same Recall screen and the student records **once more**. This is the **final** attempt:
   - **Correct** → lock **`passed_with_hints`** → **pass sheet**, heading **"With a nudge"**.
   - **Not passed** — the backend may score this **partial** OR **fully-wrong** → **FAIL + answer reveal** in the
     **result sheet**: a **"Worth another look"** header over an **Answer card** holding Knowie's full written
     answer, locking **`revealed`**. **"partial" is never surfaced as its own screen** — any not-passed attempt-2
     result maps to this fail reveal. Two variants: **some-right** — the *what-you-covered* checkmark list
     **above** the Answer card; **all-wrong** — the Answer card only.
8. After the retry queue clears → push to **Summary**.

**Progress / XP:** XP **counts up per term** on the screen but is **collected only on completion** (the
Summary's Continue). Skip is reachable in every state that has a mic; it logs `skipped` and never shames.

---

## 6. Invariants (must hold — from CLAUDE.md / sprint-context)

- Four terminal states only; **no persisted `fail`**.
- On an **attempt-1 miss** (partial OR fully-wrong) the hint is a covered **"Little Hint"** card revealed by **tap** (the deliberate forced-retrieval gate).
- The backend scores **pass / partial / fail** on either attempt (partial **can** occur on attempt 2), but the user is **never shown "partial" as its own screen**. The verdict heading is one of **three presentation labels**, driven by *(passed? + which attempt)*:
  - **"On their own"** — passed on attempt 1, no hint → **pass sheet**.
  - **"With a nudge"** — passed on attempt 2, after the hint → **pass sheet**.
  - **"Worth another look"** — not passed after attempt 2 (partial or fully-wrong) → **fail reveal** (some-right / all-wrong).
- **Hint 1** is the attempt-1 miss hint (main pass). Attempt 2 shows **no hint** — a non-correct retry goes straight to the **answer reveal**. (Supersedes the earlier "Hint 2 on the retry" model.)
- Retry-queue second-miss reveal is **automatic**; the main-pass "See answer" is a **separate opt-in** — keep both.
- Push-to-talk needs an **explicit Send**; no auto-endpointing / speech-end detection.
- `unaided_pass` **auto-advances**; all other states wait on a CTA.
- Processing is **staged/animated, not a spinner**; target <4s (mock ≈1.5s).
- Summary **never** shows a score or "mastered" — "explained X of Y on your own" + path-based labels only.
- **Skip always reachable**, logs `skipped`, never dead-ends.
- Text fallback reachable in **one tap** on Idle; same judge, hint ladder, terminal states. ("Say it back"
  is voice-only; the typed path skips it.)

---

## 7. The deterministic mock script (3 Biology terms)

Fixed, identical every run. **Copy below is drafted for designer approval** — tone is short, friendly,
encouraging, never harsh even on a miss. Full answers are stored for every term even when not shown.

### Scripted path (what a tester experiences)
- **Term 1 — Photosynthesis → `unaided_pass`.** First take passes; short affirmation; auto-advances.
- **Term 2 — Osmosis → `revealed`.** First take misses → Hint 1 (tap to reveal) → tester taps **Next** →
  re-presented in the retry queue → misses again → **FAIL answer reveal** (Knowie steps in). No Hint 2.
- **Term 3 — Mitosis → `passed_with_hints`.** First take misses → Hint 1 → tester taps **Next** → re-presented
  in the retry queue → **passes** on the retry.
- **Skip** is present and functional as an always-visible control on every term, but no scripted term ends
  `skipped` (a tester can still choose to skip to see that face).
- **Summary result:** *"You explained 1 of 3 on your own."* (only Photosynthesis was unaided.)

### Copy table

**Term 1 — Photosynthesis** (`unaided_pass`)
- Prompt on card: **"Explain photosynthesis."**
- Canned transcript (take 1): *"It's how plants make their own food — they take in carbon dioxide and water,
  and using sunlight captured by chlorophyll they turn it into glucose and release oxygen."*
- Verdict (pass): *"Nailed it — that's clear and complete. 🌿"*
- Hints: none (auto-advance).
- Full answer (stored): *"Photosynthesis is how plants convert carbon dioxide and water into glucose and
  oxygen, using light energy absorbed by chlorophyll in the chloroplasts."*

**Term 2 — Osmosis** (`revealed` via retry auto-reveal)
- Prompt on card: **"Explain osmosis."**
- Canned transcript (take 1, miss): *"It's when water moves across a membrane from one side to the other."*
- Verdict (not-quite): *"Not quite — you're close on the setup."*
- **Hint 1:** *"Think about which way the water moves — and what it's moving toward."*
- (Tester taps **Next** → retry queue.)
- Canned transcript (retry, still miss): *"Water moves to the side that has more stuff dissolved in it?"*
- (Non-correct on attempt 2 → **FAIL answer reveal**, Knowie steps in — no Hint 2.)
- Full answer (shown in the result sheet's Answer card): *"Osmosis is the movement of water across a semipermeable membrane from a
  region of higher water concentration (lower solute) to lower water concentration (higher solute), until both
  sides balance. It's passive — no energy required."*

**Term 3 — Mitosis** (`passed_with_hints`)
- Prompt on card: **"Explain mitosis."**
- Canned transcript (take 1, miss): *"It's cell division — one cell splits into two."*
- Verdict (not-quite): *"Almost — you've got the splitting part."*
- **Hint 1:** *"What's true about the two cells you end up with?"*
- (Tester taps **Next** → retry queue.)
- Canned transcript (retry, pass): *"One cell divides into two genetically identical daughter cells, each with
  a full copy of the chromosomes."*
- Verdict (pass): *"There it is — 'identical' is the key word."*
- Full answer (stored): *"Mitosis is the division of a cell's nucleus into two genetically identical daughter
  cells, each with the same chromosome number as the parent. It's used for growth and repair."*

---

## 8. Components & the two sheets

Reuse design.md §6 patterns before inventing anything.

- **Screen shell / top bar:** focus mode, no bottom tab bar. Circular dark icon button left (close `✕`),
  progress bar center (reflects term position), circular dark icon button right (settings `⚙`, decorative
  no-op). `background/surface`, `Radius/Full`. Single-column, vertically centered, primary action pinned near
  the bottom, `Space/600` (24px) horizontal padding, safe-area insets via `env(safe-area-inset-*)`.
- **Mic control:** large circular button, the most-tapped control. `whileTap={{ scale: 0.94 }}` (snappy).
  Recording = looping pulse + shape/label change. ≥44×44 hit area.
- **Verdict block:** stands alone during the verdict beat; state read via **icon + shape + copy**, not color
  alone (success vs not-quite). Small spring entrance (gentle).
- **Hint block:** fades/slides in below the verdict after the pause (`opacity 0→1, y 8→0`, gentle). Carries the
  Next (primary light pill) + See answer (ghost) CTAs.
- **Stat cards (Summary):** horizontal row of rounded cards (`Radius/400`) keyed to accent families — e.g.
  `⚡ +30 XP` and `1 of 3 on your own`. No score, no "mastered."
- **Mascot (Knowie):** `<img>` from `/images/[filename]` (files listed below), sized `Illustration/*`
  (~200–320 for hero beats, `Icon/*`-scale for chat avatars). Meaningful alt text per pose. Replies in **text
  only** — never TTS, never a talking avatar.

**Knowie pose → state map** (use these exact files; all live in `public/images/`):

| State / beat | File | Why this pose |
|---|---|---|
| Intro soft-gate welcome | `/images/excited.png` | eager, eyes up — inviting first encounter |
| Mic primer | `/images/mic-permision.png` | purpose-built iOS permission mock with Knowie peeking over it |
| Idle (waiting for you to speak) | `/images/standby.png` | neutral, wide alert eyes — ready |
| Recording (listening) | `/images/knowie-bubble-mic.png` | head-in-circle with mic, eyes closed listening |
| Processing (thinking) | `/images/thinking.png` | pondering, considering tilt |
| Verdict — pass (`unaided_pass`, `passed_with_hints`) | `/images/approving.png` | warm, approving eyes |
| Verdict — not quite (miss) | `/images/questioning.png` | one curious narrowed eye — **curious, not harsh** |
| Hint beat | `/images/determined.png` | focused "you've got this" encouragement |
| Reveal drawer (Knowie steps in) | `/images/knowie-bubble.png` | helpful chat-avatar as Knowie writes the answer |
| Reveal drawer, warmer variant / typed-path avatar | `/images/knowie-bubble-1.png` | content, eyes-closed friendly chat avatar |
| Summary celebration | `/images/amazed.png` (lead); `/images/laughing.png`, `/images/giggling.png` (alts) | earned delight — **not** confetti |

**Never used on the happy path (documented):** `angry.png` (violates "never shames"), and `sad.png`,
`overIt.png`, `dazed.png` (deflated/off-tone for a recall win — reserved only for deferred edge states like a
judge error, which we are **not** building). Misses use `questioning`/`confused`/`determined`, never a harsh face.
- **Text-fallback sheet:** slides up from bottom (`sheet` spring, `y:"100%"→0`), grabber handle, text input +
  Send. Submitting runs the identical processing→verdict→hint ladder and terminal states as voice.
- **Answer reveal (attempt-2 FAIL):** rendered in the **result sheet** — a **"Not quite"** header
  (feedback/error, Headline M, header icon + thumbs) over an **Answer card** (stacking surface, 2px border
  `rgba(244,242,255,0.5)`, `Radius/600`, `Space/400` padding) holding the **Answer** label + Knowie's full
  written answer (Body S Regular), with **Why?** + **Got it** (feedback/error) CTAs. Two variants:
  **some-right** shows the *what-you-covered* checkmark list above the card; **all-wrong** shows the card only.
  Reached via the opt-in **See answer** or the automatic attempt-2 reveal (same sheet; only the trigger differs).

---

## 9. Motion (from motion-guide.md)

Define the presets once (`gentle`, `snappy`, `sheet`, `soft`) and reference everywhere. Recipes: mic press
`whileTap scale 0.94` (snappy); recording pulse (scale 1↔1.08, `repeat: Infinity, reverse, duration 1`);
processing = sequenced dots/shimmer ≈1.5s; Knowie's reply fades + slides up (gentle); result card small spring
(state distinguished by shape/icon/copy, **not** motion); sheets slide up with grabber (sheet); summary lines
stagger in (`staggerChildren 0.06`); screen-to-screen push slides from the right (soft/gentle). **Animate only
`transform`/`opacity`.** Respect `useReducedMotion()` → drop to simple fades. Keep it interruptible; one thing
moving at a time.

---

## 10. Out of scope / deferred (do NOT build)

Per sprint-context §6 and CLAUDE.md: no TTS / voice output; no auto-endpointing; no open Q&A / tutoring branch;
no weighted composite score; no pause/resume audio append; no entry points outside the Exam Plan; no AI Chat
history / "Created Things" card; no mid-answer language switch, mic-busy handling, or cross-session history.
Missing edge states (IN_PROGRESS node, mic-denied route, judge error, empty transcript) are **documented and
deferred, not built** — this is a happy-path build. Real mic permission is **mocked** (Allow button just
advances). Settings `⚙` is decorative.

---

## 11. Definition-of-done checklist

Verify the finished prototype against every line.

**Flow & states**
- [ ] Fresh load always opens the soft-gate **intro sheet** (skippable in one tap) → **mocked mic primer**
      (Allow just advances, no real OS prompt) → **Idle**.
- [ ] Core loop reads clearly: **Idle → Recording → Review take → Processing → Verdict**.
- [ ] Mic is **tap-to-start / tap-to-stop**; recording state is unmistakable (pulse + shape/label, not color
      alone); nothing is judged before **Send**.
- [ ] Processing is a **staged/animated** state (not a spinner), ≈1.5s.
- [ ] Verdict appears in its bubble; on a **partial** the hint is a covered **"Little Hint"** card revealed by
      **tap** (no timed pause), with **Next** + **See answer** below.
- [ ] `unaided_pass` **auto-advances** (short hold, tap to skip); all other states wait on a CTA.
- [ ] **Retry queue (attempt 2)** re-presents every non-`unaided_pass` term; a non-correct retry → **FAIL
      answer reveal** (some-right / all-wrong variants), no Hint 2.
- [ ] Both reveal paths exist: main-pass **"See answer"** opt-in **and** retry-queue **automatic** reveal, both
      via the **AI-chat drawer**, both locking `revealed`.
- [ ] Exactly the **four terminal states** are used (`unaided_pass`, `passed_with_hints`, `revealed`,
      `skipped`); **no `fail`** is ever persisted.

**Scripted content**
- [ ] Runs the **3 Biology terms** deterministically per §7 (Photosynthesis→unaided, Osmosis→revealed,
      Mitosis→passed_with_hints); identical every run.
- [ ] Copy matches the approved §7 table; Knowie's tone is short and encouraging, even on a miss.

**Fallback & skip**
- [ ] **"Type instead"** link on Idle opens a **bottom sheet**; the typed path works **end to end** through the
      same ladder and terminal states.
- [ ] **Skip** is reachable on every term, logs `skipped`, and never dead-ends or shames.

**Summary & exits**
- [ ] Summary shows **"explained 1 of 3 on your own"** + **path-based per-term labels** + XP — **no score, no
      "mastered."** XP is collected only here.
- [ ] **Continue** → XP-collect beat → resets to the **intro** (ready for next tester).
- [ ] **Try again** → replays **only the missed terms** (non-`unaided_pass`).

**Craft**
- [ ] Every screen was built against its **`reference/`** frame.
- [ ] Every Knowie image is an `<img>` to a real **`/images/[filename]`** from the §8 map — no invented,
      placeholder, or external paths; poses match the §8 state map.
- [ ] No shaming/off-tone pose (`angry`, `sad`, `overIt`, `dazed`) appears anywhere on the happy path; the mic
      primer uses **`/images/mic-permision.png`**.
- [ ] **All** color/type/space/radius values come from **design.md tokens** — no raw hex, no inline styles.
- [ ] Type is **Inter Variable** on the Greed size ramp; dark mode only; 390px; safe-area insets applied.
- [ ] Motion uses the shared presets; only `transform`/`opacity` animated; `useReducedMotion()` respected.
- [ ] A11y: body text ≥4.5:1, large ≥3:1; visible focus states; meaningful alt text; state never signalled by
      color alone; ≥44px touch targets with ≥8px spacing.
- [ ] Knowie replies in **text only** — no TTS, no audio, no talking avatar anywhere.
- [ ] Builds clean and **deploys to Vercel**; commands recorded back into CLAUDE.md.
