"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PillButton, GhostButton } from "./controls";
import { BoltIcon } from "./icons";
import { TERMS, type Terminal } from "../lib/script";
import { t } from "../lib/copy";
import { gentle } from "../lib/motion";
import type { MachineState } from "../lib/useRecallMachine";

// Per-term row tag colors, keyed by terminal state. Figma maps text = X/bold on
// bg = X/onBold. All three now bind to their exact onBold token (green/error
// onBold values extracted from the Figma "Semantic color token" collection).
// `skipped` is a TODO placeholder tag and is deliberately NOT the reveal tag.
const TAG: Record<Terminal, { text: string; bg: string }> = {
  unaided_pass: { text: "text-green", bg: "bg-green-on" }, // accent/green/onBold (exact)
  passed_with_hints: { text: "text-pro", bg: "bg-pro-on" }, // pro/onBold (exact)
  revealed: { text: "text-error", bg: "bg-error-on" }, // feedback/error/onBold (exact)
  // TODO(Lucero): skipped treatment undecided — own tag vs folded into
  // "Worth another look". Neutral placeholder; NOT reusing the reveal tag.
  skipped: { text: "text-ink-2", bg: "bg-surface" },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: gentle },
};

// XP / SCORE tick-up — the number counts from 0 to its final value as the
// summary lands, so the score reads as earned rather than instant. Honors
// reduced motion (shows the final value, no tick). The call sites use
// tabular-nums so the width stays steady while the digits change.
function CountUp({ to, delay = 0.35, duration = 0.9 }: { to: number; delay?: number; duration?: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) {
      setN(to);
      return;
    }
    const controls = animate(0, to, {
      delay,
      duration,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [to, delay, duration, reduce]);
  return <>{n}</>;
}

// Bullseye — the SCORE box icon (matches Figma's target glyph).
function TargetGlyph({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

// Mascot inside a surface-colored circle. Figma's `knowie-bubble` /
// `knowie-bubble-1` is a bg-surface circle with the LOCAL mascot PNG clipped
// inside — approving for failed/partial, giggling for passed.
function MascotBubble({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-[122px] w-[122px] shrink-0 overflow-hidden rounded-full bg-surface">
      <Image
        src={src}
        alt={alt}
        width={134}
        height={146}
        priority
        className="absolute left-1/2 top-3 max-w-none -translate-x-1/2"
      />
    </div>
  );
}

export function Summary({
  state,
  dispatch,
}: {
  state: MachineState;
  dispatch: (a: any) => void;
}) {
  const reduce = useReducedMotion();
  const [collecting, setCollecting] = useState(false);

  const total = TERMS.length;
  const results = state.results;
  const unaidedCount = results.filter((r) => r === "unaided_pass").length;
  const passedCount = results.filter(
    (r) => r === "unaided_pass" || r === "passed_with_hints",
  ).length;
  const hasMissed = results.some((r) => r && r !== "unaided_pass");

  // Outcome routing (CLAUDE.md's four terminal states). Exhaustive 3-way split:
  //   passed  = every term unaided_pass
  //   partial = at least one passed (unaided OR with-hints), but not all-unaided
  //   failed  = no term passed (all revealed/skipped)
  const outcome: "passed" | "partial" | "failed" =
    unaidedCount === total ? "passed" : passedCount >= 1 ? "partial" : "failed";

  const STATE = {
    passed: {
      title: t.summaryTitlePassed,
      subtitle: t.summarySubtitlePassed,
      src: "/images/giggling.png",
      alt: t.summaryMascotGiggling,
    },
    partial: {
      title: t.summaryTitlePartial,
      subtitle: t.summarySubtitleTryAgain,
      src: "/images/approving.png",
      alt: t.summaryMascotApproving,
    },
    failed: {
      title: t.summaryTitleFailed,
      subtitle: t.summarySubtitleTryAgain,
      src: "/images/approving.png",
      alt: t.summaryMascotApproving,
    },
  }[outcome];

  function onContinue() {
    setCollecting(true);
    // Brief XP-collect beat, then soft-gate back to the path: node Completed,
    // path advances. Reached on ANY terminal outcome, incl. all-skipped.
    window.setTimeout(() => dispatch({ type: "COMPLETE_AND_RETURN" }), 1100);
  }

  return (
    <div
      className="flex h-full flex-col px-6"
      style={{ paddingTop: "max(16px, env(safe-area-inset-top))", paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
    >
      {/* middleContent — the autolayout-fill container (kept: min-h-0 flex-1 fill;
          scrolls internally if the viewport is short). */}
      <motion.div
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pt-2"
        variants={reduce ? undefined : container}
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
      >
        {/* Mascot + title + subtitle — hugs the top; the rows below grow to fill. */}
        <motion.div
          variants={reduce ? undefined : item}
          className="flex shrink-0 flex-col items-center gap-3 pt-2 pb-4 text-center"
        >
          <MascotBubble src={STATE.src} alt={STATE.alt} />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-[44px] font-extrabold leading-[44px] tracking-[-0.44px] text-ink">
              {STATE.title}
            </h1>
            <p className="max-w-[300px] text-[21px] leading-6 text-ink-2">{STATE.subtitle}</p>
          </div>
        </motion.div>

        {/* XP + SCORE boxes. */}
        <motion.div variants={reduce ? undefined : item} className="flex shrink-0 gap-4">
          {/* XP — bound to the session XP count (state.xp). */}
          <div className="flex flex-1 flex-col items-center rounded-md border-2 border-blue bg-blue">
            <span className="py-1 text-[15px] font-bold leading-5 tracking-[0.15px] text-ink-inv">
              {t.xpBoxLabel}
            </span>
            <div className="flex w-full items-center justify-center gap-1.5 rounded-md bg-page p-3">
              <BoltIcon size={22} className="text-blue" />
              <span className="text-[28px] font-bold leading-7 tabular-nums text-blue"><CountUp to={state.xp} /></span>
            </div>
          </div>
          {/* SCORE — unaided passes (unaided_pass ONLY) out of total terms presented.
              Diagnostic display count per SPEC/F9, not a graded score. */}
          <div className="flex flex-1 flex-col items-center rounded-md border-2 border-green bg-green">
            <span className="py-1 text-[15px] font-bold leading-5 tracking-[0.15px] text-ink-inv">
              {t.scoreBoxLabel}
            </span>
            <div className="flex w-full items-center justify-center gap-1.5 rounded-md bg-page p-3">
              <TargetGlyph className="text-green" />
              <span className="text-[28px] font-bold leading-7 tabular-nums text-green"><CountUp to={unaidedCount} />/{total}</span>
            </div>
          </div>
        </motion.div>

        {/* Per-term rows — term title + terminal-state tag. Grows (like the
            mascot block) so the XP/SCORE boxes sit centered, per Figma. */}
        <motion.ul variants={reduce ? undefined : item} className="flex min-h-0 flex-1 flex-col gap-2 pb-1">
          {TERMS.map((term, i) => {
            const r = state.results[i];
            // Every term is terminal by the summary; guard the transient state.
            const key: Terminal = r && r !== "pending_retry" ? r : "skipped";
            const tag = TAG[key];
            return (
              <li
                key={term.id}
                className="flex items-center gap-2 rounded-md bg-secondary px-3 py-3"
              >
                <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink">
                  {term.title}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[15px] font-bold leading-4 ${tag.text} ${tag.bg}`}
                >
                  {t.summaryLabel[key]}
                </span>
              </li>
            );
          })}
        </motion.ul>
      </motion.div>

      {/* Exits — HELD per Lucero (do NOT apply Figma's Share / Claim XP). Pinned
          (shrink-0); the content above scrolls if too tall. */}
      <div className="mt-4 flex shrink-0 flex-col gap-2">
        <PillButton onClick={onContinue} disabled={collecting}>
          {collecting ? (
            // Collect beat reuses the TopBar's XP pop (key-swap scale 0.8→1 on
            // gentle) instead of a generic pulse, so "collected" reads as the same
            // number the student just watched tick up — the loop closes on itself.
            <motion.span
              key={state.xp}
              className="flex items-center gap-1"
              initial={reduce ? false : { scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduce ? undefined : gentle}
            >
              <BoltIcon size={18} /> {t.xpCollected(state.xp)}
            </motion.span>
          ) : (
            t.continue
          )}
        </PillButton>
        {hasMissed && (
          <GhostButton onClick={() => dispatch({ type: "TRY_MISSED" })} disabled={collecting}>
            {t.tryTricky}
          </GhostButton>
        )}
      </div>
    </div>
  );
}
