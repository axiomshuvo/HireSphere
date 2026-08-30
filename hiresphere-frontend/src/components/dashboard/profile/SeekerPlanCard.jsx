"use client";

import { Card, ProgressBar, Typography } from "@heroui/react";
import ButtonLink from "@/components/shared/ButtonLink";
import { getSeekerPlanUsage } from "@/lib/api/jobstruture";

function formatPlan(plan) {
  if (!plan) return "Free";
  return plan.replace(/^./, (char) => char.toUpperCase());
}

export default function SeekerPlanCard({ plan, activeApplications }) {
  const usage = getSeekerPlanUsage(activeApplications, plan);
  const isUnlimited = usage.isUnlimited;
  const percentage = isUnlimited
    ? 0
    : Math.min(100, (usage.used / usage.limit) * 100);

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Heading
            className="text-lg font-semibold text-white"
            level={2}
          >
            Current plan · {formatPlan(usage.plan)}
          </Typography.Heading>
          <Typography.Paragraph className="mt-1 text-sm text-muted-foreground">
            {isUnlimited
              ? `${usage.used} active applications · unlimited applications`
              : `${usage.used} of ${usage.limit} active applications`}
          </Typography.Paragraph>
        </div>
        <div className="flex items-center gap-2">
          {usage.plan !== "premium" && (
            <ButtonLink
              href="/pricing"
              variant="primary"
              size="sm"
              className="cursor-pointer"
            >
              Upgrade to Premium
            </ButtonLink>
          )}
          <ButtonLink
            href="/pricing"
            variant="secondary"
            size="sm"
            className="cursor-pointer"
          >
            View all plans
          </ButtonLink>
        </div>
      </div>
      {!isUnlimited && (
        <div className="mt-4">
          <ProgressBar.Root
            value={usage.used}
            maxValue={usage.limit}
            aria-label="Active applications usage"
          >
            <ProgressBar.Output className="text-xs text-muted-foreground" />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar.Root>
        </div>
      )}
    </Card>
  );
}
