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
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RelativeTime({ iso, className = "", showAbsolute = true }) {
  const [diff, setDiff] = useState(() => calcDiff(iso));

  useEffect(() => {
    if (!iso) return undefined;
    const tick = () => setDiff(calcDiff(iso));
    const id = setInterval(tick, TICK_MS);
    tick();
    return () => clearInterval(id);
  }, [iso]);

  if (diff == null) return null;

  return (
    <time
      dateTime={iso}
      title={showAbsolute ? formatAbsolute(iso) : undefined}
      className={className}
    >
      {formatRelative(diff)}
    </time>
  );
}
