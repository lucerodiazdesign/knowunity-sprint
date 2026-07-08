"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { StatusBar } from "./components/chrome";
import { RecallScreen } from "./components/RecallScreen";
import { Summary } from "./components/Summary";
import { Onboarding } from "./components/Onboarding";
import { PathScreen } from "./components/PathScreen";
import { TextFallbackSheet, AIChatSheet } from "./components/overlays";
import { useRecallMachine } from "./lib/useRecallMachine";
import { TERMS } from "./lib/script";
import { soft } from "./lib/motion";

export default function Page() {
  const { state, dispatch } = useRecallMachine();
  const reduce = useReducedMotion();
  const [micBusy, setMicBusy] = useState(false);

  // The term the student is currently on — seeds the AI Chat so "¿Por qué?"
  // explains THIS term, not a blank chat.
  const currentStop = state.stops[state.ptr];
  const currentTerm = currentStop ? TERMS[currentStop.termIdx] : TERMS[0];

  // Screen 2 Continue: trigger the REAL OS microphone permission request, then
  // proceed no matter the outcome (granted or denied — never dead-end). The
  // recall itself stays mocked; we stop the tracks immediately.
  async function handlePrimerContinue() {
    setMicBusy(true);
    try {
      const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
      stream?.getTracks().forEach((t) => t.stop());
    } catch {
      // denied, dismissed, or unsupported — fall through and proceed.
    } finally {
      setMicBusy(false);
      dispatch({ type: "PRIMER_ALLOW" });
    }
  }

  // Push/slide transition shared by every full-screen stage.
  const stageMotion = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, x: 24 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, x: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, x: -24 },
    transition: soft,
    className: "absolute inset-0",
  } as const;

  return (
    <div className="device-stage">
      <div className="device">
        <StatusBar />

        <div className="relative h-[calc(100%-48px)] w-full">
          <AnimatePresence mode="wait">
            {state.stage === "path" && (
              <motion.div key="path" {...stageMotion}>
                <PathScreen state={state} dispatch={dispatch} />
              </motion.div>
            )}

            {(state.stage === "intro" || state.stage === "primer") && (
              // One paged carousel for both onboarding screens (keyed stably so
              // intro↔primer slides inside it, not remount).
              <motion.div key="onboarding" {...stageMotion}>
                <Onboarding
                  state={state}
                  dispatch={dispatch}
                  micBusy={micBusy}
                  onPrimerContinue={handlePrimerContinue}
                />
              </motion.div>
            )}

            {state.stage === "recall" && (
              <motion.div key="recall" {...stageMotion}>
                <RecallScreen state={state} dispatch={dispatch} />
              </motion.div>
            )}

            {state.stage === "summary" && (
              <motion.div key="summary" {...stageMotion}>
                <Summary state={state} dispatch={dispatch} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay — text fallback. */}
          <AnimatePresence>
            {state.textSheet && (
              <TextFallbackSheet
                key="text"
                onClose={() => dispatch({ type: "CLOSE_TEXT" })}
                onSubmit={(text) => dispatch({ type: "SUBMIT_TEXT", text })}
              />
            )}
          </AnimatePresence>

          {/* Overlay — AI Chat ("¿Por qué?"). Sits ON TOP of the recall term,
              which stays mounted underneath; dismissing returns to the exact
              same term state. Seeded with the current term's explanation. */}
          <AnimatePresence>
            {state.chatSheet && (
              <AIChatSheet
                key="chat"
                title="Historia 101"
                heading="¿Qué te falta?"
                explanation={currentTerm.fullAnswer}
                onClose={() => dispatch({ type: "CLOSE_CHAT" })}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
