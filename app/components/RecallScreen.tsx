"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "./chrome";
import { Waveform, KnowieBubble, type WaveMode } from "./pieces";
import {
  MicButton,
  ControlButton,
  PillButton,
  GhostButton,
  TextButton,
} from "./controls";
import { TrashIcon, PlayIcon, StopIcon, TextIcon, SendIcon } from "./icons";
import { Processing } from "./Processing";
import { Verdict } from "./Verdict";
import { TERMS } from "../lib/script";
import type { MachineState } from "../lib/useRecallMachine";

const POSE = {
  ask: { src: "/images/standby.png", alt: "Knowie esperando, listo para escucharte" },
};

// A short silent WAV, generated at runtime, used as the "recorded take" so
// Replay drives a REAL <audio> element — the waveform sweep syncs to its
// currentTime via timeupdate (no fixed timer). AUDIO ONLY: never a transcript.
function makeSilentWav(seconds: number, sampleRate = 8000): string {
  const n = Math.max(1, Math.floor(seconds * sampleRate));
  const buffer = new ArrayBuffer(44 + n);
  const view = new DataView(buffer);
  const w = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  w(0, "RIFF"); view.setUint32(4, 36 + n, true); w(8, "WAVE");
  w(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true); view.setUint16(34, 8, true);
  w(36, "data"); view.setUint32(40, n, true);
  for (let i = 0; i < n; i++) view.setUint8(44 + i, 128); // 8-bit silence
  const bytes = new Uint8Array(buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return "data:audio/wav;base64," + btoa(bin);
}

// ONE per-term loop, used identically for every term. Phases:
// idle → recording → review → (Send) → processing → verdict.
export function RecallScreen({
  state,
  dispatch,
}: {
  state: MachineState;
  dispatch: (a: any) => void;
}) {
  const stop = state.stops[state.ptr];
  const term = stop ? TERMS[stop.termIdx] : TERMS[0];
  const pass = stop?.pass ?? 1; // 1 = first presentation, 2 = queued retry
  const phase = state.phase;
  const recording = phase === "recording";
  const hasTake = phase === "review";

  // Progress = terminally-resolved terms only ("pending_retry" is still in flight).
  const resolved = state.results.filter((r) => r && r !== "pending_retry").length;
  const progress = resolved / TERMS.length;

  // ---- Replay playback (audio-synced waveform) ----
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const audioSrc = useMemo(() => makeSilentWav(2.6), []);

  const resetPlayback = () => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setPlaying(false);
    setPlayProgress(0);
  };
  // Any exit from review (Send / Erase / advance) stops playback.
  useEffect(() => {
    if (phase !== "review") resetPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const onReplay = () => {
    if (!hasTake) return;
    if (playing) {
      resetPlayback();
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    setPlaying(true); // engage the playing/stop affordance + sweep mode at once
    a.play().catch(() => {}); // muted take → allowed; sweep is driven by timeupdate
  };

  const topbar = (
    <TopBar progress={progress} xp={state.xp} onClose={() => dispatch({ type: "RETURN_TO_PATH" })} />
  );

  // Verdict — transcribed answer renders HERE (post-processing), never on record.
  if (phase === "verdict") {
    const covered =
      state.verdictKind === "pass" ? term.themes : term.themes.slice(0, term.partialCovered);
    return (
      <div className="flex h-full flex-col">
        {topbar}
        <div className="relative min-h-0 flex-1">
          <Verdict
            kind={state.verdictKind}
            attempt={pass}
            hintRevealed={state.hintRevealed}
            prompt={term.prompt}
            transcript={state.transcript}
            covered={covered}
            hint={term.hint}
            answer={term.fullAnswer}
            onPrimary={() => dispatch({ type: "VERDICT_PRIMARY" })}
            onWhy={() => dispatch({ type: "OPEN_CHAT" })}
          />
        </div>
      </div>
    );
  }

  // Processing — computing (STT + judge). Its own Figma layout.
  if (phase === "processing") {
    return (
      <div className="flex h-full flex-col">
        {topbar}
        <div className="min-h-0 flex-1">
          <Processing prompt={term.prompt} transcript={state.transcript} />
        </div>
      </div>
    );
  }

  // ---- Record screen (idle / recording / review) — layout per Figma 13766-13630.
  const waveMode: WaveMode = recording
    ? "recording"
    : playing
      ? "playing"
      : hasTake
        ? "still"
        : "idle";
  const helper = recording
    ? "Escuchando… toca para parar"
    : playing
      ? "Reproduciendo…"
      : hasTake
        ? "¿Te convence? Envíalo"
        : "Toca el micro para empezar";

  return (
    <div className="flex h-full flex-col">
      {topbar}

      <div className="relative flex-1 overflow-hidden">
        {/* Prompt bubble — top 24 (top 12 + tag on a pass-2 retry). */}
        <div className="absolute left-4 right-4" style={{ top: pass === 2 ? 12 : 24 }}>
          {pass === 2 && (
            <div className="mb-2">
              <PreviousMistakeTag />
            </div>
          )}
          <KnowieBubble mascot={POSE.ask.src} alt={POSE.ask.alt}>{term.prompt}</KnowieBubble>
        </div>

        {/* Answer waveform + helper — top 212, w 358. */}
        <div className="absolute left-4 flex w-[358px] flex-col items-center" style={{ top: 212 }}>
          <Waveform mode={waveMode} progress={playProgress} />
          <p className="text-[12px] font-medium leading-4 tracking-[0.12px] text-ink-3">{helper}</p>
        </div>

        {/* Control row + mic — top 376, centred, 30px gap. Controls unchanged. */}
        <div className="absolute left-1/2 flex w-[248px] -translate-x-1/2 flex-col items-center" style={{ top: 376, gap: 30 }}>
          <div className="flex w-[248px] items-start justify-between">
            <ControlButton icon={<TrashIcon size={22} />} label="Borrar" onClick={() => dispatch({ type: "ERASE" })} disabled={!hasTake} />
            <ControlButton
              icon={playing ? <StopIcon size={20} /> : <PlayIcon size={22} />}
              label="Reproducir"
              onClick={onReplay}
              disabled={!hasTake}
            />
            <ControlButton icon={<TextIcon size={24} />} label="Usar texto" onClick={() => dispatch({ type: "OPEN_TEXT" })} disabled={recording} />
          </div>
          <MicButton recording={recording} onClick={() => dispatch({ type: recording ? "STOP_MIC" : "TAP_MIC" })} />
        </div>
      </div>

      {/* Bottom action — p28, gap 2: Not relevant, then Send. */}
      <div className="flex flex-col gap-0.5 px-7 pt-7" style={{ paddingBottom: "max(28px, env(safe-area-inset-bottom))" }}>
        <TextButton onClick={() => dispatch({ type: "SKIP" })}>No relevante</TextButton>
        {hasTake ? (
          <PillButton onClick={() => dispatch({ type: "SEND" })}>
            Enviar <SendIcon size={20} />
          </PillButton>
        ) : (
          <GhostButton disabled>Enviar</GhostButton>
        )}
      </div>

      {/* Hidden real audio element — the waveform sweep syncs to its currentTime
          via timeupdate. Muted: the "take" is a mocked silent clip (no real
          recording), so there is nothing to hear, and muted playback is never
          blocked by autoplay policy. */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        muted
        className="hidden"
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (a.duration) setPlayProgress(Math.min(1, a.currentTime / a.duration));
        }}
        onEnded={resetPlayback}
      />
    </div>
  );
}

// "Previous Mistake" repeat tag on a pass-2 (queued retry) record screen.
function PreviousMistakeTag() {
  return (
    <div className="flex items-center gap-2 pl-1">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pro text-[color:var(--pro-on-bold)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 9a7 7 0 0111.8-3.1L19 9M20 15a7 7 0 01-11.8 3.1L5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 5v4h-4M5 19v-4h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[15px] font-bold tracking-[0.15px] text-pro">Error anterior</span>
    </div>
  );
}
