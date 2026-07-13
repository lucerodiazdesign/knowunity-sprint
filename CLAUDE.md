# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This is a **pre-build design sprint** directory, not yet a codebase. It currently contains a single briefing file, [sprint-context.md](sprint-context.md), and no application code, build tooling, package manifest, tests, or git history. There are therefore **no build/lint/test commands yet** — they will be established when the implementation stack is chosen. When scaffolding, prefer whatever the briefing implies (mobile, dark mode, Inter Variable) and record the chosen commands back into this file.

## What is being built

**Knowunity Voice Recall (Flow 2A — Timed Hint Reveal).** A voice active-recall step embedded in the Exam Plan, positioned in-path *after the quiz, before the mock exam*. The student explains 3–5 key terms aloud; the AI character ("Knowie"/"Noe") replies in **text only** with a verdict, hints, and eventual reveal. Target platform: mobile, dark mode, Inter Variable font.

The full spec lives in [sprint-context.md](sprint-context.md) — read it before implementing. Key architecture below.

## Core flow (the state machine to implement)

Per-term loop: **Idle → Record (push-to-talk) → Review take → explicit Send → Processing → Verdict beat → branch**.
- `unaided_pass` → short affirmation → **auto-advance** to next term.
- **Attempt-1 miss** (partial OR fully-wrong) → verdict appears inline, then **Hint 1** as a covered "Little Hint" card the student **taps to reveal** (the tap is the forced-retrieval gate; the earlier timed 2–3s reveal is off in the UI — kept in code, not applied to any design).
- Session-level: every non-`unaided_pass` term is re-presented in an **end-of-session retry queue** (**attempt 2**). A non-correct retry → **answer auto-reveals** (fail answer reveal, no tap); correct → `passed_with_hints`. **There is no Hint 2.**
- Ends in a **Summary** (per-term breakdown + unaided count → Continue/Try again).

## Load-bearing design invariants

These are decisions, not suggestions — violating them breaks the product intent:

