"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckIcon, Grabber } from "./icons";
import { sheet, gentle } from "../lib/motion";
import type { VerdictKind } from "../lib/useRecallMachine";

/* ONE shared verdict screen for every term, parametrised by (kind, attempt).
   The transcribed answer renders HERE (post-processing). On attempt 1 partial/
   fail the hint is WITHHELD, then fades in on this SAME screen (hintRevealed).
   Figma: pass 13789-10756 · skip 10461 · partial 10511→10595 · fail 10244→10172
          · attempt-2 partial 10676 · attempt-2 fail 10390 */
export function Verdict({
  kind,
  attempt,
  hintRevealed,
  prompt,
  transcript,
  covered,
  hint,
  answer,
  onPrimary,
  onWhy,
}: {
  kind: VerdictKind;
  attempt: 1 | 2;
  hintRevealed: boolean;
  prompt: string;
  transcript: string;
  covered: string[];
  hint: string;
  answer: string;
  onPrimary: () => void;
  onWhy: () => void;
}) {
  const reduce = useReducedMotion();

  const showCovered = kind === "pass" || kind === "partial";
  const hasHintSection = kind === "partial" || kind === "fail";
  const primaryLabel = kind === "pass" || kind === "skip" ? "Continuar" : "Entendido";

  const sheetBg =
    kind === "pass" ? "bg-success-subtle" : kind === "skip" ? "bg-brand-subtle" : "bg-surface";
  const titleTone =
    kind === "pass"
      ? "text-success"
      : kind === "partial"
        ? "text-pro"
        : kind === "fail"
          ? "text-error"
          : "text-link";
  const title =
    kind === "pass"
      ? "¡Lo lograste!"
      : kind === "partial"
        ? "¡Casi lo tienes!"
        : kind === "fail"
          ? "No del todo"
          : "¡Omitido!";

  // attempt 2 = the answer is revealed ("Let's lock it in"); attempt 1 = withheld hint.
  const sectionLabel =
    attempt === 2 ? "Vamos a fijarlo" : kind === "partial" ? "¿Qué falta?" : "¿Necesitas una pista?";
  const chipText = attempt === 2 ? "Respuesta" : "Pista";
  const chipTone = attempt === 2 ? "text-success" : "text-hint";
  const bodyText = attempt === 2 ? answer : hint;
  const bodyVisible = attempt === 2 || hintRevealed;

  return (
    <div className="relative h-full overflow-hidden">
      {/* Prompt + transcribed answer (behind the sheet). */}
      <div className="flex flex-col gap-6 px-4 pt-4">
        <div className="relative">
          <div className="absolute -left-[6px] top-4 h-3 w-3 rotate-45 rounded-[2px] bg-surface" aria-hidden />
          <div className="rounded-md bg-surface p-4 text-[18px] leading-6 tracking-[0.18px] text-ink">{prompt}</div>
        </div>
        <div className="flex justify-end">
          <div className="flex w-[296px] flex-col gap-1.5 rounded-[18px] rounded-tr-[4px] bg-surface px-3.5 py-3">
            <Waves />
            <p className="text-[18px] leading-6 tracking-[0.18px] text-ink-2">&ldquo;{transcript}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Result sheet */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: "100%" }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        transition={sheet}
        className={`absolute inset-x-0 bottom-0 flex flex-col rounded-t-[36px] border-t border-border ${sheetBg}`}
      >
        <div className="flex justify-center pt-1.5">
          <Grabber />
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 px-7 pt-3">
          <div className="flex flex-1 items-center gap-2">
            {kind === "pass" && (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success text-[color:var(--text-inverse)]">
                <CheckIcon size={20} strokeWidth={3} />
              </span>
            )}
            {kind === "fail" && (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-error text-[color:var(--text-inverse)]">
                <XGlyph />
              </span>
            )}
            {kind === "skip" && <ArrowGlyph className={titleTone} />}
            <h2 className={`text-[28px] font-extrabold leading-7 tracking-[-0.3px] ${titleTone}`}>{title}</h2>
          </div>
          {kind !== "skip" && <Thumbs />}
        </div>

        <div className="flex flex-col gap-6 px-7 pt-5 pb-[max(28px,env(safe-area-inset-bottom))]">
          {/* You covered */}
          {showCovered && covered.length > 0 && (
            <div className="flex flex-col gap-2 rounded-[24px] border-[6px] border-success-on-subtle bg-success-subtle p-4">
              <p className="text-[18px] leading-6 tracking-[0.18px] text-success-on-subtle">Cubriste</p>
              <ul className="flex flex-col gap-2">
                {covered.map((c) => (
                  <li key={c} className="flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0 text-success-on-subtle">
                      <CheckIcon size={16} strokeWidth={2.6} />
                    </span>
                    <span className="text-[15px] leading-5 tracking-[0.15px] text-ink">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Withheld hint (attempt 1) / revealed answer (attempt 2) */}
          {hasHintSection && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[21px] font-bold leading-6 text-ink">{sectionLabel}</p>
                <span className={`flex items-center gap-1.5 ${chipTone}`}>
                  <TargetIcon />
                  <span className="text-[18px] leading-5 tracking-[0.18px]">{chipText}</span>
                </span>
              </div>
              <div className="min-h-[52px]">
                <AnimatePresence mode="wait">
                  {bodyVisible ? (
                    // Hint / answer text — fades in on the SAME screen.
                    <motion.p
                      key="body"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={gentle}
                      className="text-[15px] leading-[21px] tracking-[0.15px] text-ink"
                    >
                      {bodyText}
                    </motion.p>
                  ) : (
                    // Masked teaser bars while the hint is withheld.
                    <motion.div key="masked" exit={{ opacity: 0 }} className="flex flex-col gap-1.5" aria-hidden>
                      <div className="h-4 w-full rounded-full bg-floating" />
                      <div className="h-4 w-full rounded-full bg-floating" />
                      <div className="h-4 w-32 rounded-full bg-floating" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex items-stretch gap-2">
            {kind === "skip" ? (
              <button
                type="button"
                onClick={() => {}}
                aria-label="Deshacer omitir"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface text-ink-2 shadow-[var(--shadow-button-inset)]"
              >
                <UndoGlyph />
              </button>
            ) : (
              <button
                type="button"
                onClick={onWhy}
                className="flex h-14 items-center justify-center rounded-[36px] bg-secondary px-6 text-[18px] font-bold text-on-secondary shadow-[var(--shadow-button-inset)]"
              >
                ¿Por qué?
              </button>
            )}
            <motion.button
              type="button"
              onClick={onPrimary}
              whileTap={{ scale: 0.97 }}
              className={`flex h-14 flex-1 items-center justify-center rounded-[36px] px-6 text-[18px] font-bold shadow-[var(--shadow-button-inset)] ${primaryBg(kind)}`}
            >
              {primaryLabel}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function primaryBg(kind: VerdictKind): string {
  switch (kind) {
    case "pass":
      return "bg-green text-[color:var(--text-inverse)]";
    case "partial":
      return "bg-pro text-[color:var(--pro-on-bold)]";
    case "fail":
      return "bg-error text-[color:var(--text-inverse)]";
    default: // skip
      return "bg-primary text-on-primary";
  }
}

function Waves() {
  const peaks = [0.5, 1, 0.65, 1, 0.55];
  return (
    <div className="flex h-[22px] items-center gap-[3px]" aria-hidden>
      {peaks.map((p, i) => (
        <span key={i} className="w-[3px] rounded-full bg-ink-2" style={{ height: 22 * p }} />
      ))}
    </div>
  );
}

function Thumbs() {
  return (
    <div className="flex items-center gap-4 text-ink-3" aria-hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M7 11V21H5a1 1 0 01-1-1v-8a1 1 0 011-1h2zm0 0l3.5-7A2 2 0 0114 5.8L13 11h5.2a2 2 0 011.95 2.46l-1.4 6A2 2 0 0116.8 21H7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" transform="rotate(180 12 13)" />
      </svg>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M7 11V21H5a1 1 0 01-1-1v-8a1 1 0 011-1h2zm0 0l3.5-7A2 2 0 0114 5.8L13 11h5.2a2 2 0 011.95 2.46l-1.4 6A2 2 0 0116.8 21H7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
function XGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 12h14M12 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UndoGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 7L4 12l5 5M4 12h11a5 5 0 010 10h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
