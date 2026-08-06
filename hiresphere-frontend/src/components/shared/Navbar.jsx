"use client";

import { Bars, Moon, Sun, Xmark } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Sync Dark/Light mode with HeroUI v3 engine via data-theme attribute
  useEffect(() => {
    const themeMode = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeMode);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const navItems = [
    { label: "Browse Jobs", href: "#" },
    { label: "Company", href: "#" },
    { label: "Pricing", href: "#" },
  ];

  return (
    <header className="w-full max-w-7xl mx-auto px-4 py-4">
      <nav
        data-theme={isDark ? "dark" : "light"}
        className="relative border rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between shadow-lg transition-all duration-300 backdrop-blur-md"
        aria-label="Main Navigation"
      >
        {/* Left: HireSphere Brand Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 select-none group"
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
                    id="sphereGrad"
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
                    id="orbitGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#FF6A00" />
                    <stop offset="100%" stopColor="#00C6FF" />
                  </linearGradient>
                </defs>

                {/* Central Sphere */}
                <circle cx="50" cy="50" r="32" fill="url(#sphereGrad)" />

                {/* Outer Orbital Ring */}
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

                {/* Sphere Surface Highlight Arc */}
                <path
                  d="M 30,35 A 25,25 0 0,1 65,25"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </div>

            {/* Logo Typography: HireSphere */}
            <div className="flex items-center text-2xl font-bold tracking-tight">
              <span className="text-[#0072FF]">Hire</span>
              <span className="text-[#FF6A00]">Sphere</span>
            </div>
          </Link>
        </div>

        {/* Right Section: Navigation Links + HeroUI Theme Button */}
        <div className="flex items-center gap-3 md:gap-8">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="opacity-80 hover:opacity-100 text-base font-medium transition-opacity duration-200"
              >
                {item.label}
              </Link>
            ))}

            {/* Vertical Divider */}
            <div
              className="h-5 w-[1px] opacity-20 bg-current my-auto"
              aria-hidden="true"
            />

            {/* Sign In Link */}
            <Link
              href="/signin"
              className="text-indigo-500 hover:text-indigo-400 text-base font-medium transition-colors duration-200"
            >
              Sign In
            </Link>

            {/* HeroUI Primary Button */}
            <Button
              as={Link}
              href="/signup"
              color="primary"
              variant="solid"
              radius="lg"
              className="font-medium text-base px-6 shadow-lg shadow-indigo-500/20"
            >
              Get Started
            </Button>
          </div>

          {/* HeroUI Icon Toggle Button for Light / Dark Mode */}
          <Button
            isIconOnly
            variant="flat"
            radius="lg"
            onClick={() => setIsDark(!isDark)}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" aria-hidden="true" />
            )}
          </Button>

          {/* HeroUI Mobile Menu Toggle Button */}
          <Button
            isIconOnly
            variant="light"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <Xmark className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Bars className="w-6 h-6" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div
            data-theme={isDark ? "dark" : "light"}
            className="absolute top-20 left-0 w-full border rounded-2xl p-6 flex flex-col gap-4 shadow-2xl z-50 md:hidden backdrop-blur-xl"
            role="menu"
            aria-label="Mobile Navigation Menu"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg py-1 font-medium opacity-80 hover:opacity-100"
                role="menuitem"
              >
                {item.label}
              </Link>
            ))}
            <div
              className="h-[1px] opacity-20 bg-current my-1"
              aria-hidden="true"
            />
            <Link
              href="/signin"
              onClick={() => setIsMenuOpen(false)}
              className="text-indigo-500 text-lg font-medium py-1"
              role="menuitem"
            >
              Sign In
            </Link>
            <Button
              as={Link}
              href="/signup"
              color="primary"
              radius="lg"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-base font-medium py-3 mt-2"
            >
              Get Started
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
