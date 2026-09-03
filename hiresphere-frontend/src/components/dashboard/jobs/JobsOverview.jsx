"use client";

import { Card } from "@heroui/react";
import {
  Ban,
  Briefcase,
  CircleCheckFill,
  FileText,
  Persons,
} from "@gravity-ui/icons";
import PlanUsageCard from "./PlanUsageCard";
import { getPlanUsage } from "@/lib/api/jobstruture";

function StatTile({ label, value, icon: Icon, color }) {
  const ring = {
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    red: "border-red-500/30 bg-red-500/10 text-red-300",
    indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  }[color];

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${ring}`}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function JobsOverview({ stats, activeJobCount, userPlan }) {
  const active = stats?.active ?? 0;
  const closed = stats?.closed ?? 0;
  const draft = Math.max(
    0,
    (stats?.total ?? 0) - active - closed,
  );
  const totalApplicants = stats?.applicantsTotal ?? 0;
  const usage = getPlanUsage(activeJobCount ?? active, userPlan);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Active"
        value={active}
        icon={CircleCheckFill}
        color="emerald"
      />
      <StatTile label="Drafts" value={draft} icon={FileText} color="amber" />
      <StatTile
        label="Closed"
        value={closed}
        icon={Ban}
        color="red"
      />
      <StatTile
        label="Total applicants"
        value={totalApplicants}
        icon={Persons}
        color="indigo"
      />
      <div className="sm:col-span-2 lg:col-span-4">
        <PlanUsageCard usage={usage} />
      </div>
    </div>
  );
}
