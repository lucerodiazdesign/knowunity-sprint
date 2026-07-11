// ============================================================
// Single source of ALL user-facing copy + locale config.
//
// TO SWITCH LANGUAGE: change LANG below. That is the ONLY edit needed to
// revert — every string routes through `t`, and the demo content in
// script.ts keys off this same LANG.
//
// FLAGGED (left for you, not translated): `previousMistake` ("Error anterior")
// is kept identical in both languages — decide its English copy and set `en`.
// ============================================================

export type Lang = "en" | "es";

// ▼▼▼ THE LANGUAGE TOGGLE — flip this one line to revert. ▼▼▼
export const LANG: Lang = "en";
// ▲▲▲

// STT / speech-recognition locale. NOTE: the recall STT is MOCKED — no real
// recognizer consumes this — but this is the single config value to flip.
const STT_LOCALE: Record<Lang, string> = { en: "en-US", es: "es-ES" };
export const sttLocale = STT_LOCALE[LANG];

const en = {
  // ---- Exam Plan path ----
  subject: "Science",
  changeSubject: "Change subject",
  more: "More",
  weekLeft: "1 week",
  goal: "Goal: 12.5",
  currentTopic: "The Water Cycle",
  pathKeyConcepts: "Key Concepts",
  pathErrorAnalysis: "Error Analysis",
  pathFinalReview: "Final Review and Connections",
  pathRecall: "Recall Exercise",
  pathMockExam: "Exam Simulation",
  practiceTest: "Practice exam",
  badgeNew: "NEW",
  badgeUpNext: "UP NEXT",
  a11yCompleted: ", completed",
  a11yNew: ", new",
  a11yUpNext: ", up next",
  recallStatus: { not_started: "not started", in_progress: "in progress", done: "completed" } as Record<string, string>,

  // ---- Onboarding ----
  closeIntro: "Close intro",
  step: (n: number) => `Step ${n} of 2`,
  continue: "Continue",
  requesting: "Requesting…",
  slide1Headline: "You've read it. Can you say it?",
  slide1Subtitle: "Explain each idea to Knowie out loud. That's how you find out what you actually know.",
  slide1Alt: "Knowie in a bubble with a microphone",
  slide2Headline: "Give Knowie access to your microphone",
  slide2Subtitle: "Answers matched to your classes",
  slide2Alt: "Knowie priming the microphone permission request",

  // ---- Record screen ----
  knowieAskAlt: "Knowie waiting, ready for you to speak",
  erase: "Erase",
  replay: "Replay",
  useText: "Use text",
  send: "Send",
  notRelevant: "Not relevant",
  previousMistake: "Error anterior", // FLAGGED — previous-mistake tag; your English call
  helperRecording: "Listening… tap to stop",
  helperPlaying: "Playing…",
  helperReview: "Happy with that? Send it",
  helperIdle: "Tap the mic to start",
  startRecording: "Start recording",
  stopRecording: "Stop recording",
  close: "Close",

  // ---- Processing ----
  thinking: "Hmm, give me a second",

  // ---- Verdict ----
  verdictTitle: { pass: "You did it!", partial: "Almost there!", fail: "Not quite", skip: "Skipped!" } as Record<string, string>,
  verdictPrimaryPass: "Continue",
  verdictPrimaryOther: "Got it",
  sectionLockIn: "Let's lock it in",
  sectionWhatsMissing: "What's missing?",
  sectionNeedHint: "Need a hint?",
  chipAnswer: "Answer",
  chipHint: "Hint",
  youCovered: "You covered",
  why: "Why?",
  undoSkip: "Undo skip",

  // ---- Summary ----
  // Per-term row tags, keyed by terminal state.
  summaryLabel: {
    unaided_pass: "On your own",
    passed_with_hints: "With a nudge",
    revealed: "Worth another look",
    skipped: "Skipped", // TODO(Lucero): skipped tag copy + treatment undecided
  } as Record<string, string>,
  summaryTitleFailed: "It's a start", // Figma has the typo "Its a start" — corrected here
  summaryTitlePartial: "Almost there!",
  summaryTitlePassed: "Perfect lesson!",
  summarySubtitleTryAgain: "Every expert was once a beginner. Keep going!",
  summarySubtitlePassed: "You made 0 mistakes. How?!",
  xpBoxLabel: "XP",
  scoreBoxLabel: "SCORE",
  summaryMascotApproving: "Knowie, approving your effort",
  summaryMascotGiggling: "Knowie, giggling — a perfect run",
  xpCollected: (xp: number) => `+${xp} collected`,
  tryTricky: "Try the tricky ones again",

  // ---- Text fallback ----
  typeAnswer: "Type your answer",
  typeAnswerHelp: "Same as saying it — explain the term in your own words.",
  typeAnswerPlaceholder: "In your own words…",
  backToVoice: "Back to voice",

  // ---- AI Chat ----
  chatTitle: "Science 101",
  chatHeading: "What's missing?",
  chatUpgrade: "Upgrade",
  chatBuiltForYou: "Built around you",
  chatInputPlaceholder: "And what about…",

  // ---- Metadata ----
  metaTitle: "Knowunity · Voice Recall",
  metaDescription: "Explain it out loud — Knowie checks your recall.",
};

