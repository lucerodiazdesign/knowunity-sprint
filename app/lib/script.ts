// ============================================================
// Deterministic mock script — History set (feudal system + WWI + Industrial
// Revolution). THIS IS A MOCK: no STT, no audio, no model, no API. Each take's
// judged result is fixed so behaviour is identical every run.
//
// Per-term loop (ONE shared machine for every term, 3–5/session):
//   attempt 1 → SEND → processing → verdict
//     pass    → unaided_pass (terminal)
//     partial → verdict + hint (2-beat) → record attempt 2
//     fail    → verdict + hint (2-beat) → record attempt 2
//   attempt 2 → SEND → processing → verdict
//     pass    → passed_with_hints (terminal)   [node pending — guarded stub]
//     partial → answer revealed → revealed (terminal)
//     fail    → answer revealed → revealed (terminal)
//   skip (any time) → skip verdict → skipped (terminal)
//
// "fail" is a VERDICT TIER, never terminal/persisted. Every term resolves to
// exactly one of: unaided_pass, passed_with_hints, revealed, skipped.
// ============================================================

export type Terminal =
  | "unaided_pass"
  | "passed_with_hints"
  | "revealed"
  | "skipped";

// Judge outcome for a single take.
export type TakeResult = "pass" | "partial" | "fail";

export interface Term {
  id: string;
  subject: string;
  /** Short label for the summary breakdown. */
  title: string;
  /** The question Knowie asks. */
  prompt: string;

  /** Key points the judge looks for — the "You covered" checklist (pass = all,
   *  partial = the first `partialCovered`). Not shown on a fail. */
  themes: string[];
  partialCovered: number;

  /** The withheld nudge — "What is missing?" (partial) / "Need a hint?" (fail).
   *  Hidden on the verdict, then fades in after HINT_DELAY on the SAME screen. */
  hint: string;
  /** Full answer — shown on the attempt-2 reveal ("Let's lock it in") and "Why?". */
  fullAnswer: string;

  /** Fixed judged result per attempt. */
  attempt1Result: TakeResult;
  attempt2Result: TakeResult;
  attempt1Transcript: string;
  attempt2Transcript: string;
}

export const TERMS: Term[] = [
  {
    id: "feudal-system",
    subject: "Historia",
    title: "El sistema feudal",
    prompt:
      "Explica el sistema feudal con tus propias palabras: ¿qué relación había entre señores y vasallos, y qué obtenía cada parte?",
    themes: [
      "Se concedían tierras a cambio de lealtad",
      "Los vasallos debían servicio militar (caballeros)",
      "Los siervos trabajaban la tierra a cambio de protección",
    ],
    partialCovered: 3,
    hint: "",
    fullAnswer:
      "El feudalismo era un sistema medieval basado en la tierra y la lealtad. Un monarca concedía tierras (un feudo) a los señores, que se convertían en vasallos y le debían servicio militar y fidelidad a cambio. Los campesinos y siervos trabajaban esa tierra a cambio de protección. Las obligaciones subían por la jerarquía; la tierra y la protección bajaban.",
    // First take nails it → unaided pass.
    attempt1Result: "pass",
    attempt2Result: "pass",
    attempt1Transcript:
      "Era un sistema donde el rey daba tierras a los señores, y a cambio los señores —los vasallos— juraban lealtad y prestaban servicio militar, como aportar caballeros. Los campesinos trabajaban la tierra a cambio de protección. Así que básicamente se intercambiaba tierra por lealtad y servicio, arriba y abajo en la jerarquía.",
    attempt2Transcript: "",
  },
  {
    id: "causes-ww1",
    subject: "Historia",
    title: "Las causas de la Primera Guerra Mundial",
    prompt:
      "Explica las principales causas de la Primera Guerra Mundial: ¿qué llevó realmente a Europa a la guerra en 1914?",
    themes: [
      "El asesinato de Francisco Fernando fue la chispa",
      "Las alianzas rivales arrastraron a los países",
      "Las causas de fondo (M.A.I.N.) crearon la tensión",
    ],
    partialCovered: 1,
    hint: "Ya tienes la chispa: el asesinato de 1914. Pero piensa en los años de tensión previos. ¿Qué sistemas rivales tenían a Europa en un pulso?",
    fullAnswer:
      "Las causas de fondo de la Primera Guerra Mundial se resumen en M.A.I.N.: Militarismo (una carrera armamentística), Alianzas (dos bloques rivales: la Triple Entente y la Triple Alianza), Imperialismo (competencia por las colonias) y Nacionalismo (ambiciones rivales, sobre todo en los Balcanes). El asesinato del archiduque Francisco Fernando en Sarajevo, en junio de 1914, fue el detonante inmediato que puso en marcha las alianzas.",
    // T2: partial on both passes → queued, then answer revealed → revealed.
    attempt1Result: "partial",
    attempt2Result: "partial",
    attempt1Transcript:
      "Había mucha tensión entre los países, y luego asesinaron a alguien importante, así que estalló la guerra.",
    attempt2Transcript:
      "Eh… había alianzas entre los países, ¿y el asesinato lo desencadenó?",
  },
  {
    id: "industrial-revolution",
    subject: "Historia",
    title: "La Revolución Industrial",
    prompt:
      "Explica la Revolución Industrial: ¿qué cambió y por qué empezó en Gran Bretaña?",
    themes: [
      "Las máquinas y las fábricas sustituyeron la producción manual",
      "El carbón y el hierro de Gran Bretaña la impulsaron",
      "El capital del comercio y el imperio la financió",
    ],
    partialCovered: 0,
    hint: "Piensa en lo que Gran Bretaña tenía en abundancia, bajo tierra, para mover todas esas máquinas nuevas, y adónde se mudaba la gente para hacerlas funcionar.",
    fullAnswer:
      "La Revolución Industrial (c. 1760–1840) fue el paso de la producción manual a la fabricación con máquinas en fábricas. Empezó en Gran Bretaña gracias a la abundancia de carbón y hierro, al capital del comercio y el imperio, a inventos clave (la máquina de vapor, las máquinas de hilar y tejer) y a una mano de obra que se trasladaba a ciudades industriales en rápido crecimiento.",
    // T3: fail on both passes → queued, then answer revealed → revealed.
    attempt1Result: "fail",
    attempt2Result: "fail",
    attempt1Transcript:
      "Es cuando se inventaron las fábricas y las máquinas y la gente empezó a fabricar mucho más.",
    attempt2Transcript:
      "Se fabricaba mucho más en fábricas con máquinas, y pasó en Gran Bretaña porque se les daba bien el comercio.",
  },
];

// XP awarded per completed term (counts up on screen, collected only at Summary).
export const XP_PER_TERM = 10;

// TWO distinct ~4s waits — never merged:
// Computing latency (STT + judge). Fires after every SEND.
export const PROCESSING_MS = 4000;
// Deliberate retrieval beat: the verdict is already on screen; the hint is
// withheld on purpose before Knowie fills the gap. NOT latency.
export const HINT_DELAY_MS = 4000;
