"use client";

import { Avatar } from "@heroui/react";
import { useState } from "react";

/**
 * Company logo with graceful fallback — expired/broken logo URLs
 * collapse to the initials avatar instead of a broken-image icon.
 */
export default function CompanyLogo({ logo, name, size = "size-14", text = "text-lg" }) {
  const [failed, setFailed] = useState(false);
  const initials =
    (name ?? "")
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt={`${name ?? "Company"} logo`}
        onError={() => setFailed(true)}
        className={`${size} shrink-0 rounded-xl border border-(color-border) object-cover shadow-sm`}
      />
    );
  }

  return (
    <Avatar.Root
      className={`${size} shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 ${text} font-semibold text-indigo-700 dark:text-indigo-200 ring-1 ring-indigo-500/20`}
    >
      <Avatar.Fallback>{initials}</Avatar.Fallback>
    </Avatar.Root>
  );
}
