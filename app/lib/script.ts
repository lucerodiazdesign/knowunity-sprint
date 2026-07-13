// ============================================================
// Deterministic mock script — Science set (water cycle + photosynthesis +
// states of matter). THIS IS A MOCK: no STT, no audio, no model, no API. Each
// take's judged result is fixed so behaviour is identical every run.
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

import { LANG } from "./copy";

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

// Seeded demo content is locale-dependent — keyed off LANG (copy.ts). Flip LANG
// there to switch the whole app, this content included.
const TERMS_ES: Term[] = [
  {
    id: "water-cycle",
    subject: "Ciencias",
    title: "El ciclo del agua",
    prompt:
      "Explica el ciclo del agua con tus propias palabras: ¿cómo se mueve el agua entre los océanos, el aire y la tierra?",
    themes: [
      "La evaporación eleva el agua al aire como vapor",
      "La condensación forma las nubes",
      "La precipitación la devuelve como lluvia o nieve",
    ],
    partialCovered: 3,
    hint: "",
    fullAnswer:
      "El ciclo del agua es cómo el agua se mueve continuamente entre los océanos, el aire y la tierra. El sol calienta el agua de la superficie y esta se evapora en vapor; el vapor sube, se enfría y se condensa en nubes; cuando las gotas se vuelven pesadas caen como precipitación (lluvia o nieve); y esa agua se acumula en ríos, lagos y océanos —o se filtra en el suelo— antes de evaporarse de nuevo.",
    // First take nails it → unaided pass.
    attempt1Result: "pass",
    attempt2Result: "pass",
    attempt1Transcript:
      "El agua de los océanos y los lagos se evapora cuando el sol la calienta, así que se convierte en vapor y sube. Arriba se enfría y se condensa en nubes, y cuando las gotas pesan mucho caen como lluvia o nieve. Después corre hacia los ríos y vuelve al mar, y todo se repite.",
    attempt2Transcript: "",
  },
  {
    id: "photosynthesis",
    subject: "Ciencias",
    title: "La fotosíntesis",
    prompt:
      "Explica la fotosíntesis: ¿qué toma la planta, qué produce y qué necesita para hacerlo?",
    themes: [
      "Usa la energía del sol captada por la clorofila",
      "Toma dióxido de carbono y agua",
      "Produce glucosa (alimento) y libera oxígeno",
    ],
    partialCovered: 1,
    hint: "Ya tienes que las plantas usan la luz del sol para hacer alimento. Pero ¿qué TOMAN para fabricar ese alimento y qué liberan como subproducto?",
    fullAnswer:
      "La fotosíntesis es cómo las plantas fabrican su propio alimento. En las hojas, la clorofila capta la energía de la luz del sol. La planta toma dióxido de carbono del aire y agua de sus raíces, y usa la energía de la luz para convertirlos en glucosa (azúcar) como alimento, liberando oxígeno como subproducto.",
    // T2: partial first try → hint → passes on retry → passed_with_hints.
    attempt1Result: "partial",
    attempt2Result: "pass",
    attempt1Transcript:
      "Es cómo las plantas hacen su alimento usando la luz del sol. Usan la energía del sol para crecer.",
    attempt2Transcript:
      "Eh… ¿las plantas usan la luz del sol y algo del aire para hacer alimento?",
  },
  {
    id: "states-of-matter",
    subject: "Ciencias",
    title: "Los estados de la materia",
    prompt:
      "Explica los tres estados principales de la materia: ¿en qué se diferencian los sólidos, los líquidos y los gases, y qué cambia entre ellos?",
    themes: [
      "Los sólidos mantienen una forma fija (partículas juntas que solo vibran)",
      "Los líquidos fluyen y toman la forma de su recipiente",
      "Los gases se expanden para llenar cualquier espacio; el calor cambia el estado",
    ],
    partialCovered: 0,
    hint: "Piensa en las partículas: qué tan juntas están y con qué libertad se mueven en un sólido, un líquido y un gas, y qué hace añadir o quitar calor.",
    fullAnswer:
      "La materia tiene tres estados principales: sólido, líquido y gas. En un sólido, las partículas están muy juntas y solo vibran, así que mantiene una forma y un volumen fijos. En un líquido, las partículas están cerca pero pueden deslizarse unas sobre otras, así que fluye y toma la forma de su recipiente. En un gas, las partículas están muy separadas y se mueven libremente, expandiéndose para llenar cualquier espacio. Añadir calor lleva la materia de sólido → líquido → gas; quitar calor lo invierte.",
    // T3: fail on both passes → queued, then answer revealed → revealed.
    attempt1Result: "fail",
    attempt2Result: "fail",
    attempt1Transcript:
      "Están el sólido, el líquido y el gas. El hielo es sólido, el agua es líquida y el vapor es gas.",
    attempt2Transcript:
      "Los sólidos son duros, los líquidos son mojados y los gases flotan por ahí, creo.",
  },
];

