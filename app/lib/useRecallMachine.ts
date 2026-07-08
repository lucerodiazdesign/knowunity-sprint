"use client";

import { useEffect, useReducer } from "react";
import {
  TERMS,
  XP_PER_TERM,
  PROCESSING_MS,
  HINT_DELAY_MS,
  type Terminal,
  type TakeResult,
} from "./script";

// ---- Types ---------------------------------------------------------------

export type Stage = "path" | "intro" | "primer" | "recall" | "summary";
export type RecallStatus = "not_started" | "in_progress" | "done";

// DEFERRED RETRY QUEUE (two-pass). Pass 1 presents every term once, in order;
// a partial/fail is ENQUEUED (state = "pending_retry") and the loop advances to
// the NEXT first-pass term (no inline retry). Pass 2 drains the queue in order.
export type Phase =
  | "idle" // term shown, mic ready
  | "recording" // mic live
  | "review" // captured take (audio) — NO transcript shown
  | "processing" // STT + judge window (~PROCESSING_MS)
  | "verdict"; // verdict screen (parametrised by verdictKind + pass)

export type VerdictKind = "pass" | "partial" | "fail" | "skip";

// A term's stored state. "pending_retry" is queue membership — NEVER "fail" —
// and resolves terminally only in pass 2.
export type StoredResult = Terminal | "pending_retry";

interface Stop {
  termIdx: number;
  pass: 1 | 2; // pass 1 = first presentation; pass 2 = queued retry
}

export interface MachineState {
  stage: Stage;
  recallStatus: RecallStatus;
  hasSeenRecallOnboarding: boolean;
  loopEntered: boolean;

  stops: Stop[]; // pass-1 stops up front; pass-2 (retry) stops appended on enqueue
  ptr: number;
  phase: Phase;
  results: (StoredResult | undefined)[]; // by termIdx

  xp: number;
  xpCollected: boolean;

  transcript: string; // captured take — shown ONLY post-Send
  currentResult: TakeResult; // judged result of the current take
  verdictKind: VerdictKind;
  hintRevealed: boolean; // 2-beat (pass 1 only): hint withheld, then fades in

  textSheet: boolean;
  chatSheet: boolean; // "¿Por qué?" → AI Chat overlay (in-context help, not navigation)
}

type Action =
  | { type: "LAUNCH_RECALL" }
  | { type: "RETURN_TO_PATH" }
  | { type: "COMPLETE_AND_RETURN" }
  | { type: "INTRO_CONTINUE" }
  | { type: "INTRO_SKIP" }
  | { type: "PRIMER_BACK" } // onboarding carousel: swipe back to screen 1
  | { type: "PRIMER_ALLOW" }
  | { type: "TAP_MIC" }
  | { type: "STOP_MIC" }
  | { type: "ERASE" }
  | { type: "SEND" }
  | { type: "PROCESSING_DONE" }
  | { type: "HINT_REVEAL" } // deliberate: the withheld hint fades in (same screen)
  | { type: "VERDICT_PRIMARY" } // Continue / Got it — routes by verdictKind + pass
  | { type: "SKIP" }
  | { type: "OPEN_TEXT" }
  | { type: "CLOSE_TEXT" }
  | { type: "SUBMIT_TEXT"; text: string }
  | { type: "OPEN_CHAT" } // "¿Por qué?" — open the AI Chat overlay for the current term
  | { type: "CLOSE_CHAT" }
  | { type: "COLLECT_XP" }
  | { type: "TRY_MISSED" }
  | { type: "RESTART" };

// ---- Initial -------------------------------------------------------------

function freshSession() {
  return {
    loopEntered: false,
    stops: TERMS.map((_, i) => ({ termIdx: i, pass: 1 as const })),
    ptr: 0,
    phase: "idle" as Phase,
    results: TERMS.map(() => undefined) as (StoredResult | undefined)[],
    xp: 0,
    xpCollected: false,
    transcript: "",
    currentResult: "fail" as TakeResult,
    verdictKind: "pass" as VerdictKind,
    hintRevealed: false,
    textSheet: false,
    chatSheet: false,
  };
}

function initialState(): MachineState {
  return {
    stage: "path",
    recallStatus: "not_started",
    hasSeenRecallOnboarding: false,
    ...freshSession(),
  };
}

// Resolve the current term terminally and move to the next stop (or summary).
function resolveAndAdvance(
  state: MachineState,
  termIdx: number,
  terminal: Terminal,
): MachineState {
  const results = state.results.slice();
  results[termIdx] = terminal;
  const xp = state.xp + (terminal === "skipped" ? 0 : XP_PER_TERM);
  const nextPtr = state.ptr + 1;
  const base = { ...state, results, xp };
  // Completion: pass 1 done AND queue drained (ptr past all stops).
  if (nextPtr >= state.stops.length) {
    return { ...base, stage: "summary", phase: "idle" };
  }
  return {
    ...base,
    ptr: nextPtr,
    phase: "idle",
    transcript: "",
    currentResult: "fail",
    hintRevealed: false,
  };
}

const resultForPass = (term: (typeof TERMS)[number], pass: 1 | 2): TakeResult =>
  pass === 1 ? term.attempt1Result : term.attempt2Result;
const transcriptForPass = (term: (typeof TERMS)[number], pass: 1 | 2): string =>
  pass === 1 ? term.attempt1Transcript : term.attempt2Transcript;

