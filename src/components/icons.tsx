interface IconProps {
  size?: number;
  className?: string;
}

function baseProps({ size = 16, className }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function FolderIcon({ open = false, ...props }: IconProps & { open?: boolean }) {
  return (
    <svg {...baseProps(props)}>
      {open ? (
        <path d="M3 8h6l2 2h10l-2.4 9H4.6L3 8Z" />
      ) : (
        <path d="M3 6h6l2 2h10v10H3V6Z" />
      )}
    </svg>
  );
}

export function NoteIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </svg>
  );
}

export function DrawingIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 20 9 5l5 9 3-4 3 10H4Z" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function ChevronIcon({ open, ...props }: IconProps & { open: boolean }) {
  return (
    <svg
      {...baseProps(props)}
      style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 120ms" }}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function FolderOpenIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 7h6l2 2h10v10H3V7Z" />
      <path d="M3 11h18" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
    </svg>
  );
}