- **Four terminal states only:** `unaided_pass`, `passed_with_hints`, `revealed`, `skipped`. There is **no `fail` state** — "fail" is a transient verdict that drives copy and never persists.
- **The hint is a deliberate forced-retrieval gate (generation effect), *not* a loading delay.** On an **attempt-1 miss** (partial OR fail) the hint is delivered inline as a covered "Little Hint" card the student **taps to reveal** — the tap *is* the gate (it replaced the earlier timed ~2–3s pause). Never show the attempt-1 hint text pre-revealed. (The attempt-2 answer reveal still renders in the result sheet.)
- **Hint 1 is the only hint:** shown on the **attempt-1 miss** (main pass) as a covered tap-to-reveal card. **There is no Hint 2** — a non-correct retry (attempt 2) goes straight to the answer reveal.
- **Retry-queue second-miss reveal is automatic** (Knowie steps in, no tap). The main-pass "See answer" ghost is a *separate* opt-in — keep both.
- **Push-to-talk requires an explicit Send:** stop → review → Send. No auto-endpointing / speech-end detection.
- **`unaided_pass` auto-advances** (short hold, tap to skip); all other states wait on a CTA.
- **Processing is a staged/animated state, not a spinner** (mirror the app's multi-step generating screen); target <4s.
- **Summary never shows a score or "mastered"** — use "explained X of Y on your own" + path-based labels. No weighted composite score, ever.
- **XP counts up per term but is collected only on completion.**
- **Skip is always reachable**, logs `skipped`, and never dead-ends or shames.
- **Text fallback** is reachable in one tap at the recording state but stays secondary to voice; same judge, same hint ladder, same terminal states. ("Say it back" is voice-only.)

## Explicitly out of scope (do NOT build)

No TTS / voice output (Knowie never speaks). No auto-endpointing. No open Q&A / tutoring branch (recall only). No weighted composite score. No pause/resume audio append. No entry points outside the Exam Plan; no AI Chat history card. No mid-answer language switch, mic-busy handling, or cross-session history. Missing edge states (IN_PROGRESS node, mic-denied route, judge error, empty transcript) are **deferred and documented, not built** — this is a happy-path build.

## Project
- Building: a clickable prototype of a voice active-recall step in Knowunity's
  Exam Plan. A student explains a key term out loud; the character "Knowie"
  replies in TEXT.
- For: students (~14–18) revising on their phone.
- My committed concept:  
Entry node → soft-gate intro (first encounter only) → per-term loop → end-of-session retry queue → summary → return to path.
- Per-term loop: idle → recording (push-to-talk) → processing → result.
- Result has THREE faces: unaided_pass / partial+hint / (on 2nd miss) reveal. - user can always reveal (‘why’ button) when the result appears
- Partial verdict: the verdict (heading + what-you-covered) appears in a Knowie
bubble; the hint sits below as a covered "Little Hint" card. **Tap-to-reveal is
the core forced-retrieval mechanic** — the hint text stays hidden until the
student taps. (Replaces the earlier timed 2–3s reveal.)
- Platform: mobile only, 390px wide. Dark mode only.

## This is a test prototype, not a working AI   (read this first)
- MOCK the recall intelligence: 2–3 fixed example terms with a canned "transcript" and a canned result/hint. The mic just advances the mocked flow.
- Never build real speech-to-text, real audio capture, or call any model/API.
- Knowie replies in TEXT only. Never add text-to-speech or audio output.

## Stack & tools
- Next.js + Tailwind (deploys to Vercel). Animations: the Motion library (motion/react); see motion-guide.md. Type: Inter Variable.
- Style only from the tokens in design.md. Never invent hex.

## Commands
- Install: `npm install`
- Dev (local preview): `npm run dev` → http://localhost:3000
- Build: `npm run build`  ·  Start: `npm start`
- Deploy: Vercel (push connected repo, or `vercel`).
- Stack: Next.js 15 (App Router) + TS, Tailwind v4 (tokens in `app/globals.css`),
  Motion (`motion/react`), Inter Variable via `next/font`. Entry `app/page.tsx`;
  state machine `app/lib/useRecallMachine.ts`; mock script `app/lib/script.ts`.
- NOTE: `next.config.mjs` sets `reactStrictMode: false` on purpose so the mocked
  timed beats (processing, verdict→hint pause, auto-reveal) fire once in dev.

## Always
- Build the states MY committed flow needs (from Module 3). At minimum the core
  loop reads clearly: idle → recording → processing → result.
- Keep the can't-speak text fallback reachable in one tap on every recall screen.
- Make the summary point to a next step (repeat missed terms, re-test later),
  not just a score.
- Reuse a pattern from the design system before inventing one.
- Before building a screen, look at the matching screen in reference/ and match its
  layout and feel; treat those images as the sample UI for how Knowunity looks.

## State names (use these exact strings, never invent) 
- Terminal states: unaided_pass · passed_with_hints · revealed · skipped 
- There is NO "fail" state. "Fail" is a transient verdict copy only, never persisted. 
- Reveal is automatic on the 2nd miss (Knowie steps in) — NOT a button the student taps.

## Never
- Never style with raw hex or inline styles.
- Never build the whole app or every edge state. Build my core flow well.
- Never change screens or styles I didn't ask you to touch. Fix only what I name.

## Where things live (point, don't paste)
- sprint-context.md · design.md · SPEC.md · prototype-rules.md · motion-guide.md
- feedback.md : my prioritized fix-list from user testing. Read it before making
  fixes; change what it lists; protect anything marked as working.
- reference/ : screenshots of real Knowunity screens (sample UI to match)
- public/images : mascot, avatars

## Definition of done
- Matches my Figma frames. Uses tokens from design.md + Inter Variable; dark mode.
- Core voice loop is tappable and legible; can't-speak fallback works;
  summary points to a next step. Builds clean and deploys to Vercel.

## Good to know
- [a recurring thing Claude got wrong before — add as you go]
