"use client";

import { MapPin } from "@gravity-ui/icons";
import { Avatar, Typography } from "@heroui/react";

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-sky-500",
];

function pickGradient(seed) {
  if (!seed) return AVATAR_GRADIENTS[0];
  let total = 0;
  for (let i = 0; i < seed.length; i += 1) {
    total = (total + seed.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  }
  return AVATAR_GRADIENTS[total];
}

export default function CompanyListItem({
  name,
  field,
  location,
  activeJobs,
  initials,
}) {
  const gradient = pickGradient(name);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-default p-3 transition-colors hover:border-white/15 hover:bg-white/[0.02]">
      <Avatar.Root
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-sm font-semibold text-white shadow-md shadow-black/30`}
      >
        <Avatar.Fallback>{initials}</Avatar.Fallback>
      </Avatar.Root>
      <div className="min-w-0 flex-1">
        <Typography.Paragraph className="truncate font-medium text-white">
          {name}
        </Typography.Paragraph>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{field}</span>
          <span>•</span>
          <MapPin className="size-3" />
          <span>{location}</span>
        </div>
      </div>
      <div className="text-right">
        <Typography.Paragraph className="text-sm font-semibold tabular-nums text-white">
          {activeJobs}
        </Typography.Paragraph>
        <Typography.Paragraph className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Active Jobs
        </Typography.Paragraph>
      </div>
    </li>
  );
}
