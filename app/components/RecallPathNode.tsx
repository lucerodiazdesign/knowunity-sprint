"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CheckIcon } from "./icons";
import { snappy, gentle } from "../lib/motion";
import { t } from "../lib/copy";
import type { RecallStatus } from "../lib/useRecallMachine";

// The Voice Recall path node. A dedicated 3-state node whose appearance is
// driven ENTIRELY by session status — it does NOT reuse the sibling
// completed-node treatment. Each state's fill / icon / badge / arc is taken
// from its own Figma node:
//   not_started → 13802-14031  (dark, coral mic, NEW badge)
//   in_progress → 13806-14121  (dark, coral mic, coral progress arc, NEW badge)
//   done        → 13806-14132  (coral fill, white mic, coral check badge)

const SIZE = 92; // face (matches sibling PathNode for path alignment)
const OUTER = 116; // ring outer diameter
const GAP = (OUTER - SIZE) / 2;
const STROKE = 6;

export function RecallPathNode({
  status,
  label,
  onLaunch,
}: {
  status: RecallStatus;
  label: string;
  onLaunch: () => void;
}) {
  const reduce = useReducedMotion();
  const done = status === "done";
  const inProgress = status === "in_progress";
  // Tappable until done (not_started launches, in_progress resumes — resume is
  // stubbed to relaunch for now).
  const tappable = !done;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        onClick={tappable ? onLaunch : undefined}
        disabled={!tappable}
        aria-label={`${label}, ${t.recallStatus[status]}`}
        whileTap={tappable && !reduce ? { scale: 0.94 } : undefined}
        transition={snappy}
        className="relative"
        style={{ width: OUTER, height: OUTER + 6 }}
      >
        {/* Ring bound to the node's OWN colour: coral (same token as the fill) with
            a coral glow when done — the completed-node treatment in the node's own
            colour, NOT the shared brand/quiz border token. Dark ring otherwise
            (per the not_started / in_progress Figma nodes). */}
        <span
          aria-hidden
          className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-full border-[6px] ${
            done ? "border-coral" : "border-surface"
          }`}
          style={{
            width: OUTER,
            height: OUTER,
            boxShadow: done ? "0 0 26px -6px var(--accent-coral-bold)" : undefined,
          }}
        />

        {/* IN_PROGRESS: coral progress arc (~halfway) over the dark ring. */}
        {inProgress && (
          <span
            aria-hidden
            className="absolute left-1/2 top-0 -translate-x-1/2"
            style={{ width: OUTER, height: OUTER }}
          >
            <svg width={OUTER} height={OUTER} className="-rotate-90" viewBox={`0 0 ${OUTER} ${OUTER}`}>
              <circle
                cx={OUTER / 2}
                cy={OUTER / 2}
                r={(OUTER - STROKE) / 2}
                fill="none"
                stroke="var(--accent-coral-bold)"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${0.5 * Math.PI * (OUTER - STROKE)} ${Math.PI * (OUTER - STROKE)}`}
              />
            </svg>
          </span>
        )}

        {/* Face: coral fill when done, dark otherwise. */}
        <span
          className={`absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full shadow-[var(--shadow-button-inset)] ${
            done ? "bg-coral" : "bg-surface"
          }`}
          style={{ top: GAP, width: SIZE, height: SIZE }}
        >
          <span className="flex items-center justify-center" style={{ width: SIZE * 0.5, height: SIZE * 0.5 }}>
            <Image
              // done uses the white mic; the other states use the coral mic.
              src={done ? "/images/mic_completed.svg" : "/images/mic.svg"}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </span>
        </span>

        {/* Badge slot. NEW for not_started & in_progress (per Figma); a coral
            check for done. No fabricated badges. */}
        {done ? (
          <motion.span
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={gentle}
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border-2 border-page bg-coral text-ink"
            style={{ top: GAP + SIZE - 16, height: 28, width: 28 }}
          >
            <CheckIcon size={16} strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span
            initial={reduce ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={gentle}
            className="absolute left-1/2 flex h-[22px] -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-full border-2 border-page bg-coral px-2.5 text-[9px] font-extrabold tracking-[0.4px] text-ink"
            style={{ top: GAP + SIZE - 14 }}
          >
            {t.badgeNew}
          </motion.span>
        )}
      </motion.button>

      <span className="text-[15px] font-bold tracking-[0.1px] text-ink">{label}</span>
    </div>
  );
}
