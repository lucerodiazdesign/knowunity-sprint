"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { PillButton } from "./controls";
import { CloseIcon } from "./icons";
import { gentle, soft } from "../lib/motion";
import type { MachineState } from "../lib/useRecallMachine";

// The 2-screen recall onboarding. Only the slide CONTENT (art + headline +
// subtitle) lives inside the container-slider and translates; the page control
// and Continue button are STATIC siblings outside it. Advancing is an internal
// translateX within the fixed container — NOT a route change / full-page nav.
// The active page is derived from the machine stage (intro=0, primer=1), so the
// component stays mounted across the advance (page.tsx keys both stages the same).

// Static 2-dot page control (Apple HIG glass pill, per Figma). Its position is
// FIXED — only the active-dot state changes as the slider advances.
function PageControl({ active }: { active: 0 | 1 }) {
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

type SlideData = {
  artSrc: string;
  artAlt: string;
  artWidth: number;
  artHeight: number;
  headline: string;
  subtitle: string;
};

// One slide's content — hero art + headline + subtitle. This is the ONLY thing
// inside the slider that moves; dots + Continue are static.
function Slide({ artSrc, artAlt, artWidth, artHeight, headline, subtitle }: SlideData) {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-full flex-col items-center px-6">
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
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...soft, delay: 0.05 }}
        className="flex flex-col items-center gap-3 pb-2"
      >
        <h1 className="max-w-[320px] text-center text-[32px] font-extrabold leading-[36px] tracking-[-0.3px] text-ink">
          {headline}
        </h1>
        <p className="max-w-[280px] text-center text-[18px] font-bold leading-[22px] text-ink-2">
          {subtitle}
        </p>
      </motion.div>
    </div>
  );
}

// Slide 1 copy is the feature intro; slide 2 (mic permission) copy is unchanged.
const SLIDES: SlideData[] = [
  {
    artSrc: "/images/knowie-bubble-mic.png",
    artAlt: "Knowie en una burbuja con un micrófono",
    artWidth: 326,
    artHeight: 340,
    headline: "You've read it. Can you say it?",
    subtitle: "Explain each idea to Knowie out loud. That's how you find out what you actually know.",
  },
  {
    artSrc: "/images/mic-permision.png",
    artAlt: "Knowie preparando la solicitud de permiso del micrófono",
    artWidth: 326,
    artHeight: 386,
    headline: "Dale a Knowie acceso a tu micrófono",
    subtitle: "Respuestas adaptadas a tus clases",
  },
];

export function Onboarding({
  state,
  dispatch,
  micBusy,
  onPrimerContinue,
}: {
  state: MachineState;
  dispatch: (a: any) => void;
  micBusy: boolean;
  onPrimerContinue: () => void;
}) {
  const reduce = useReducedMotion();
  const page: 0 | 1 = state.stage === "primer" ? 1 : 0;

  // Measure the container-slider so the track/panes/drag use exact px.
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setW(el.offsetWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Continue: on slide 1, advance the slider internally (intro → primer). On
  // slide 2, it becomes the flow's next step (proceed past onboarding).
  const onContinue = () => {
    if (page === 0) dispatch({ type: "INTRO_CONTINUE" });
    else onPrimerContinue();
  };
  const ctaBusy = page === 1 && micBusy;
  const ctaLabel = ctaBusy ? "Solicitando…" : "Continuar";

  return (
    <div className="flex h-full flex-col">
      {/* Static close (top-left) — exiting here leaves the node NOT_STARTED. */}
      <div className="flex h-12 shrink-0 items-center px-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "RETURN_TO_PATH" })}
          aria-label="Cerrar introducción"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink"
        >
          <CloseIcon size={24} />
        </button>
      </div>

      {/* container-slider — FIXED outer container (overflow-hidden). Its inner
          track translates via translateX between slides: an internal transform,
          never a route change. Swipe drives the SAME advance. */}
      <div ref={ref} className="relative flex-1 overflow-hidden">
        <motion.div
          className="flex h-full"
          style={{ width: w ? w * 2 : "200%" }}
          drag={reduce ? false : "x"}
          dragConstraints={{ left: -w, right: 0 }}
          dragElastic={0.12}
          onDragEnd={
            reduce
              ? undefined
              : (_, info) => {
                  const far = Math.abs(info.offset.x) > w * 0.25 || Math.abs(info.velocity.x) > 400;
                  if (!far) return;
                  if (info.offset.x < 0 && page === 0) dispatch({ type: "INTRO_CONTINUE" });
                  else if (info.offset.x > 0 && page === 1) dispatch({ type: "PRIMER_BACK" });
                }
          }
          animate={{ x: -page * w }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 40 }} // ~300ms
        >
          {SLIDES.map((s, i) => (
            <div key={i} className="h-full shrink-0" style={{ width: w || "50%" }}>
              <Slide {...s} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* STATIC page control — never slides; only the active dot changes. */}
      <div className="flex shrink-0 justify-center pb-1 pt-1">
        <PageControl active={page} />
      </div>

      {/* STATIC Continue — one button; its action depends on the active slide. */}
      <div className="shrink-0 px-7 pt-2" style={{ paddingBottom: "max(28px, env(safe-area-inset-bottom))" }}>
        <PillButton size="lg" onClick={onContinue} disabled={ctaBusy}>
          {ctaLabel}
        </PillButton>
      </div>
    </div>
  );
}
