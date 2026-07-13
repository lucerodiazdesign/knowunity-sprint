"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { t } from "../lib/copy";

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
      {/* Conversation turn — stays at the TOP and scrolls if long. The empty
          space between it and the caption/mascot group opens up here (flex-1). */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-2">
        {/* One conversation turn: Knowie's question stays on top (left-aligned),
            the student's answer stacks below (right-aligned). */}
        <div className="flex flex-col gap-4">
          {/* Knowie's question — intro treatment (40×40 avatar inside, left of text). */}
          <div className="relative">
            <div
              className="absolute -left-[6px] top-5 h-3 w-3 rotate-45 rounded-[2px] bg-surface"
              aria-hidden
            />
            <div className="flex items-start gap-3 rounded-md bg-surface p-3">
              <Image src="/images/knowie-bubble-3.svg" alt="" aria-hidden width={40} height={40} className="h-10 w-10 shrink-0" />
              <p className="text-[18px] leading-6 tracking-[0.18px] text-ink">{prompt}</p>
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
      </div>

      {/* Caption + peeking mascot — ONE bottom-anchored, left-aligned group with a
          FIXED gap (gap-6 = 24px). The thinking line always sits directly ABOVE
          Knowie's head as a pair (never jammed beside it), and the structural gap
          means they can't overlap at any caption length or mascot size. The mascot
          keeps its "peek" via -mb-5 + the parent's overflow-hidden. */}
      <div className="flex shrink-0 flex-col items-start gap-6 px-4 pt-2">
        <h2 className="max-w-[240px] text-[28px] font-extrabold leading-[30px] tracking-[-0.2px] text-ink">
          {t.thinking}
          <Dots animate={!reduce} />
        </h2>
        <motion.div
          aria-hidden
          className="pointer-events-none relative -mb-5 h-[200px] w-[200px]"
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/images/standby.png" alt="" fill sizes="200px" className="object-contain object-bottom" priority />
        </motion.div>
      </div>
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