type Dict = typeof en;

const es: Dict = {
  // ---- Exam Plan path ----
  subject: "Ciencias",
  changeSubject: "Cambiar asignatura",
  more: "Más",
  weekLeft: "1 semana",
  goal: "Meta: 12,5",
  currentTopic: "El ciclo del agua",
  pathKeyConcepts: "Conceptos Clave",
  pathErrorAnalysis: "Análisis de Errores",
  pathFinalReview: "Revisión Final y Conexiones",
  pathRecall: "Recall Exercise", // renamed from "Desafío Final" (no Spanish variant given)
  pathMockExam: "Simulación de Examen",
  practiceTest: "Examen de práctica",
  badgeNew: "NUEVO",
  badgeUpNext: "SIGUIENTE",
  a11yCompleted: ", completado",
  a11yNew: ", nuevo",
  a11yUpNext: ", siguiente",
  recallStatus: { not_started: "sin empezar", in_progress: "en progreso", done: "completado" },

  // ---- Onboarding ----
  closeIntro: "Cerrar introducción",
  step: (n: number) => `Paso ${n} de 2`,
  continue: "Continuar",
  requesting: "Solicitando…",
  // Slide 1 copy was locked to English by you in a prior task — kept as-is.
  slide1Headline: "You've read it. Can you say it?",
  slide1Subtitle: "Explain each idea to Knowie out loud. That's how you find out what you actually know.",
  slide1Alt: "Knowie en una burbuja con un micrófono",
  slide2Headline: "Dale a Knowie acceso a tu micrófono",
  slide2Subtitle: "Respuestas adaptadas a tus clases",
  slide2Alt: "Knowie preparando la solicitud de permiso del micrófono",

  // ---- Record screen ----
  knowieAskAlt: "Knowie esperando, listo para escucharte",
  erase: "Borrar",
  replay: "Reproducir",
  useText: "Usar texto",
  send: "Enviar",
  notRelevant: "No relevante",
  previousMistake: "Error anterior", // FLAGGED
  helperRecording: "Escuchando… toca para parar",
  helperPlaying: "Reproduciendo…",
  helperReview: "¿Te convence? Envíalo",
  helperIdle: "Toca el micro para empezar",
  startRecording: "Empezar a grabar",
  stopRecording: "Detener grabación",
  close: "Cerrar",

  // ---- Processing ----
  thinking: "Mmm, dame un segundo",

  // ---- Verdict ----
  verdictTitle: { pass: "¡Lo lograste!", partial: "¡Casi lo tienes!", fail: "No del todo", skip: "¡Omitido!" },
  verdictPrimaryPass: "Continuar",
  verdictPrimaryOther: "Entendido",
  sectionLockIn: "Vamos a fijarlo",
  sectionWhatsMissing: "¿Qué falta?",
  sectionNeedHint: "¿Necesitas una pista?",
  chipAnswer: "Respuesta",
  chipHint: "Pista",
  youCovered: "Cubriste",
  why: "¿Por qué?",
  undoSkip: "Deshacer omitir",

  // ---- Summary ----
  summaryLabel: {
    unaided_pass: "Por tu cuenta",
    passed_with_hints: "Con un empujón",
    revealed: "Para repasar",
    skipped: "Omitido", // TODO
  },
  summaryTitleFailed: "Es un comienzo",
  summaryTitlePartial: "¡Casi lo tienes!",
  summaryTitlePassed: "¡Lección perfecta!",
  summarySubtitleTryAgain: "Todo experto fue una vez principiante. ¡Sigue así!",
  summarySubtitlePassed: "No cometiste ni un error. ¿Cómo?!",
  xpBoxLabel: "XP",
  scoreBoxLabel: "PUNTAJE",
  summaryMascotApproving: "Knowie, aprobando tu esfuerzo",
  summaryMascotGiggling: "Knowie, riéndose — una ronda perfecta",
  xpCollected: (xp: number) => `+${xp} conseguidos`,
  tryTricky: "Repite los más difíciles",

  // ---- Text fallback ----
  typeAnswer: "Escribe tu respuesta",
  typeAnswerHelp: "Es como decirlo — explica el término con tus propias palabras.",
  typeAnswerPlaceholder: "Con tus propias palabras…",
  backToVoice: "Volver a la voz",

  // ---- AI Chat ----
  chatTitle: "Ciencias 101",
  chatHeading: "¿Qué te falta?",
  chatUpgrade: "Mejorar",
  chatBuiltForYou: "Hecho a tu medida",
  chatInputPlaceholder: "¿Y qué hay de…?",

  // ---- Metadata ----
  metaTitle: "Knowunity · Recall de Voz",
  metaDescription: "Explícalo en voz alta — Knowie comprueba tu recall.",
};

const COPY: Record<Lang, Dict> = { en, es };

export const t: Dict = COPY[LANG];
