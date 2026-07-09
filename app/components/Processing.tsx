"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/* Processing / "thinking" state — matches Figma node 13713-12384:
   the conversation turn (Knowie's question, left + the student's answer, right)
   + "Hmm, give me a second…" + a large standby Knowie peeking bottom-right.

   The turn PERSISTS: Knowie's question bubble stays on screen and the student's
   answer stacks below it — the pair reads as one conversation turn.

   The voice indicator is a STATIC icon (per the Figma frame). The other motion —
   thinking dots and the mascot bob — is LOOPED here so a frozen thinking frame
   doesn't read as a hang. */
export function Processing({ prompt, transcript }: { prompt: string; transcript: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-2">
        {/* One conversation turn (gap 16, per Figma): Knowie's question stays on
            top (left-aligned), the student's answer stacks below (right-aligned). */}
        <div className="flex flex-col gap-4">
          {/* Knowie's question — persists, left-aligned with a tail. */}
          <div className="relative">
            <div
              className="absolute -left-[6px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 rounded-[2px] bg-surface"
              aria-hidden
            />
            <div className="rounded-md bg-surface p-4 text-[18px] leading-6 tracking-[0.18px] text-ink">
              {prompt}
            </div>
          </div>

          {/* The student's answer — right-aligned, below the question, with a
              static voice-waves glyph. */}
          <div className="flex justify-end">
            <div className="flex w-[296px] flex-col gap-1.5 rounded-[18px] rounded-tr-[4px] bg-surface px-3 py-2">
              <VoiceWaves />
              <p className="text-[18px] leading-6 tracking-[0.18px] text-ink-2">
                &ldquo;{transcript}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Knowie's thinking line, with a looping ellipsis. */}
        <h2 className="mt-6 max-w-[240px] text-[28px] font-extrabold leading-[30px] tracking-[-0.2px] text-ink">
          Mmm, dame un segundo
          <Dots animate={!reduce} />
        </h2>
      </div>

      {/* Standby Knowie, peeking from the bottom-right with a gentle bob. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-5 -right-3 h-[200px] w-[200px]"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/images/standby.png" alt="" fill sizes="200px" className="object-contain" priority />
      </motion.div>
    </div>
  );
}

// Static voice indicator — the "audio / voice" glyph, no motion (per Figma).
// Five bars at their resting heights, token-colored (bg-ink).
function VoiceWaves() {
  const peaks = [0.5, 1, 0.65, 1, 0.55];
  return (
    <div className="flex h-[22px] items-center gap-[3px]" aria-hidden>
      {peaks.map((p, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-ink"
          style={{ height: 22 * p }}
        />
      ))}
    </div>
  );
}

// Looping "…" appended to the thinking line.
function Dots({ animate }: { animate: boolean }) {
  if (!animate) return <span>…</span>;
  return (
    <span aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
