export function Arrow({ up = false, className = "" }: { up?: boolean; className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
      {up ? <path d="M4.5 11.5l7-7M5.5 4.5h6v6" /> : <path d="M2.5 8h10M8.5 4l4 4-4 4" />}
    </svg>
  );
}
