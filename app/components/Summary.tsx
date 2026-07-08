"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { PillButton, GhostButton } from "./controls";
import { BoltIcon } from "./icons";
import { TERMS, type Terminal } from "../lib/script";
import { gentle } from "../lib/motion";
import type { MachineState } from "../lib/useRecallMachine";

// Path-based labels — never a score, never "mastered".
const LABEL: Record<Terminal, { text: string; tone: string }> = {
  unaided_pass: { text: "Por tu cuenta", tone: "text-success-on-subtle" },
  passed_with_hints: { text: "Con una pista", tone: "text-blue-on-subtle" },
  revealed: { text: "Lo repasamos juntos", tone: "text-brand-on-subtle" },
  skipped: { text: "Omitido por ahora", tone: "text-ink-3" },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: gentle },
};

export function Summary({
  state,
  dispatch,
}: {
  state: MachineState;
  dispatch: (a: any) => void;
}) {
  const reduce = useReducedMotion();
  const [collecting, setCollecting] = useState(false);

  const unaided = state.results.filter((r) => r === "unaided_pass").length;
  const total = TERMS.length;
  const hasMissed = state.results.some((r) => r && r !== "unaided_pass");

  function onContinue() {
    setCollecting(true);
    // Brief XP-collect beat, then soft-gate back to the path: node Completed,
    // path advances. Reached on ANY terminal outcome, incl. all-skipped.
    window.setTimeout(() => dispatch({ type: "COMPLETE_AND_RETURN" }), 1100);
  }

  return (
    <div className="flex h-full flex-col px-6" style={{ paddingTop: "max(16px, env(safe-area-inset-top))", paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
      <motion.div
        className="flex flex-1 flex-col overflow-y-auto pt-4"
        variants={reduce ? undefined : container}
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
      >
        <motion.div variants={reduce ? undefined : item} className="flex flex-col items-center text-center">
          <Image src="/images/amazed.png" alt="Knowie, encantado con tu sesión" width={150} height={150} priority />
          <h1 className="mt-2 text-[28px] font-extrabold leading-[30px] tracking-[-0.4px] text-ink">
            ¡Buen trabajo!
          </h1>
          <p className="mt-2 text-[16px] leading-[22px] text-ink-2">
            Explicaste{" "}
            <span className="font-bold text-ink">
              {unaided} de {total}
            </span>{" "}
            por tu cuenta.
          </p>
        </motion.div>

        {/* Stat cards — no score. */}
        <motion.div variants={reduce ? undefined : item} className="mt-6 flex gap-3">
          <div className="flex flex-1 flex-col gap-1 rounded-md bg-surface p-4">
            <span className="flex items-center gap-1 text-blue-on-subtle">
              <BoltIcon size={16} />
              <span className="text-[12px] font-bold">XP ganada</span>
            </span>
            <span className="text-[24px] font-extrabold text-ink tabular-nums">+{state.xp}</span>
          </div>
          <div className="flex flex-1 flex-col gap-1 rounded-md bg-surface p-4">
            <span className="text-[12px] font-bold text-success-on-subtle">Sin ayuda</span>
            <span className="text-[24px] font-extrabold text-ink tabular-nums">
              {unaided}
              <span className="text-[16px] text-ink-3">/{total}</span>
            </span>
          </div>
        </motion.div>

        {/* Per-term breakdown. */}
        <motion.ul variants={reduce ? undefined : item} className="mt-5 flex flex-col gap-2">
          {TERMS.map((t, i) => {
            const r = state.results[i];
            // By the summary every term is terminal; guard the transient state.
            const label = r && r !== "pending_retry" ? LABEL[r] : { text: "—", tone: "text-ink-3" };
            return (
              <li key={t.id} className="flex items-center justify-between rounded-md bg-surface px-4 py-3">
                <span className="mr-3 flex-1 truncate text-[15px] font-semibold text-ink">
                  {t.title}
                </span>
                <span className={`shrink-0 text-[13px] font-bold ${label.tone}`}>{label.text}</span>
              </li>
            );
          })}
        </motion.ul>

        <motion.p variants={reduce ? undefined : item} className="mt-4 text-center text-[13px] leading-[18px] text-ink-2">
          {hasMissed
            ? "El recall se fija con la repetición: vuelve a practicar los que no clavaste y repite antes del examen."
            : "Vas muy bien. Vuelve y repite antes del examen para fijarlo."}
        </motion.p>
      </motion.div>

      {/* Exits */}
      <div className="mt-4 flex flex-col gap-2">
        <PillButton onClick={onContinue} disabled={collecting}>
          {collecting ? (
            <motion.span
              className="flex items-center gap-1"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5 }}
            >
              <BoltIcon size={18} /> +{state.xp} conseguidos
            </motion.span>
          ) : (
            "Continuar"
          )}
        </PillButton>
        {hasMissed && (
          <GhostButton onClick={() => dispatch({ type: "TRY_MISSED" })} disabled={collecting}>
            Repite los más difíciles
          </GhostButton>
        )}
      </div>
    </div>
  );
}
