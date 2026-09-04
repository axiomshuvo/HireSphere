"use client";

import PlanUpgradeModal from "@/components/shared/PlanUpgradeModal";
import { Rocket } from "@gravity-ui/icons";
import { Button, Card, ProgressBar, Typography } from "@heroui/react";
import { useState } from "react";

function formatPlan(plan) {
  if (!plan) return "Growth";
  return plan.replace(/^./, (char) => char.toUpperCase());
}

export default function PlanUsageCard({ usage }) {
  const percentage = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Heading
            className="text-lg font-semibold text-foreground"
            level={2}
          >
            Active job posts
          </Typography.Heading>
          <Typography.Paragraph className="mt-1 text-sm text-muted-foreground">
            {usage.used} of {usage.limit} used · {formatPlan(usage.plan)} plan
          </Typography.Paragraph>
        </div>

        <div className="flex flex-col items-end gap-2">
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
          {usage.plan !== "enterprise" && (
            <Button
              variant="primary"
              size="sm"
              className="mt-2 cursor-pointer"
              onPress={() => setIsPlanModalOpen(true)}
            >
              Upgrade Plan
              <Rocket className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <PlanUpgradeModal
        isOpen={isPlanModalOpen}
        onOpenChange={setIsPlanModalOpen}
        role="recruiter"
        currentPlan={usage.plan}
      />
    </Card>
  );
}
