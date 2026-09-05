"use client";

import { MapPin } from "@gravity-ui/icons";
import { Avatar, Typography } from "@heroui/react";
import Link from "next/link";

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
  id,
  name,
  field,
  location,
  activeJobs,
  initials,
}) {
  const gradient = pickGradient(name);
  const content = (
    <li className="group relative overflow-hidden flex items-center gap-3 rounded-xl border border-default p-3 transition-colors hover:border-indigo-500/50 hover:bg-white/[0.02] cursor-pointer">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-0">
        <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />
      </div>

      <Avatar.Root
        className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-sm font-semibold text-foreground shadow-md shadow-black/30`}
      >
        <Avatar.Fallback>{initials}</Avatar.Fallback>
      </Avatar.Root>
      <div className="relative z-10 min-w-0 flex-1">
        <Typography.Paragraph className="truncate font-medium text-foreground group-hover:text-indigo-500 transition-colors">
          {name}
        </Typography.Paragraph>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{field}</span>
          <span>•</span>
          <MapPin className="size-3" />
          <span>{location}</span>
        </div>
      </div>
      <div className="relative z-10 text-right">
        <Typography.Paragraph className="text-sm font-semibold tabular-nums text-foreground group-hover:text-indigo-400 transition-colors">
          {activeJobs}
        </Typography.Paragraph>
        <Typography.Paragraph className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Active Jobs
        </Typography.Paragraph>
      </div>
    </li>
  );

  if (id) {
    return (
      <Link href={`/dashboard/mycompany/${id}`} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
