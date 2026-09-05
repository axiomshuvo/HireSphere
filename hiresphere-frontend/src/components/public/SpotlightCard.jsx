import Link from "next/link";

/**
 * Shared listing card — one pattern for /jobs, /company and anywhere else
 * that shows a clickable tile. Dark gradient-friendly border that also
 * survives light mode (token border, not white/8).
 */
export default function SpotlightCard({ href, children, className = "" }) {
  return (
    <Link href={href} className={`group block h-full ${className}`}>
      <div className="relative overflow-hidden flex h-full flex-col rounded-2xl border border-(color-border) bg-(color-surface-2) p-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-indigo-500/30 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] cursor-pointer">
        {/* Shimmer Overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-0">
          <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />
        </div>

        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100 z-10" />

        <div className="relative z-10 flex h-full flex-col">{children}</div>
      </div>
    </Link>
  );
}
