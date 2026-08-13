"use client";

import { Card, Typography } from "@heroui/react";

export default function StatCard({ label, value, icon: Icon }) {
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="flex items-start justify-between">
        <div>
          <Typography.Paragraph className="text-sm text-muted-foreground">
            {label}
          </Typography.Paragraph>
          <Typography.Heading
            className="mt-2 text-3xl font-semibold text-white"
            level={2}
          >
            {value}
          </Typography.Heading>
        </div>
        {Icon && (
          <div className="flex size-10 items-center justify-center rounded-xl bg-default text-default-foreground">
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