const TERMS_EN: Term[] = [
  {
    id: "water-cycle",
    subject: "Science",
    title: "The water cycle",
    prompt:
      "Explain the water cycle in your own words — how does water move between the oceans, the air, and the land?",
    themes: [
      "Evaporation lifts water into the air as vapor",
      "Condensation forms clouds",
      "Precipitation returns it as rain or snow",
    ],
    partialCovered: 3,
    hint: "",
    fullAnswer:
      "The water cycle is how water moves continuously between the oceans, the air, and the land. The sun heats surface water so it evaporates into vapor; the vapor rises, cools, and condenses into clouds; when the droplets grow heavy they fall as precipitation (rain or snow); and that water collects in rivers, lakes, and oceans — or soaks into the ground — before evaporating again.",
    attempt1Result: "pass",
    attempt2Result: "pass",
    attempt1Transcript:
      "Water from the oceans and lakes evaporates when the sun heats it, so it turns into vapor and rises. Up high it cools and condenses into clouds, and when the drops get heavy they fall back down as rain or snow. Then it runs off into rivers and back to the sea, and the whole thing repeats.",
    attempt2Transcript: "",
  },
  {
    id: "photosynthesis",
    subject: "Science",
    title: "Photosynthesis",
    prompt:
      "Explain photosynthesis — what does a plant take in, what does it make, and what does it need to do it?",
    themes: [
      "Uses sunlight energy captured by chlorophyll",
      "Takes in carbon dioxide and water",
      "Makes glucose (food) and releases oxygen",
    ],
    partialCovered: 1,
    hint: "You've got that plants use sunlight to make food. But what do they take IN to build that food, and what do they give off as a by-product?",
    fullAnswer:
      "Photosynthesis is how plants make their own food. In the leaves, chlorophyll captures energy from sunlight. The plant takes in carbon dioxide from the air and water from its roots, and uses the light energy to turn them into glucose (sugar) for food — releasing oxygen as a by-product.",
    attempt1Result: "partial",
    attempt2Result: "pass",
    attempt1Transcript:
      "It's how plants make their food using sunlight. They use the sun's energy to grow.",
    attempt2Transcript:
      "Um… plants use sunlight and something from the air to make food?",
  },
  {
    id: "states-of-matter",
    subject: "Science",
    title: "States of matter",
    prompt:
      "Explain the three main states of matter — how are solids, liquids, and gases different, and what changes between them?",
    themes: [
      "Solids keep a fixed shape (particles packed, only vibrating)",
      "Liquids flow and take their container's shape",
      "Gases spread to fill any space; heat changes the state",
    ],
    partialCovered: 0,
    hint: "Think about the particles — how tightly packed and how freely they move in a solid vs a liquid vs a gas — and what adding or removing heat does.",
    fullAnswer:
      "Matter has three main states: solid, liquid, and gas. In a solid, particles are packed tightly and only vibrate, so it keeps a fixed shape and volume. In a liquid, particles are close but can slide past each other, so it flows and takes the shape of its container. In a gas, particles are far apart and move freely, spreading to fill any space. Adding heat moves matter from solid → liquid → gas; removing heat reverses it.",
    attempt1Result: "fail",
    attempt2Result: "fail",
    attempt1Transcript:
      "There's solid, liquid, and gas. Ice is solid, water is liquid, and steam is gas.",
    attempt2Transcript:
      "Solids are hard, liquids are wet, and gases float around, I think.",
  },
];

export const TERMS: Term[] = LANG === "en" ? TERMS_EN : TERMS_ES;

// XP awarded per completed term (counts up on screen, collected only at Summary).
export const XP_PER_TERM = 10;

// TWO distinct ~4s waits — never merged:
// Computing latency (STT + judge). Fires after every SEND.
export const PROCESSING_MS = 4000;
// Deliberate retrieval beat: the verdict is already on screen; the hint is
// withheld on purpose before Knowie fills the gap. NOT latency.
export const HINT_DELAY_MS = 4000;
