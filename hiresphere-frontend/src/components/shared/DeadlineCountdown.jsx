"use client";

import { Clock, ExclamationShapeFill } from "@gravity-ui/icons";
import { useEffect, useState } from "react";

function calcRemaining(deadline) {
  if (!deadline) return null;
  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return { expired: true, totalMs: 0 };
  return { expired: false, totalMs: diffMs };
}

function formatRemaining(remaining) {
  if (!remaining) return null;
  if (remaining.expired) {
    return {
      label: "Deadline passed",
      tone: "border-red-500/30 bg-red-500/10 text-red-300",
      icon: ExclamationShapeFill,
    };
  }
  const days = Math.floor(remaining.totalMs / (1000 * 60 * 60 * 24));
  const urgent = days < 3;
  return {
    label: `Closes in ${format(remaining.totalMs)}`,
    tone: urgent
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-white/10 bg-white/[0.04] text-muted-foreground",
    icon: Clock,
  };
}

function format(ms) {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  if (days >= 1) return `${days}d ${hours}h`;
  if (hours >= 1) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const TICK_MS = 60_000;

export default function DeadlineCountdown({ deadline, className = "" }) {
  // Render a stable placeholder during SSR to avoid hydration mismatches
  // (server `Date.now()` and client `Date.now()` differ). Real value
  // appears after mount and updates every minute.
  const [hydrated, setHydrated] = useState(false);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    if (!deadline) return undefined;
    const tick = () => setRemaining(calcRemaining(deadline));
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;
  if (!hydrated || !remaining) return null;

  const meta = formatRemaining(remaining);
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${meta.tone} ${className}`}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  );
}
