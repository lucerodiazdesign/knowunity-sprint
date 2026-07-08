"use client";

import { motion } from "motion/react";
import { CloseIcon, BoltIcon } from "./icons";
import { gentle } from "../lib/motion";

/* iOS-style status bar (decorative). Matches the frame's 09:41 + signal row. */
export function StatusBar() {
  return (
    <div
      className="flex h-12 w-full items-center justify-between px-[22px] text-ink"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <span className="text-[15px] font-semibold tracking-[-0.3px]">9:41</span>
      <div className="flex items-center gap-1.5">
        {/* cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 4.5}
              y={8 - i * 2.4}
              width="3"
              height={4 + i * 2.4}
              rx="1"
              fill="currentColor"
            />
          ))}
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
          <path
            d="M8 10.2a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6zM3.4 5.6a6.5 6.5 0 019.2 0M1 3.2a9.9 9.9 0 0114 0M5.7 8a3.3 3.3 0 014.6 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        {/* battery */}
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none" aria-hidden>
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="12"
            rx="3"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2" width="17" height="9" rx="1.5" fill="currentColor" />
          <rect x="24" y="4" width="1.5" height="5" rx="0.75" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

/* Top app bar: close (left) · progress (center) · XP chip (right).
   The frame's right slot is an XP chip (bolt + count), not a settings gear. */
export function TopBar({
  progress,
  xp,
  onClose,
}: {
  progress: number; // 0..1
  xp: number;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-14 w-full items-center gap-1 px-3">
      <motion.button
        type="button"
        onClick={onClose}
        whileTap={{ scale: 0.9 }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        aria-label="Cerrar"
      >
        <CloseIcon size={24} />
      </motion.button>

      <div className="flex h-4 flex-1 items-center">
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-surface">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-brand"
            initial={false}
            animate={{ width: `${Math.max(4, Math.min(1, progress) * 100)}%` }}
            transition={gentle}
          />
        </div>
      </div>

      <div className="flex h-9 shrink-0 items-center gap-1 rounded-full px-2 text-blue-on-subtle">
        <BoltIcon size={18} />
        <motion.span
          key={xp}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={gentle}
          className="min-w-[11px] text-center text-[18px] font-bold tabular-nums"
        >
          {xp}
        </motion.span>
      </div>
    </div>
  );
}
