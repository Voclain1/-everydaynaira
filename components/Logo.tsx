/**
 * EverydayNaira logo components.
 *
 * LogoMark  — the ₦ icon in a dark/lime box (standalone, e.g. favicon, app icon)
 * Logo      — full horizontal lockup: mark + EVERYDAYNAIRA + tagline
 * LogoNav   — compact nav version: mark + wordmark only, no tagline
 */

interface MarkProps {
  /** Box size in px (square). Default 40. */
  size?: number;
  /** "light" = dark box (use on light bg), "dark" = lime box (use on dark bg). Default "light". */
  variant?: "light" | "dark";
}

export function LogoMark({ size = 40, variant = "light" }: MarkProps) {
  const box = variant === "dark" ? "#B5D229" : "#1A1A18";
  const stroke = variant === "dark" ? "#14140F" : "#F7F6F2";
  const bar = variant === "dark" ? "#14140F" : "#B5D229";
  const r = Math.round(size * 0.17);

  // Scale geometry from a 52×52 base
  const s = size / 52;
  const sc = (n: number) => n * s;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
    >
      <rect width={size} height={size} rx={r} fill={box} />
      {/* ₦ verticals */}
      <line x1={sc(16)} y1={sc(12)} x2={sc(16)} y2={sc(40)} stroke={stroke} strokeWidth={sc(3.5)} strokeLinecap="round" />
      <line x1={sc(36)} y1={sc(12)} x2={sc(36)} y2={sc(40)} stroke={stroke} strokeWidth={sc(3.5)} strokeLinecap="round" />
      {/* ₦ diagonal */}
      <line x1={sc(14)} y1={sc(14)} x2={sc(38)} y2={sc(38)} stroke={stroke} strokeWidth={sc(2.5)} strokeLinecap="round" />
      {/* Lime / dark crossbars */}
      <line x1={sc(11)} y1={sc(22)} x2={sc(41)} y2={sc(22)} stroke={bar} strokeWidth={sc(2.5)} strokeLinecap="round" />
      <line x1={sc(11)} y1={sc(30)} x2={sc(41)} y2={sc(30)} stroke={bar} strokeWidth={sc(2.5)} strokeLinecap="round" />
    </svg>
  );
}

interface LogoProps {
  variant?: "light" | "dark";
  /** Show tagline below wordmark. Default true. */
  tagline?: boolean;
}

/** Full lockup — mark + EVERYDAYNAIRA + optional tagline */
export function Logo({ variant = "light", tagline = true }: LogoProps) {
  const wordColor = variant === "dark" ? "#F0EFE9" : "#1A1A18";
  const tagColor  = variant === "dark" ? "#9B9A90" : "#6B6B62";

  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark size={40} variant={variant} />
      <span className="leading-none flex flex-col gap-0.5">
        <span
          className="block font-extrabold tracking-[0.04em] uppercase"
          style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            fontSize: "1.25rem",
            color: wordColor,
            letterSpacing: "0.06em",
          }}
        >
          EverydayNaira
        </span>
        {tagline && (
          <span
            className="block"
            style={{
              fontFamily: "'Barlow', Arial, sans-serif",
              fontSize: "0.6rem",
              fontWeight: 400,
              letterSpacing: "0.03em",
              color: tagColor,
            }}
          >
            Your money, explained simply
          </span>
        )}
      </span>
    </span>
  );
}

/** Compact nav lockup — mark + wordmark, no tagline */
export function LogoNav({ variant = "light" }: { variant?: "light" | "dark" }) {
  return <Logo variant={variant} tagline={false} />;
}
