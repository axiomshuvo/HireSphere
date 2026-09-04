"use client";

import {
  Bookmark,
  FileText,
  Magnifier,
  Persons,
  FaceSmile,
  Thunderbolt,
} from "@gravity-ui/icons";
import { Card, Typography } from "@heroui/react";

const TONES = {
  indigo: {
    chip: "from-indigo-500/20 to-indigo-500/5 text-indigo-500 ring-indigo-500/30",
    accent: "from-indigo-500 to-blue-500",
    halo: "bg-indigo-500/10",
  },
  emerald: {
    chip: "from-emerald-500/20 to-emerald-500/5 text-emerald-500 ring-emerald-500/30",
    accent: "from-emerald-500 to-teal-500",
    halo: "bg-emerald-500/10",
  },
  amber: {
    chip: "from-amber-500/20 to-amber-500/5 text-amber-500 ring-amber-500/30",
    accent: "from-amber-500 to-orange-500",
    halo: "bg-amber-500/10",
  },
  rose: {
    chip: "from-rose-500/20 to-rose-500/5 text-rose-500 ring-rose-500/30",
    accent: "from-rose-500 to-pink-500",
    halo: "bg-rose-500/10",
  },
};

const ICONS = {
  file: FileText,
  persons: Persons,
  lightning: Thunderbolt,
  smile: FaceSmile,
  bookmark: Bookmark,
  magnifier: Magnifier,
};

export default function StatCard({
  label,
  value,
  icon = "file",
  hint,
  trend,
  tone = "indigo",
}) {
  const palette = TONES[tone] ?? TONES.indigo;
  const Icon = typeof icon === "string" ? ICONS[icon] ?? ICONS.file : null;
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-default bg-content1 p-5 transition-all hover:border-white/15">
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-8 -top-8 size-32 rounded-full blur-2xl transition-opacity group-hover:opacity-90 ${palette.halo}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${palette.accent}`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Typography.Paragraph className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </Typography.Paragraph>
          <Typography.Heading
            className="mt-2 text-3xl font-semibold tabular-nums text-(color-foreground)"
            level={2}
          >
            {value}
          </Typography.Heading>
          {(hint || trend) && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              {trend}
              {hint && <span>{hint}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${palette.chip} ring-1 backdrop-blur-sm`}
          >
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </Card>
  );
}