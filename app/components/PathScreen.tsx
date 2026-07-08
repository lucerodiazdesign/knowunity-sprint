"use client";

import { PathNode, Connector } from "./PathNode";
import { RecallPathNode } from "./RecallPathNode";
import { BoltIcon } from "./icons";
import type { MachineState } from "../lib/useRecallMachine";

/* ---- Inline icons (chrome + sibling-node icons) ------------------------- */

// Document-with-"?" — the generic topic-node icon (siblings). This is exactly
// why the Recall node uses the distinct coral mic instead.
function DocQIcon({ tone = "ink" }: { tone?: "ink" | "brand" }) {
  const cls = tone === "brand" ? "text-brand" : "text-ink";
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`h-full w-full ${cls}`} aria-hidden>
      <path d="M6 3.5h7l5 5V19a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19V5A1.5 1.5 0 016 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12.5 3.5V8a1 1 0 001 1H18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 12.2a2 2 0 013.2 1.6c0 1.3-2 1.6-2 2.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="11.2" cy="18.4" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

// Blue practice-test icon (lines + sparkle) for the mock exam node.
function PracticeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full text-blue" aria-hidden>
      <path d="M4 7h9M4 11h11M4 15h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 4l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9L18.5 4z" fill="currentColor" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={24} height={24} className="text-ink" aria-hidden>
      <path d="M12 6.5C10.5 5 8 4.5 4.5 4.5V17c3.5 0 6 .5 7.5 2 1.5-1.5 4-2 7.5-2V4.5C16 4.5 13.5 5 12 6.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 6.5V19" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function CalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={16} height={16} className="text-blue" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={16} height={16} className="text-success" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function Kebab() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={20} height={20} className="text-ink" aria-hidden>
      {[6, 12, 18].map((cy) => (
        <circle key={cy} cx="12" cy={cy} r="1.7" fill="currentColor" />
      ))}
    </svg>
  );
}
function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={20} height={20} className="text-ink" aria-hidden>
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---- Screen ------------------------------------------------------------- */

export function PathScreen({
  state,
  dispatch,
}: {
  state: MachineState;
  dispatch: (a: any) => void;
}) {
  const done = state.recallStatus === "done";

  return (
    <div className="flex h-full flex-col">
      {/* Subject header */}
      <div className="shrink-0 px-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-brand">
            <BoltIcon size={16} />
            <span className="text-[15px] font-bold tabular-nums">{done ? 2 : 1}</span>
          </div>
          <button type="button" className="flex items-center gap-1" aria-label="Cambiar asignatura">
            <span aria-hidden>📚</span>
            <span className="text-[20px] font-extrabold tracking-[-0.2px] text-ink">Historia</span>
            <Chevron />
          </button>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface" aria-label="Más">
            <Kebab />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-center gap-4 text-[13px]">
          <span className="flex items-center gap-1.5 text-ink-2">
            <CalIcon /> 1 semana
          </span>
          <span className="flex items-center gap-1.5 text-ink-2">
            <TargetIcon /> Meta: 12,5
          </span>
        </div>

        {/* Current-topic card */}
        <div className="mt-3 flex items-stretch overflow-hidden rounded-lg ring-1 ring-border">
          <div className="flex flex-1 items-center px-4 py-3.5">
            <span className="text-[16px] font-bold text-ink">Sistema Feudal</span>
          </div>
          <div className="flex items-center justify-center border-l border-border px-4">
            <BookIcon />
          </div>
        </div>
      </div>

      {/* The path */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <div className="flex flex-col items-center">
          <PathNode state="completed" badge="check" label="Conceptos Clave" icon={<DocQIcon />} />
          <Connector done />
          <PathNode state="completed" badge="check" label="Análisis de Errores" icon={<DocQIcon />} />
          <Connector done />

          {/* Final-review section header — thin centered divider. */}
          <div className="my-4 flex w-full items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="whitespace-nowrap text-[13px] font-bold tracking-[0.1px] text-ink-3">
              Revisión Final y Conexiones
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Voice Recall — native peer node (F5a). Its own 3-state component,
              driven by recallStatus; never inherits the sibling treatment. */}
          <RecallPathNode
            status={state.recallStatus}
            label="Desafío Final"
            onLaunch={() => dispatch({ type: "LAUNCH_RECALL" })}
          />
          <Connector done={done} dots={2} />

          {/* Mock exam — gets UP NEXT only AFTER recall completes. */}
          <PathNode
            state={done ? "available" : "upcoming"}
            badge={done ? "next" : "none"}
            label="Simulación de Examen"
            caption="Examen de práctica"
            icon={<PracticeIcon />}
          />
        </div>
      </div>

      {/* Bottom tab bar (context, decorative) */}
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const Item = ({ children, active, dot }: { children: React.ReactNode; active?: boolean; dot?: boolean }) => (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <span className={active ? "text-ink" : "text-ink-3"}>{children}</span>
      {dot && <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-error" />}
    </div>
  );
  return (
    <div
      className="flex shrink-0 items-center justify-around border-t border-border px-4 pt-2"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
    >
      <Item>
        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" aria-hidden><path d="M4 12a8 8 0 118 8H5.5L4 21v-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
      </Item>
      <Item>
        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" aria-hidden><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </Item>
      <Item active>
        <svg viewBox="0 0 24 24" width={26} height={26} fill="none" aria-hidden><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" /><path d="M18 6l3-3M14.5 9.5l1.5-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </Item>
      <Item dot>
        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" aria-hidden><path d="M8 4.5h8v4a4 4 0 01-8 0v-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M8 6H5.5a2.5 2.5 0 002 3M16 6h2.5a2.5 2.5 0 01-2 3M9.5 15h5M10 19h4M12 12.5V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Item>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-[13px] font-bold text-ink-2">L</div>
    </div>
  );
}
