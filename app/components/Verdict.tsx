"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { CheckIcon, Grabber } from "./icons";
import { sheet, gentle } from "../lib/motion";
import { t } from "../lib/copy";
import type { VerdictKind } from "../lib/useRecallMachine";

/* ONE shared verdict screen for every term, parametrised by (kind, attempt).
   The transcribed answer renders HERE (post-processing). On attempt 1 partial/
   fail the hint is WITHHELD, then fades in on this SAME screen (hintRevealed).
   Figma: pass 13789-10756 · skip 10461 · partial 10511→10595 · fail 10244→10172
          · attempt-2 partial 10676 · attempt-2 fail 10390 */
export function Verdict({
  kind,
  attempt,
  hintRevealed,
  prompt,
  transcript,
  covered,
  hint,
  answer,
  onPrimary,
  onWhy,
}: {
  kind: VerdictKind;
  attempt: 1 | 2;
  hintRevealed: boolean;
  prompt: string;
  transcript: string;
  covered: string[];
  hint: string;
  answer: string;
  onPrimary: () => void;
  onWhy: () => void;
}) {
  const reduce = useReducedMotion();

  const showCovered = kind === "pass" || kind === "partial";
  const hasHintSection = kind === "partial" || kind === "fail";
  // Attempt-1 miss (partial OR fail): the hint is delivered inline as a Knowie
  // chat bubble with a covered tap-to-reveal Hint, instead of the sheet section.
  // Presentation branch only — routing (enqueue for retry, answer deferred to
  // attempt 2) is unchanged in the machine.
  const isInlineMiss = (kind === "partial" || kind === "fail") && attempt === 1;
  const primaryLabel = kind === "pass" || kind === "skip" ? t.verdictPrimaryPass : t.verdictPrimaryOther;

  const sheetBg =
    kind === "pass" ? "bg-success-subtle" : kind === "skip" ? "bg-brand-subtle" : "bg-surface";
  const titleTone =
    kind === "pass"
      ? "text-success"
      : kind === "partial"
        ? "text-pro"
        : kind === "fail"
          ? "text-error"
          : "text-link";
  const title = t.verdictTitle[kind];

  // Attempt-1 miss (partial OR fail) renders INLINE in the chat: the verdict flows
  // in the scrollable message area and "Why? / Got it" is a fixed bottom bar — no
  // bottom sheet, no drag handle. Pass / skip and every attempt-2 (answer reveal)
  // keep the sheet path below, untouched.
  if (isInlineMiss) {
    return (
      <div className="flex h-full flex-col">
        {/* Chat message area — verdict flows inline in the conversation. */}
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-4 pb-6">
          {/* Prompt bubble (Knowie's question). Body S Regular 15/20. */}
          <div className="relative">
            <div className="absolute -left-[6px] top-4 h-3 w-3 rotate-45 rounded-[2px] bg-surface" aria-hidden />
            <div className="rounded-md bg-surface p-4 text-[15px] leading-5 tracking-[0.15px] text-ink">{prompt}</div>
          </div>
          {/* Transcribed answer. Body S Regular 15/20. */}
          <div className="flex justify-end">
            <div className="flex w-[296px] flex-col gap-1.5 rounded-[18px] rounded-tr-[4px] bg-surface px-3.5 py-3">
              <Waves />
              <p className="text-[15px] leading-5 tracking-[0.15px] text-ink-2">&ldquo;{transcript}&rdquo;</p>
            </div>
          </div>

          {/* Attempt-1 miss verdict — ONE Knowie bubble (mascot on top of a single
              surface bubble). Partial (Figma 13968:13299): heading + green-checkmark
              list + Hint. Fail (Figma 13968:14509): "Not quite" + error icon, NO
              checkmark list (showCovered is false for fail), same covered tap-to-
              reveal Hint. The answer is deferred to attempt 2 (SPEC §5) — never here. */}
          <div className="flex flex-col items-start">
            {/* Knowie — separate layer, on top of the bubble's top-left. Fail uses
                the standby pose; partial uses the excited pose. */}
            <Image
              src={kind === "fail" ? "/images/Knowie_for_bubble_2.svg" : "/images/knowie_for_bubble.svg"}
              alt=""
              aria-hidden
              width={105}
              height={47}
              className="relative z-10 ml-3 h-auto w-[132px]"
            />
            {/* One surface bubble, with the shared left-side speech tail. */}
            <div className="relative -mt-3 w-full rounded-md bg-surface p-4">
              <div className="absolute -left-[6px] top-6 h-3 w-3 rotate-45 rounded-[2px] bg-surface" aria-hidden />
              {/* Heading — Body M Bold 18/24, white. Fail prefixes the "Not quite"
                  error icon (per Figma 13968:14509); partial has no icon. */}
              <div className="flex items-center gap-2">
                {kind === "fail" && (
                  <Image src="/images/Fail.svg" alt="" aria-hidden width={24} height={24} className="h-6 w-6 shrink-0" />
                )}
                <h2 className="text-[18px] font-bold leading-6 tracking-[0.18px] text-ink">{title}</h2>
              </div>

              {/* What the student got right — green circular checkmark list, Body S Regular. */}
              {showCovered && covered.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {covered.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-[color:var(--text-inverse)]">
                        <CheckIcon size={12} strokeWidth={3} />
                      </span>
                      <span className="text-[15px] leading-5 tracking-[0.15px] text-ink">{c}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Hint — covered by default, tap to reveal (replaces the 2-beat). */}
              <Hint text={hint} className="mt-3" />
            </div>
          </div>
        </div>

        {/* Fixed bottom bar — Why? / Got it (no sheet, no drag handle). */}
        <div className="flex shrink-0 items-stretch gap-2 border-t border-border px-4 pt-4 pb-[max(28px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onWhy}
            className="flex h-14 items-center justify-center rounded-[36px] bg-secondary px-6 text-[18px] font-bold text-on-secondary shadow-[var(--shadow-button-inset)]"
          >
            {t.why}
          </button>
          <motion.button
            type="button"
            onClick={onPrimary}
            whileTap={{ scale: 0.97 }}
            className={`flex h-14 flex-1 items-center justify-center rounded-[36px] px-6 text-[18px] font-bold shadow-[var(--shadow-button-inset)] ${primaryBg(kind)}`}
          >
            {primaryLabel}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Prompt + transcribed answer (behind the sheet). */}
      <div className="flex flex-col gap-6 px-4 pt-4">
        <div className="relative">
          <div className="absolute -left-[6px] top-4 h-3 w-3 rotate-45 rounded-[2px] bg-surface" aria-hidden />
          <div className="rounded-md bg-surface p-4 text-[15px] leading-5 tracking-[0.15px] text-ink">{prompt}</div>
        </div>
        <div className="flex justify-end">
          <div className="flex w-[296px] flex-col gap-1.5 rounded-[18px] rounded-tr-[4px] bg-surface px-3.5 py-3">
            <Waves />
            <p className="text-[15px] leading-5 tracking-[0.15px] text-ink-2">&ldquo;{transcript}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Result sheet */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: "100%" }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        transition={sheet}
        className={`absolute inset-x-0 bottom-0 flex flex-col rounded-t-[36px] border-t border-border ${sheetBg}`}
      >
        <div className="flex justify-center pt-1.5">
          <Grabber />
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 px-7 pt-3">
          <div className="flex flex-1 items-center gap-2">
            {kind === "pass" && (
              <Image src="/images/Passed.svg" alt="" aria-hidden width={24} height={24} className="h-6 w-6 shrink-0" />
            )}
            {kind === "fail" && (
              <Image src="/images/Fail.svg" alt="" aria-hidden width={32} height={32} className="h-8 w-8 shrink-0" />
            )}
            {kind === "skip" && <ArrowGlyph className={titleTone} />}
            <h2 className={`text-[28px] font-extrabold leading-7 tracking-[-0.3px] ${titleTone}`}>{title}</h2>
          </div>
          {kind !== "skip" && <Thumbs />}
        </div>

        <div className="flex flex-col gap-6 px-7 pt-5 pb-[max(28px,env(safe-area-inset-bottom))]">
          {/* You covered */}
          {showCovered && covered.length > 0 && (
            <div className="flex flex-col gap-2 rounded-[24px] border-2 border-success-on-subtle bg-success-subtle p-4">
              <p className="text-[18px] leading-6 tracking-[0.18px] text-success-on-subtle">{t.youCovered}</p>
              <ul className="flex flex-col gap-2">
                {covered.map((c) => (
                  <li key={c} className="flex items-start gap-1.5">
                    <Image src="/images/checkmark_mini.svg" alt="" aria-hidden width={16} height={16} className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-[15px] leading-5 tracking-[0.15px] text-ink">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attempt-2 FAIL reveal — SOME-RIGHT variant: the what-you-covered
              checkmark list (plain green circular checks, "You covered" heading)
              sits ABOVE the Answer card, only when the student got some points
              right. (Figma 13789:10390.) All-wrong omits this. */}
          {kind === "fail" && covered.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[18px] font-bold leading-6 tracking-[0.18px] text-ink">{t.youCovered}</p>
              <ul className="flex flex-col gap-2">
                {covered.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-[color:var(--text-inverse)]">
                      <CheckIcon size={12} strokeWidth={3} />
                    </span>
                    <span className="text-[15px] leading-5 tracking-[0.15px] text-ink">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attempt-2 FAIL reveal — the Answer card. In the sheet `hasHintSection`
              is true ONLY here (attempt-1 misses render inline; attempt-2 partial
              is coerced to fail). Stacking surface, 2px ink/50 border, Radius/600,
              Space/400. (Figma 13789:10390 / 13968:15004.) */}
          {hasHintSection && (
            <div className="rounded-[24px] border-2 border-ink/50 bg-floating p-4">
              <div className="flex items-center gap-1.5">
                <Image src="/images/answer.svg" alt="" aria-hidden width={20} height={20} className="h-5 w-5 shrink-0" />
                <span className="text-[18px] font-bold leading-5 tracking-[0.18px] text-ink">{t.chipAnswer}</span>
              </div>
              <p className="mt-2 text-[15px] leading-5 tracking-[0.15px] text-ink">{answer}</p>
            </div>
          )}

          {/* CTAs */}
          <div className="flex items-stretch gap-2">
            {kind === "skip" ? (
              <button
                type="button"
                onClick={() => {}}
                aria-label={t.undoSkip}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface text-ink-2 shadow-[var(--shadow-button-inset)]"
              >
                <UndoGlyph />
              </button>
            ) : (
              <button
                type="button"
                onClick={onWhy}
                className="flex h-14 items-center justify-center rounded-[36px] bg-secondary px-6 text-[18px] font-bold text-on-secondary shadow-[var(--shadow-button-inset)]"
              >
                {t.why}
              </button>
            )}
            <motion.button
              type="button"
              onClick={onPrimary}
              whileTap={{ scale: 0.97 }}
              className={`flex h-14 flex-1 items-center justify-center rounded-[36px] px-6 text-[18px] font-bold shadow-[var(--shadow-button-inset)] ${primaryBg(kind)}`}
            >
              {primaryLabel}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* Little Hint — covered by default (redacted gold bars + centered "Tap to view"
   pill), tap anywhere to reveal the real hint text in place. UI toggle only; the
   bulb + "Little Hint" label stay visible in both states. The tap-to-reveal
   replaces the timed 2-beat for the partial verdict (CLAUDE.md / SPEC §5).
   Figma Hint component 13963:38836. */
function Hint({ text, className = "" }: { text: string; className?: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className={`rounded-[16px] border-2 border-pro/50 bg-pro-subtle p-3 ${className}`}>
      {/* Header — light bulb + label, visible in both states. */}
      <div className="flex items-center gap-1.5">
        <Image src="/images/Light Bulb Icon.svg" alt="" aria-hidden width={20} height={20} className="h-5 w-5" />
        <span className="text-[15px] font-bold leading-5 text-pro">{t.littleHint}</span>
      </div>

      {revealed ? (
        <p className="mt-2.5 text-[15px] leading-5 tracking-[0.15px] text-ink">{text}</p>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          aria-label={t.tapToView}
          className="relative mt-2.5 block w-full"
        >
          {/* Redacted bars. */}
          <span className="flex flex-col gap-2" aria-hidden>
            <span className="h-4 w-full rounded-full bg-pro/20" />
            <span className="h-4 w-full rounded-full bg-pro/20" />
            <span className="h-4 w-2/3 rounded-full bg-pro/20" />
          </span>
          {/* Centered Tap-to-view pill. */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-lg bg-pro-subtle px-3 py-1.5 text-[15px] font-bold leading-5 text-pro ring-1 ring-inset ring-pro/40">
              {t.tapToView}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

function primaryBg(kind: VerdictKind): string {
  switch (kind) {
    case "pass":
      return "bg-green text-[color:var(--text-inverse)]";
    case "partial":
      return "bg-pro text-[color:var(--pro-on-bold)]";
    case "fail":
      return "bg-error text-[color:var(--text-inverse)]";
    default: // skip
      return "bg-primary text-on-primary";
  }
}

function Waves() {
  const peaks = [0.5, 1, 0.65, 1, 0.55];
  return (
    <div className="flex h-[22px] items-center gap-[3px]" aria-hidden>
      {peaks.map((p, i) => (
        <span key={i} className="w-[3px] rounded-full bg-ink-2" style={{ height: 22 * p }} />
      ))}
    </div>
  );
}

function Thumbs() {
  return (
    <div className="flex items-center gap-4 text-ink-3" aria-hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M7 11V21H5a1 1 0 01-1-1v-8a1 1 0 011-1h2zm0 0l3.5-7A2 2 0 0114 5.8L13 11h5.2a2 2 0 011.95 2.46l-1.4 6A2 2 0 0116.8 21H7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" transform="rotate(180 12 13)" />
      </svg>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M7 11V21H5a1 1 0 01-1-1v-8a1 1 0 011-1h2zm0 0l3.5-7A2 2 0 0114 5.8L13 11h5.2a2 2 0 011.95 2.46l-1.4 6A2 2 0 0116.8 21H7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 12h14M12 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UndoGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 7L4 12l5 5M4 12h11a5 5 0 010 10h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