function reducer(state: MachineState, action: Action): MachineState {
  const stop = state.stops[state.ptr];
  const term = stop ? TERMS[stop.termIdx] : undefined;
  const pass = stop?.pass ?? 1;

  switch (action.type) {
    // ---- Path ⇄ flow (F6/F7) ----
    case "LAUNCH_RECALL": {
      const seen = state.hasSeenRecallOnboarding;
      return { ...state, ...freshSession(), stage: seen ? "recall" : "intro", loopEntered: seen };
    }
    case "RETURN_TO_PATH":
      return {
        ...state,
        stage: "path",
        recallStatus:
          state.recallStatus === "done"
            ? "done"
            : state.loopEntered
              ? "in_progress"
              : "not_started",
        textSheet: false,
        chatSheet: false,
      };
    case "COMPLETE_AND_RETURN":
      return { ...state, stage: "path", recallStatus: "done", textSheet: false, chatSheet: false };

    case "INTRO_CONTINUE":
      return { ...state, stage: "primer" };
    case "PRIMER_BACK":
      return { ...state, stage: "intro" };
    case "INTRO_SKIP":
    case "PRIMER_ALLOW":
      return {
        ...state,
        stage: "recall",
        phase: "idle",
        hasSeenRecallOnboarding: true,
        loopEntered: true,
      };

    // ---- Per-term loop ----
    case "TAP_MIC":
      return { ...state, phase: "recording" };

    case "STOP_MIC": {
      if (!term) return state;
      return {
        ...state,
        phase: "review",
        transcript: transcriptForPass(term, pass),
        currentResult: resultForPass(term, pass),
      };
    }

    case "ERASE":
      return { ...state, phase: "idle", transcript: "" };

    case "SEND":
      return { ...state, phase: "processing" };

    case "PROCESSING_DONE":
      // Pass 1 withholds the hint (2-beat); pass 2 (retry) reveals the answer.
      return {
        ...state,
        phase: "verdict",
        verdictKind: state.currentResult,
        hintRevealed: pass === 2,
      };

    case "HINT_REVEAL":
      return { ...state, hintRevealed: true };

    case "SKIP":
      return { ...state, phase: "verdict", verdictKind: "skip", hintRevealed: true };

    case "VERDICT_PRIMARY": {
      if (!stop || !term) return state;
      const { termIdx } = stop;

      if (state.verdictKind === "skip") {
        return resolveAndAdvance(state, termIdx, "skipped");
      }

      if (pass === 1) {
        if (state.verdictKind === "pass") {
          return resolveAndAdvance(state, termIdx, "unaided_pass"); // not queued
        }
        // partial / fail → ENQUEUE (pending_retry) + advance to NEXT pass-1 term.
        const results = state.results.slice();
        results[termIdx] = "pending_retry";
        const stops = state.stops.concat({ termIdx, pass: 2 });
        return {
          ...state,
          results,
          stops,
          ptr: state.ptr + 1,
          phase: "idle",
          transcript: "",
          currentResult: "fail",
          hintRevealed: false,
        };
      }

      // pass 2 (retry) — resolves terminally.
      if (state.verdictKind === "pass") {
        // passed_with_hints — NODE NOT PROVIDED; guarded, never routed to a
        // reveal frame. Not hit by the demo (T2 partial, T3 fail).
        return resolveAndAdvance(state, termIdx, "passed_with_hints");
      }
      return resolveAndAdvance(state, termIdx, "revealed");
    }

    // ---- Text fallback ----
    case "OPEN_TEXT":
      return { ...state, textSheet: true };
    case "CLOSE_TEXT":
      return { ...state, textSheet: false };

    // ---- AI Chat overlay ("¿Por qué?") ----
    // Pure overlay toggles — they touch NOTHING else (ptr, phase, verdictKind,
    // hintRevealed, attempt all stay put), so dismissing returns to the exact
    // same term state. In-context help, never a navigation away.
    case "OPEN_CHAT":
      return { ...state, chatSheet: true };
    case "CLOSE_CHAT":
      return { ...state, chatSheet: false };
    case "SUBMIT_TEXT": {
      if (!term) return state;
      return {
        ...state,
        textSheet: false,
        phase: "processing",
        transcript: action.text || transcriptForPass(term, pass),
        currentResult: resultForPass(term, pass),
      };
    }

    // ---- Summary / reset ----
    case "COLLECT_XP":
      return { ...state, xpCollected: true };
    case "RESTART":
      return initialState();
    case "TRY_MISSED": {
      const missed = state.results
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => r && r !== "unaided_pass")
        .map(({ i }) => i);
      const idxs = missed.length ? missed : TERMS.map((_, i) => i);
      return {
        ...state,
        ...freshSession(),
        stage: "recall",
        loopEntered: true,
        stops: idxs.map((i) => ({ termIdx: i, pass: 1 as const })),
      };
    }

    default:
      return state;
  }
}

// ---- Hook ----------------------------------------------------------------

export function useRecallMachine() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    if (state.stage !== "recall") return;
    const stop = state.stops[state.ptr];
    if (!stop) return;
    let t: ReturnType<typeof setTimeout> | undefined;

    if (state.phase === "processing") {
      // Computing latency (STT + judge).
      t = setTimeout(() => dispatch({ type: "PROCESSING_DONE" }), PROCESSING_MS);
    } else if (
      state.phase === "verdict" &&
      (state.verdictKind === "partial" || state.verdictKind === "fail") &&
      stop.pass === 1 &&
      !state.hintRevealed
    ) {
      // Deliberate retrieval beat — the hint is withheld, then fades in.
      t = setTimeout(() => dispatch({ type: "HINT_REVEAL" }), HINT_DELAY_MS);
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [state.stage, state.phase, state.verdictKind, state.hintRevealed, state.ptr, state.stops]);

  return { state, dispatch };
}
