"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { MicIcon, StopIcon } from "./icons";
import { snappy } from "../lib/motion";
import { t } from "../lib/copy";

/* The mic — the most-tapped control. White circle, black glyph (per frame).
   Recording is signalled by shape (mic → stop), a calm pulse, AND the label,
   never colour alone. */
export function MicButton({
  recording,
  onClick,
  disabled,
}: {
  recording: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex h-[88px] w-[88px] items-center justify-center">
      {/* live pulse ring — only while recording */}
      {recording && !reduce && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary"
          initial={{ opacity: 0.35, scale: 1 }}
          animate={{ opacity: 0, scale: 1.45 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.94 }}
        // The live-mic pulse is carried by the radiating ring alone (above); the
        // button itself stays steady so only ONE thing pulses beside the waveform
        // — "one thing moving at a time" (motion-guide). Was: scale [1,1.06,1] loop.
        animate={{ scale: 1 }}
        transition={snappy}
        className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-primary text-on-primary shadow-[var(--shadow-mic)] disabled:opacity-60"
        aria-label={recording ? t.stopRecording : t.startRecording}
        aria-pressed={recording}
      >
        {recording ? <StopIcon size={30} /> : <MicIcon size={32} />}
      </motion.button>
    </div>
  );
}

/* Secondary round control with a label under it (Erase / Replay / Use Text). */
export function ControlButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.92 }}
        transition={snappy}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-surface shadow-[var(--shadow-button-inset)] transition-opacity ${
          disabled ? "opacity-45" : "text-ink"
        }`}
        aria-label={label}
      >
        <span className={disabled ? "text-ink-3" : "text-ink"}>{icon}</span>
      </motion.button>
      <span
        className={`text-[12px] font-medium tracking-[0.12px] ${
          disabled ? "text-ink-3" : "text-ink-2"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* Primary CTA — light pill (interactive/primary fill, on-primary label).
   size "lg" = the 21px Headline-S label used on the full-screen entry Continue. */
export function PillButton({
  children,
  onClick,
  disabled,
  size = "md",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const text = size === "lg" ? "text-[21px] leading-[24px]" : "text-[15px] tracking-[0.15px]";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={snappy}
      className={`flex h-14 w-full items-center justify-center gap-1.5 rounded-full bg-primary font-bold text-on-primary shadow-[var(--shadow-button-inset)] disabled:cursor-not-allowed disabled:opacity-40 ${text} ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* Secondary / ghost CTA — surface fill (used for "Send", "See answer"). */
export function GhostButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={snappy}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-full bg-surface text-[15px] font-bold tracking-[0.15px] text-ink shadow-[var(--shadow-button-inset)] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* Low-emphasis text action (e.g. "Not relevant" skip). */
export function TextButton({
  children,
  onClick,
  tone = "ink",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "ink" | "link";
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96, opacity: 0.7 }}
      transition={snappy}
      className={`flex h-14 w-full items-center justify-center text-[15px] font-bold tracking-[0.15px] ${
        tone === "link" ? "text-link" : "text-ink"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
