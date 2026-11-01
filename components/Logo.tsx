export function LogoMark({ size = 26 }: { size?: number }) {
  // A single lime block: the smallest unit of the site's isometric system
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <polygon points="16,3 29,10.5 16,18 3,10.5" fill="#E2F56A" stroke="#1A2329" strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points="3,10.5 16,18 16,30 3,22.5" fill="#D3EC45" stroke="#1A2329" strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points="29,10.5 16,18 16,30 29,22.5" fill="#1A2329" stroke="#1A2329" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className="block text-[1.32rem] font-bold tracking-[-0.045em]">EverydayNaira</span>
        <span className="mt-1 block text-[0.62rem] font-medium tracking-[0.2em] text-ink-2">MONEY, MADE CLEAR</span>
      </span>
    </span>
  );
}
