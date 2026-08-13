"use client";

import { Card, ProgressBar, Typography } from "@heroui/react";

function formatPlan(plan) {
  if (!plan) return "Growth";
  return plan.replace(/^./, (char) => char.toUpperCase());
}

export default function PlanUsageCard({ usage }) {
  const percentage = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Heading className="text-lg font-semibold text-white" level={2}>
            Active job posts
          </Typography.Heading>
          <Typography.Paragraph className="mt-1 text-sm text-muted-foreground">
            {usage.used} of {usage.limit} used · {formatPlan(usage.plan)} plan
          </Typography.Paragraph>
        </div>

        <div className="w-full sm:w-72">
          <ProgressBar.Root
            value={usage.used}
            maxValue={usage.limit}
            aria-label="Active job posts usage"
          >
            <ProgressBar.Output className="text-xs text-muted-foreground" />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar.Root>
        </div>
      </div>
    </Card>
  );
}
