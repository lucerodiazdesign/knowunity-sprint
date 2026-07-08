"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Grabber, MicIcon } from "./icons";
import { PillButton, TextButton } from "./controls";
import { sheet, soft } from "../lib/motion";

function Scrim({ onClick }: { onClick?: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 bg-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={soft}
      onClick={onClick}
      aria-hidden
    />
  );
}

function SheetShell({
  children,
  onDismiss,
  labelledBy,
}: {
  children: React.ReactNode;
  onDismiss?: () => void;
  labelledBy?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <Scrim onClick={onDismiss} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={reduce ? { opacity: 0 } : { y: "100%" }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: "100%" }}
        transition={sheet}
        className="relative rounded-t-[24px] bg-page px-6 pt-3 shadow-[var(--shadow-sheet)]"
        style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-4 flex justify-center">
          <Grabber />
        </div>
        {children}
      </motion.div>
    </div>
  );
}

/* Can't-speak text fallback. Same judge + ladder as voice. */
export function TextFallbackSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <SheetShell labelledBy="text-title" onDismiss={onClose}>
      <h2 id="text-title" className="text-[18px] font-extrabold leading-[20px] text-ink">
        Escribe tu respuesta
      </h2>
      <p className="mt-1 text-[13px] text-ink-2">Es como decirlo — explica el término con tus propias palabras.</p>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Con tus propias palabras…"
        className="mt-3 w-full resize-none rounded-md bg-surface p-4 text-[15px] leading-[20px] text-ink placeholder:text-ink-3 focus:outline-none"
      />
      <div className="mt-4 flex flex-col gap-2">
        <PillButton onClick={() => onSubmit(text.trim())} disabled={text.trim().length === 0}>
          Enviar
        </PillButton>
        <TextButton onClick={onClose}>Volver a la voz</TextButton>
      </div>
    </SheetShell>
  );
}

// NOTE: the old AI-chat RevealDrawer ("Let me take this one" / "Got it") was
// DELETED — it was superseded by the attempt-2 reveal built into the shared
// Verdict screen (Figma 13789-10676 / 13789-10390). Nothing falls back to it.

/* AI Chat overlay — opened by the verdict's "¿Por qué?" affordance (Figma
   13770-15545). A floating chat card over a branded gradient scrim; the recall
   term (Knowie's question + the student's answer) stays mounted and visible
   above it, so this reads as in-context help, not a navigation away. The chat is
   seeded with the CURRENT term's context: `heading` + Knowie's `explanation`.
   Mocked — the input is a static affordance (no real AI). */
export function AIChatSheet({
  title,
  heading,
  explanation,
  onClose,
}: {
  title: string;
  heading: string;
  explanation: string;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 z-30">
      {/* Branded gradient scrim: transparent at the top (the term shows through),
          deepening to brand purple toward the sheet. Tap to dismiss. */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent-brand-bold) 42%, transparent))",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={soft}
        onClick={onClose}
        aria-hidden
      />

      {/* Floating chat card — 8px insets, resting near the bottom. */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={reduce ? { opacity: 0 } : { y: "100%" }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: "100%" }}
        transition={sheet}
        className="absolute inset-x-2 bottom-2 flex flex-col overflow-hidden rounded-md border-2 border-border bg-page"
      >
        {/* App bar: drag handle + channel title + expand affordance. */}
        <div className="relative flex min-h-16 flex-col pt-3">
          <div className="absolute left-1/2 top-1.5 -translate-x-1/2">
            <Grabber />
          </div>
          <div className="flex h-12 items-center justify-between px-4">
            <span className="text-[21px] font-extrabold leading-6 tracking-[-0.2px] text-ink">
              {title}
            </span>
            <ExpandGlyph />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-4">
          {/* Marketing chips (decorative, per the node). */}
          <div className="flex items-start gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-pro-on px-3 py-2">
              <span className="rounded-[4px] bg-pro px-1 text-[9px] font-black leading-[14px] text-pro-on">
                PRO
              </span>
              <span className="text-[14px] font-bold leading-4 text-pro">Mejorar</span>
            </span>
            <span className="rounded-full bg-brand-subtle px-3 py-2 text-[14px] font-bold leading-4 text-brand">
              Hecho a tu medida
            </span>
          </div>

          {/* Knowie's contextual explanation — seeded from the current term. */}
          <div className="flex flex-col gap-3">
            <p className="text-[15px] font-bold leading-4 tracking-[0.15px] text-ink">{heading}</p>
            <p className="text-[15px] leading-5 tracking-[0.15px] text-ink">{explanation}</p>
          </div>

          {/* Chat input — a static affordance (the recall AI is mocked). */}
          <div className="flex h-12 items-center gap-2 rounded-full bg-surface pl-4 pr-2">
            <span className="flex-1 text-[18px] leading-6 tracking-[0.18px] text-ink-3">
              ¿Y qué hay de…?
            </span>
            <span className="flex h-8 w-8 items-center justify-center text-ink-2" aria-hidden>
              <MicIcon size={24} />
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Diagonal "expand to full chat" glyph (decorative, per the node).
function ExpandGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink" aria-hidden>
      <path
        d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { AnimatePresence };
