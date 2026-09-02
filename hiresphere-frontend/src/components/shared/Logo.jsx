import Link from "next/link";

export default function Logo({
  className = "",
  iconSize = "w-8 h-8",
  textSize = "text-xl",
  href = "/",
  onClick,
}) {
  const content = (
    <div
      className={`flex items-center gap-2 select-none group ${className}`}
      aria-label="HireSphere Homepage"
    >
      <svg
        viewBox="0 0 100 100"
        className={`${iconSize} drop-shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sphereGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C6FF" />
            <stop offset="50%" stopColor="#0072FF" />
            <stop offset="100%" stopColor="#FF6A00" />
          </linearGradient>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6A00" />
            <stop offset="100%" stopColor="#00C6FF" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="32" fill="url(#sphereGrad)" />
        <ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="18"
          stroke="url(#orbitGrad)"
          strokeWidth="7"
          transform="rotate(-25 50 50)"
          strokeDasharray="200"
          strokeDashoffset="20"
        />
        <path
          d="M 30,35 A 25,25 0 0,1 65,25"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
      <span className={`${textSize} font-bold tracking-tight`}>
        <span className="text-[#0072FF]">Hire</span>
        <span className="text-[#FF6A00]">Sphere</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return content;
}
