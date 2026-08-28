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
  const [remaining, setRemaining] = useState(() => calcRemaining(deadline));

  useEffect(() => {
    if (!deadline) return undefined;
    const tick = () => setRemaining(calcRemaining(deadline));
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;
  if (!remaining) return null;

  if (remaining.expired) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-300 ${className}`}
      >
        <ExclamationShapeFill className="size-3" />
        Deadline passed
      </span>
    );
  }

  const days = Math.floor(remaining.totalMs / (1000 * 60 * 60 * 24));
  const urgent = days < 3;
  const tone = urgent
    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
    : "border-white/10 bg-white/[0.04] text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${tone} ${className}`}
    >
      <Clock className="size-3" />
      Closes in {format(remaining.totalMs)}
    </span>
  );
}
