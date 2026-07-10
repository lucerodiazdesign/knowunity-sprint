"use client";

import { motion } from "motion/react";
import { CloseIcon, BoltIcon } from "./icons";
import { gentle } from "../lib/motion";
import { t } from "../lib/copy";

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
    <div className="flex h-14 w-full shrink-0 items-center gap-1 px-3">
      <motion.button
        type="button"
        onClick={onClose}
        whileTap={{ scale: 0.9 }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        aria-label={t.close}
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
