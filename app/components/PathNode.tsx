"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { CheckIcon } from "./icons";
import { snappy, gentle } from "../lib/motion";

// One shared path-node component; every step on the path is an instance of it —
// the Recall node is a peer, not a special case.
//
// States built: "completed" and "available".
// DEFERRED (stubbed, not built): "in_progress" and "locked". They fall through
// to the dimmed "upcoming" rendering below as a context stand-in for sibling
// steps — NOT the final locked/in-progress design.
export type NodeState = "completed" | "available" | "upcoming";

// Badge slot. "new" (first-encounter availability) and "next" (UP NEXT) share
// this one slot and must NEVER co-render — the caller passes exactly one.
export type NodeBadge = "new" | "next" | "check" | "none";

const SIZE = 92; // node face
const OUTER = 116; // ring outer diameter
const GAP = (OUTER - SIZE) / 2;

export function PathNode({
  state,
  badge,
  icon,
  label,
  caption,
  onTap,
}: {
  state: NodeState;
  badge: NodeBadge;
  icon: ReactNode;
  label: string;
  caption?: string; // small uppercase pill under the label (e.g. PRACTICE TEST)
  onTap?: () => void;
}) {
  const reduce = useReducedMotion();
  const tappable = !!onTap && state !== "upcoming";
  const completed = state === "completed";

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        onClick={tappable ? onTap : undefined}
        disabled={!tappable}
        aria-label={`${label}${completed ? ", completado" : badge === "new" ? ", nuevo" : badge === "next" ? ", siguiente" : ""}`}
        whileTap={tappable && !reduce ? { scale: 0.94 } : undefined}
        transition={snappy}
        className="relative"
        style={{ width: OUTER, height: OUTER + 6 }}
      >
        {/* Ring: bright brand ring + glow when completed; a subtle dark ring
            otherwise. Concentric with a visible gap to the face. */}
        <span
          aria-hidden
          className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-full border-[6px] ${
            completed ? "border-brand" : "border-surface"
          } ${state === "upcoming" ? "opacity-70" : ""}`}
          style={{
            width: OUTER,
            height: OUTER,
            boxShadow: completed ? "0 0 26px -6px var(--accent-brand-bold)" : undefined,
          }}
        />
        {/* Face */}
        <span
          className={`absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full shadow-[var(--shadow-button-inset)] ${
            completed ? "bg-brand" : "bg-surface"
          } ${state === "upcoming" ? "opacity-70" : ""}`}
          style={{ top: GAP, width: SIZE, height: SIZE }}
        >
          <span
            className={`flex items-center justify-center ${state === "upcoming" ? "opacity-80" : ""}`}
            style={{ width: SIZE * 0.5, height: SIZE * 0.5 }}
          >
            {icon}
          </span>
        </span>
        {/* Badge slot (overlaps the face bottom) */}
        <Badge kind={badge} />
      </motion.button>

      <span
        className={`text-[15px] font-bold tracking-[0.1px] ${
          state === "upcoming" ? "text-ink-3" : "text-ink"
        }`}
      >
        {label}
      </span>
      {caption && (
        <span className="-mt-1 rounded bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.6px] text-ink-3">
          {caption}
        </span>
      )}
    </div>
  );
}

function Badge({ kind }: { kind: NodeBadge }) {
  if (kind === "none") return null;

  // Sits centered, overlapping the bottom of the face.
  const anchor = "absolute left-1/2 -translate-x-1/2 flex items-center justify-center border-2 border-page";
  const top = GAP + SIZE - 16;

  if (kind === "check") {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={gentle}
        className={`${anchor} h-7 w-7 rounded-full bg-brand text-ink`}
        style={{ top }}
      >
        <CheckIcon size={16} strokeWidth={3} />
      </motion.span>
    );
  }

  // "new" (coral) and "next" (brand) share the pill slot; only one renders.
  const isNew = kind === "new";
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={gentle}
      className={`${anchor} h-[22px] whitespace-nowrap rounded-full px-2.5 text-[10px] font-extrabold tracking-[0.4px] text-ink ${
        isNew ? "bg-coral" : "bg-brand"
      }`}
      style={{ top: top + 2 }}
    >
      {isNew ? "NUEVO" : "SIGUIENTE"}
    </motion.span>
  );
}

// Dotted connector between two nodes. `done` = the step above is complete
// (brand-tinted); otherwise a dim neutral run.
export function Connector({ done, dots = 3 }: { done?: boolean; dots?: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-1" aria-hidden>
      {Array.from({ length: dots }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${done ? "bg-brand" : "bg-ink-3"}`}
          style={{ opacity: done ? 0.85 : 0.45 }}
        />
      ))}
    </div>
  );
}
