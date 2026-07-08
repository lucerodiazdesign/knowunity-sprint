"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";
import { gentle } from "../lib/motion";

/* Waveform (Figma 13766-13630): 21 white (interactive/primary) bars @66%, the
   recorded shape. Modes:
   - idle:      flat short bars (nothing recorded yet)
   - recording: the shape, calm live animation (scaleY only)
   - still:     the recorded shape, static (review, not playing)
   - playing:   the shape with a progress sweep — bars up to `progress` lit,
                the rest dimmed. Driven by the audio's currentTime (see Replay).
   The recording and playback visuals share the SAME bars for consistency. */
export type WaveMode = "idle" | "recording" | "still" | "playing";

// Exact bar heights from the Figma node.
const BARS = [9, 37, 65, 19, 75, 65, 47, 47, 47, 65, 47, 75, 47, 19, 47, 65, 47, 75, 47, 19, 47];

export function Waveform({ mode, progress = 0 }: { mode: WaveMode; progress?: number }) {
  const reduce = useReducedMotion();
  const flat = mode === "idle";
  const animating = mode === "recording" && !reduce;

  return (
    <div className="flex h-[101px] items-center justify-center" style={{ gap: 11.442 }}>
      {BARS.map((h, i) => {
        const played = mode === "playing" && (i + 0.5) / BARS.length <= progress;
        const opacity = mode === "playing" ? (played ? 1 : 0.28) : flat ? 0.5 : 0.66;
        const peak = 1 + (0.15 + Math.abs(Math.sin(i * 1.7)) * 0.35);
        return (
          <motion.span
            key={i}
            className="w-[5px] rounded-[2.86px] bg-primary transition-opacity duration-150"
            style={{ height: flat ? 8 : h, opacity, originY: 0.5 }}
            animate={animating ? { scaleY: [1, peak, 1] } : { scaleY: 1 }}
            transition={
              animating
                ? { duration: 0.8 + (i % 5) * 0.12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                : { duration: 0.2 }
            }
          />
        );
      })}
    </div>
  );
}

/* Knowie's chat bubble: mascot on the left, surface bubble with a small tail on
   the right. Knowie replies in TEXT only — this bubble is how she "speaks". */
export function KnowieBubble({
  mascot,
  alt,
  children,
  tone = "neutral",
}: {
  mascot: string;
  alt: string;
  children: ReactNode;
  tone?: "neutral" | "success" | "error";
}) {
  const reduce = useReducedMotion();
  const ring =
    tone === "success"
      ? "ring-1 ring-success/40"
      : tone === "error"
        ? "ring-1 ring-error/40"
        : "";
  return (
    <div className="flex items-start gap-2">
      <motion.div
        className="relative h-[70px] w-[70px] shrink-0"
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={gentle}
      >
        <Image
          src={mascot}
          alt={alt}
          fill
          sizes="70px"
          className="object-contain"
          priority
        />
      </motion.div>

      <div className="relative mt-1 flex-1">
        {/* tail */}
        <div
          className="absolute -left-[6px] top-4 h-3 w-3 rotate-45 rounded-[2px] bg-surface"
          aria-hidden
        />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={gentle}
          className={`relative rounded-md bg-surface p-4 text-[15px] leading-[20px] tracking-[0.15px] text-ink ${ring}`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
