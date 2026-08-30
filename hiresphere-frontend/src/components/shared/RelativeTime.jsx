"use client";

import { useEffect, useState } from "react";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const TICK_MS = MINUTE;

function calcDiff(iso) {
  if (!iso) return null;
  const past = new Date(iso);
  if (Number.isNaN(past.getTime())) return null;
  return Date.now() - past.getTime();
}

function formatRelative(ms) {
  if (ms < MINUTE) return "just now";
  if (ms < HOUR) {
    const m = Math.floor(ms / MINUTE);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (ms < DAY) {
    const h = Math.floor(ms / HOUR);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (ms < WEEK) {
    const d = Math.floor(ms / DAY);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }
  const w = Math.floor(ms / WEEK);
  return `${w} week${w === 1 ? "" : "s"} ago`;
}

function formatAbsolute(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RelativeTime({ iso, className = "", showAbsolute = true }) {
  // Render a stable placeholder during SSR to avoid hydration mismatches.
  // Real relative time appears after mount and updates every minute.
  const [hydrated, setHydrated] = useState(false);
  const [diff, setDiff] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    if (!iso) return undefined;
    const tick = () => setDiff(calcDiff(iso));
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [iso]);

  if (diff == null) return null;
  // The <time> element + dateTime/title are SSR-stable; only the inner
  // text is gated on `hydrated` so client and server agree before mount.
  return (
    <time
      dateTime={iso}
      title={showAbsolute ? formatAbsolute(iso) : undefined}
      className={className}
      suppressHydrationWarning
    >
      {hydrated ? formatRelative(diff) : ""}
    </time>
  );
}
