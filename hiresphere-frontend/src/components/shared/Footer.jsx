"use client";

import Link from "next/link";

export default function Footer() {
  const productLinks = [
    { label: "Job discovery", href: "/job-discovery" },
    { label: "Worker AI", href: "/worker-ai" },
    { label: "Companies", href: "/company" },
    { label: "Salary data", href: "/salary-data" },
  ];

  const navigationLinks = [
    { label: "Help center", href: "/help" },
    { label: "Career library", href: "/career-library" },
    { label: "Contact", href: "/contact" },
  ];

  const resourceLinks = [
    { label: "Brand Guideline", href: "/brand" },
    { label: "Newsroom", href: "/newsroom" },
  ];

  return (
    <footer className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="bg-default-100 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column: Logo & Tagline */}
          <div className="md:col-span-5 flex flex-col justify-between gap-8">
            <div className="space-y-4 max-w-sm">
              {/* Brand Logo */}
              <Link
                href="/"
                className="flex items-center gap-2 select-none group w-fit"
                aria-label="HireSphere Homepage"
              >
                {/* Custom Glowing Sphere Icon */}
                <div className="relative flex items-center justify-center w-8 h-8">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full drop-shadow-md group-hover:scale-105 transition-transform duration-200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="HireSphere Logo Icon"
                  >
                    <defs>
                      <linearGradient
                        id="footerSphereGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#00C6FF" />
                        <stop offset="50%" stopColor="#0072FF" />
                        <stop offset="100%" stopColor="#FF6A00" />
                      </linearGradient>
                      <linearGradient
                        id="footerOrbitGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#FF6A00" />
                        <stop offset="100%" stopColor="#00C6FF" />
                      </linearGradient>
                    </defs>

                    <circle
                      cx="50"
                      cy="50"
                      r="32"
                      fill="url(#footerSphereGrad)"
                    />
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="45"
                      ry="18"
                      stroke="url(#footerOrbitGrad)"
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
                </div>

                {/* Logo Typography */}
                <div className="flex items-center text-2xl font-bold tracking-tight">
                  <span className="text-[#009bf2]">Hire</span>
                  <span className="text-[#ff6a00]">Sphere</span>
                </div>
              </Link>

              {/* Tagline */}
              <p className="text-default-500 text-sm md:text-base leading-relaxed">
                The AI-native career platform. Built for people who take their
                work seriously.
              </p>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-default-500 hover:text-(color-accent) transition-all duration-200"
                aria-label="HireSphere Facebook Page"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] flex items-center justify-center text-foreground transition-all duration-200 shadow-md shadow-indigo-500/20"
                aria-label="HireSphere Pinterest Profile"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026l.032-.026z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-default-500 hover:text-(color-accent) transition-all duration-200"
                aria-label="HireSphere LinkedIn Page"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Columns: Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Product Column */}
            <div>
              <h3 className="text-[#818cf8] font-medium text-base mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-default-500 hover:text-(color-accent) text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigations Column */}
            <div>
              <h3 className="text-[#818cf8] font-medium text-base mb-4">
                Navigations
              </h3>
              <ul className="space-y-3">
                {navigationLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-default-500 hover:text-(color-accent) text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-[#818cf8] font-medium text-base mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-default-500 hover:text-(color-accent) text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-default-500">
          <p>© {new Date().getFullYear()} — HireSphere. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms & Policy
            </Link>
            <span>-</span>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Guideline
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
