"use client";

import { signOut, useSession } from "@/lib/auth-client";
import {
  ArrowRightFromSquare,
  Bars,
  ChevronDown,
  House,
  Moon,
  Sun,
  Xmark,
} from "@gravity-ui/icons";
import { Avatar, Button, Dropdown, Label } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const signedIn = !!session?.user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const navLinks = [
    { label: "Browse Jobs", href: "/jobs" },
    { label: "Company", href: "/company" },
    { label: "Pricing", href: "/pricing" },
  ];

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    closeAll();
  };

  /* ─── Logo ───────────────────────────────────────────────── */
  const logo = (
    <Link
      href="/"
      className="flex items-center gap-2 select-none group"
      aria-label="HireSphere Homepage"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-8 h-8 drop-shadow-md group-hover:scale-105 transition-transform duration-200"
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
      <span className="text-xl font-bold tracking-tight">
        <span className="text-[#0072FF]">Hire</span>
        <span className="text-[#FF6A00]">Sphere</span>
      </span>
    </Link>
  );

  /* ─── Nav links (shared) ─────────────────────────────────── */
  const MotionLink = motion.create(Link);

  const navLinkItems = navLinks.map((item) => (
    <MotionLink
      key={item.label}
      href={item.href}
      onClick={closeAll}
      className="text-sm font-medium opacity-60"
      whileHover={{
        rotateX: 360,
        // opacity: 1,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      {item.label}
    </MotionLink>
  ));
  /* ─── Desktop auth — signed-in dropdown or guest buttons ── */
  const desktopAuth = signedIn ? (
    <Dropdown placement="bottom-end">
      {/* 1. The trigger is just the Button itself now */}
      <Button
        variant="light"
        radius="full"
        className="h-9 pl-1 pr-3 gap-2 min-w-0"
        aria-label="Account menu"
      >
        <Avatar
          size="sm"
          name={session.user.name}
          src={session.user.image || undefined}
          className="w-7 h-7 text-xs shrink-0"
        />
        <span className="hidden sm:block text-sm font-medium max-w-28 truncate">
          {session.user.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
      </Button>

      {/* 2. Menu is nested inside Dropdown.Popover */}
      <Dropdown.Popover>
        <Dropdown.Menu aria-label="Account actions">
          {/* 3. DropdownItem changed to Dropdown.Item with Label for text */}
          <Dropdown.Item id="dashboard" href="/dashboard" textValue="Dashboard">
            <House className="w-4 h-4 shrink-0" />
            <Label>Dashboard</Label>
          </Dropdown.Item>

          {/* 4. color="danger" changed to variant="danger" */}
          <Dropdown.Item
            id="signout"
            variant="danger"
            onPress={handleSignOut}
            textValue="Sign Out"
          >
            <ArrowRightFromSquare className="w-4 h-4 shrink-0 text-danger" />
            <Label>Sign Out</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  ) : (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/signin"
        className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
      >
        Sign In
      </Link>
      <Link href="/auth/signup">
        <Button
          size="sm"
          variant="solid"
          radius="lg"
          className="font-semibold px-4"
        >
          Get Started
        </Button>
      </Link>
    </div>
  );

  /* ─── Mobile auth — expandable profile or guest links ────── */
  // const mobileAuth = signedIn ?
  // (
  //   <div className="flex flex-col">
  //     <button
  //       type="button"
  //       onClick={() => setIsProfileOpen((p) => !p)}
  //       className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-default/40 transition-colors text-left w-full"
  //       aria-expanded={isProfileOpen}
  //       aria-label="Toggle profile actions"
  //     >
  //       <div className="flex items-center gap-3 min-w-0">
  //         <Avatar
  //           size="sm"
  //           name={session.user.name}
  //           src={session.user.image || undefined}
  //           className="shrink-0"
  //         />
  //         <div className="min-w-0">
  //           <p className="text-sm font-semibold truncate">
  //             {session.user.name}
  //           </p>
  //           <p className="text-xs opacity-50 truncate">{session.user.email}</p>
  //         </div>
  //       </div>
  //       <ChevronDown
  //         className={`w-4 h-4 opacity-50 shrink-0 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
  //       />
  //     </button>

  //     {isProfileOpen && (
  //       <div className="flex flex-col gap-0.5 pl-11 pb-1">
  //         <Link
  //           href="/dashboard"
  //           onClick={closeAll}
  //           className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium opacity-70 hover:opacity-100 hover:bg-default/40 transition-all"
  //         >
  //           <House className="w-4 h-4 shrink-0" /> Dashboard
  //         </Link>
  //         <button
  //           type="button"
  //           onClick={handleSignOut}
  //           disabled={isPending}
  //           className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-danger opacity-90 hover:opacity-100 hover:bg-danger/10 transition-all disabled:opacity-40 text-left w-full"
  //         >
  //           <ArrowRightFromSquare className="w-4 h-4 shrink-0" />
  //           {isPending ? "Signing out…" : "Sign Out"}
  //         </button>
  //       </div>
  //     )}
  //   </div>
  // ) : (
  //   <div className="flex flex-col gap-1.5">
  //     <Link
  //       href="/auth/signin"
  //       onClick={closeAll}
  //       className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium opacity-70 hover:opacity-100 hover:bg-default/40 transition-all"
  //     >
  //       <Person className="w-4 h-4 shrink-0" /> Sign In
  //     </Link>
  //     <div className="px-3">
  //       <Link href="/auth/signup" onClick={closeAll}>
  //         <Button
  //           color="primary"
  //           size="sm"
  //           radius="lg"
  //           className="w-full font-semibold"
  //         >
  //           Get Started
  //         </Button>
  //       </Link>
  //     </div>
  //   </div>
  // );

  return (
    <header className="w-full max-w-7xl mx-auto px-4 py-4">
      <nav
        data-theme={isDark ? "dark" : "light"}
        className="relative z-40 border rounded-2xl px-5 h-14 flex items-center justify-between backdrop-blur-md shadow-sm"
        aria-label="Main Navigation"
      >
        {logo}

        {/* Desktop center nav links */}
        <div className="hidden md:flex items-center gap-7">{navLinkItems}</div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <div className=" items-center gap-1">{desktopAuth}</div>

          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            radius="lg"
            onClick={() => setIsDark((p) => !p)}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </Button>

          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            radius="lg"
            className="md:hidden"
            onClick={() => {
              setIsMenuOpen((p) => !p);
              if (isMenuOpen) setIsProfileOpen(false);
            }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <Xmark className="w-5 h-5" />
            ) : (
              <Bars className="w-5 h-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeAll}
            aria-hidden="true"
          />
          <div className="absolute inset-x-4 top-24">
            <div
              data-theme={isDark ? "dark" : "light"}
              className="bg-overlay border rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
              role="dialog"
              aria-label="Mobile navigation"
            >
              <nav className="flex flex-col gap-0.5" aria-label="Site links">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeAll}
                    className="rounded-xl px-3 py-2 text-sm font-medium opacity-70 hover:opacity-100 hover:bg-default/40 transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
