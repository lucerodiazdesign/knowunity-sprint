"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { PillButton } from "./controls";
import { CloseIcon } from "./icons";
import { gentle, soft } from "../lib/motion";

/* Glass 2-dot page control (Apple HIG page control, per the Figma). */
function Pagination({ active }: { active: 0 | 1 }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-floating px-3 py-2 backdrop-blur-xl">
      {[0, 1].map((i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full bg-ink ${i === active ? "opacity-100" : "opacity-30"}`}
        />
      ))}
      <span className="sr-only">Paso {active + 1} de 2</span>
    </div>
  );
}

/* One full-screen entry page: hero art, headline, subtitle, dots, Continue.
   No sheet chrome — fills the viewport under the shared status bar. */
export function EntryScreen({
  artSrc,
  artAlt,
  artWidth,
  artHeight,
  headline,
  subtitle,
  activeDot,
  ctaLabel,
  ctaBusy,
  onContinue,
  onExit,
}: {
  artSrc: string;
  artAlt: string;
  /** Illustration width in px; height preserves the source aspect ratio. */
  artWidth: number;
  artHeight: number;
  headline: string;
  subtitle: string;
  activeDot: 0 | 1;
  ctaLabel: string;
  ctaBusy?: boolean;
  onContinue: () => void;
  /** Exit during onboarding — leaves the node NOT_STARTED (loop never entered). */
  onExit?: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-full flex-col">
      {/* Dismiss affordance — exiting here is "during onboarding". */}
      <div className="flex h-12 shrink-0 items-center px-3">
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            aria-label="Cerrar introducción"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink"
          >
            <CloseIcon size={24} />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center overflow-hidden px-6">
        {/* Hero art — 326px wide, aspect preserved, centered. */}
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={gentle}
            className="relative shrink-0"
            style={{ width: artWidth, height: artHeight }}
          >
            <Image src={artSrc} alt={artAlt} fill sizes={`${artWidth}px`} className="object-contain" priority />
          </motion.div>
        </div>

        {/* Headline + subtitle + dots, sitting low like the frame. */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...soft, delay: 0.05 }}
          className="flex flex-col items-center gap-6 pb-2"
        >
          <div className="flex flex-col items-center gap-3">
            <h1 className="max-w-[320px] text-center text-[32px] font-extrabold leading-[36px] tracking-[-0.3px] text-ink">
              {headline}
            </h1>
            <p className="max-w-[280px] text-center text-[18px] font-bold leading-[22px] text-ink-2">
              {subtitle}
            </p>
          </div>
          <Pagination active={activeDot} />
        </motion.div>
      </div>

      {/* Continue — pinned bottom, large light pill. */}
      <div className="px-7 pt-3" style={{ paddingBottom: "max(28px, env(safe-area-inset-bottom))" }}>
        <PillButton size="lg" onClick={onContinue} disabled={ctaBusy}>
          {ctaLabel}
        </PillButton>
      </div>
    </div>
  );
}
