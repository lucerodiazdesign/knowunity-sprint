# sprint-context.md — Knowunity Voice Recall (Flow 2A)

Briefing for a build tool. Happy path only. Mobile, dark mode, Inter Variable. Knowie/Noe responds in **text only**.

## 1. What this is
- A voice active-recall step inside the Exam Plan, in-path: after the quiz, before the mock exam.
- Student revises by consuming but can't retrieve. Here they explain 3–5 key terms aloud; Knowie replies in text with verdict, hints, and reveal.

## 2. Concept (committed: Flow 2A — Timed Hint Reveal)
- When a student stumbles, Knowie shows the verdict, then a hint fades in a beat later — keeping them moving so finishing feels earned and in control.

## 3. Core flow (entry → exit)
1. Enter from Exam Plan path node. First encounter only: soft-gate intro **bottom sheet** (skip in one tap) → mic primer → OS prompt.
2. Idle — term shown, mic ready.
3. Record (push-to-talk) → stop → review take → explicit **Send**. Or one-tap text fallback. Skip available throughout.
4. Processing — staged "thinking" state, target <4s.
5. Verdict beat — pass / partial / fail copy shown **alone**, nothing else on screen.
6. `unaided_pass` → short affirmation → auto-advance to next term.
7. Miss/partial → 2–3s later **Hint 1** fades in below verdict → CTAs: **Next** (primary), **See answer** (ghost). Next → term queued to end-of-session retry. See answer → full answer in AI chat drawer, locks `revealed`, advances.
8. End-of-session retry queue — every non-`unaided_pass` term re-presented. Miss again → **Hint 2** → still miss → answer **auto-reveals**, locks `revealed`.
9. Summary → per-term breakdown + unaided count → **Continue** (collect XP) / **Try again**.

## 4. Key design decisions
- **Verdict and hint are two separate beats, ~2–3s apart** — because the gap is a forced retrieval window (generation effect), not a loading delay. Never render Next/See-answer during the pause.
- **Four terminal states only: `unaided_pass`, `passed_with_hints`, `revealed`, `skipped`** — because there is no `fail` state. "Fail" is a transient verdict that drives copy and never persists.
- **At the retry queue, the 2nd-miss reveal is automatic — Knowie steps in, no tap** — because the ladder is exhausted and nobody stays stuck. (The main-pass "See answer" ghost is a separate opt-in; keep it.)
- **Hints distribute across the session: Hint 1 on first miss, Hint 2 at the retry queue** — because the re-attempt lives at end-of-session, not the next screen. Don't stack both hints in one turn.
- **Push-to-talk: stop → review → explicit Send** — because a fumbled take shouldn't force a bad submission; the extra tap is deliberate. No auto-endpointing.
- **`unaided_pass` auto-advances (short hold, tap to skip); all other states wait on a CTA** — because a win should feel fast and a miss needs a decision.
- **Processing is a staged/animated state, not a spinner** — because a blank <4s void reads as broken; mirror the app's multi-step generating screen.
- **Summary shows "explained X of Y on your own" + path-based labels, never a score or "mastered"** — because a composite score and mastery language reintroduce the fluency/performance trap.
- **XP counts up per term, collected only on completion** — because rewarding mid-session ease undercuts retrieval.
- **Skip is always reachable and logs `skipped`; never dead-ends or shames** — because trapping the student kills completion.

## 5. Can't-speak fallback
- Text input reachable in **one tap** at the recording state; voice stays the primary affordance (not co-equal).
- Same judge, same hint ladder, same terminal states regardless of modality. "Say it back" is voice-only; text term skips it.

## 6. Do NOT build
- No voice output / TTS — Knowie never speaks.
- No auto-endpointing (speech-end detection).
- No open Q&A / tutoring branch — recall only, flow does not branch on a question.
- No weighted composite session score.
- No pause/resume-into-one-take (audio append).
- No entry points outside the Exam Plan; no AI Chat history/"Created Things" card.
- No language-switch mid-answer, mic-hardware-busy, or cross-session history.
- Don't build every edge state. Missing edges (IN_PROGRESS node, mic-denied route, judge error, empty transcript) are deferred and documented, not built.
