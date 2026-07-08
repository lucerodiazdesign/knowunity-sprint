// Motion presets — the single source of transition feel across the prototype.
// See motion-guide.md. Reuse these; never hand-roll easing per component.

export const gentle = { type: "spring", stiffness: 260, damping: 30 } as const; // most UI
export const snappy = { type: "spring", stiffness: 400, damping: 28 } as const; // taps, toggles
export const sheet = { type: "spring", stiffness: 300, damping: 34 } as const; // bottom sheets
export const soft = { duration: 0.22, ease: [0.22, 1, 0.36, 1] } as const; // fades, simple moves

// Reply / hint entrance: fade + small rise.
export const rise = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
} as const;
