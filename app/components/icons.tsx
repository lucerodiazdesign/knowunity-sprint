// Inline UI icons (chrome only). Currentcolor-driven so they inherit token text
// colors. Mascot artwork is NEVER an icon — it comes from /public/images.

type IconProps = { size?: number; className?: string; strokeWidth?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  focusable: false,
});

export function CloseIcon({ size = 24, className, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BoltIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M13 2L4.5 13.2c-.4.5 0 1.3.6 1.3H11l-1 7.5c-.1.8.9 1.2 1.4.6L20 11.4c.4-.5 0-1.3-.6-1.3H13l1-7.5c.1-.8-.9-1.2-1.4-.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MicIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="9" y="2.5" width="6" height="11.5" rx="3" fill="currentColor" />
      <path
        d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StopIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="3" fill="currentColor" />
    </svg>
  );
}

export function TrashIcon({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0111 4h2a1.5 1.5 0 011.5 1.5V7M6.5 7l.8 11.2A2 2 0 009.3 20h5.4a2 2 0 002-1.8L17.5 7M10 11v5M14 11v5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M8 5.5v13a1 1 0 001.5.87l10-6.5a1 1 0 000-1.74l-10-6.5A1 1 0 008 5.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TextIcon({ size = 24, className, strokeWidth = 2 }: IconProps) {
  // "Tt" — the Use Text / type-instead affordance.
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M4 6.5V5h9v1.5M8.5 5v11M6.5 16h4M13.5 11.5V10.5h6.5v1M16.75 10.5V16M15.5 16h2.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SendIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M4.5 12h13M12 6.5l5.5 5.5L12 17.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ size = 24, className, strokeWidth = 2.4 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon({ size = 24, className, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Grabber({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: 40,
        height: 5,
        borderRadius: 9999,
        background: "var(--border-default)",
      }}
    />
  );
}
