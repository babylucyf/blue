export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-[-0.02em] ${className}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="7" fill="currentColor" className="text-blue" />
        <path d="M6 9h7M4 13h9M7 17h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 7l4 5-4 5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Blue</span>
    </span>
  );
}
