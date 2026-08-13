"use client";

import { Card, Typography } from "@heroui/react";

export default function CompanyStatCard({ label, value, icon: Icon }) {
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-default text-default-foreground">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <Typography.Heading className="text-xl font-semibold text-white" level={2}>
            {value}
          </Typography.Heading>
          <Typography.Paragraph className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </Typography.Paragraph>
        </div>
      </div>
    </Card>
  );
}
