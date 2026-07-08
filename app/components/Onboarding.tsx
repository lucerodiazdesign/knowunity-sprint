"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { EntryScreen } from "./EntryScreen";
import type { MachineState } from "../lib/useRecallMachine";

// The 2-screen recall onboarding as a paged, swipeable carousel. The page is
// derived from the machine stage (intro=0, primer=1); Continue and swipe drive
// the SAME paged transition, and each page's dots track the active page.
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
  const page = state.stage === "primer" ? 1 : 0;

  // Measure the carousel width so the track/pages/drag use exact px.
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

  const screen1 = (
    <EntryScreen
      artSrc="/images/knowie-bubble-mic.png"
      artAlt="Knowie en una burbuja con un micrófono"
      artWidth={326}
      artHeight={340}
      headline="¡Ya llegan los exámenes de recall!"
      subtitle="Respuestas adaptadas a tus clases"
      activeDot={0}
      ctaLabel="Continuar"
      onContinue={() => dispatch({ type: "INTRO_CONTINUE" })}
      onExit={() => dispatch({ type: "RETURN_TO_PATH" })}
    />
  );
  const screen2 = (
    <EntryScreen
      artSrc="/images/mic-permision.png"
      artAlt="Knowie preparando la solicitud de permiso del micrófono"
      artWidth={326}
      artHeight={386}
      headline="Dale a Knowie acceso a tu micrófono"
      subtitle="Respuestas adaptadas a tus clases"
      activeDot={1}
      ctaLabel={micBusy ? "Solicitando…" : "Continuar"}
      ctaBusy={micBusy}
      onContinue={onPrimerContinue}
      onExit={() => dispatch({ type: "RETURN_TO_PATH" })}
    />
  );

  // Reduced motion → no slide/drag; show the active page (instant/opacity).
  if (reduce) {
    return (
      <div ref={ref} className="h-full w-full">
        <motion.div key={page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full">
          {page === 0 ? screen1 : screen2}
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <motion.div
        className="flex h-full"
        style={{ width: w ? w * 2 : "200%" }}
        drag="x"
        dragConstraints={{ left: -w, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          const far = Math.abs(info.offset.x) > w * 0.25 || Math.abs(info.velocity.x) > 400;
          if (!far) return;
          // Forward slides left (offset < 0); back slides right (offset > 0).
          if (info.offset.x < 0 && page === 0) dispatch({ type: "INTRO_CONTINUE" });
          else if (info.offset.x > 0 && page === 1) dispatch({ type: "PRIMER_BACK" });
        }}
        animate={{ x: -page * w }}
        transition={{ type: "spring", stiffness: 420, damping: 40 }} // ~300ms
      >
        <div className="h-full shrink-0" style={{ width: w || "50%" }}>
          {screen1}
        </div>
        <div className="h-full shrink-0" style={{ width: w || "50%" }}>
          {screen2}
        </div>
      </motion.div>
    </div>
  );
}
