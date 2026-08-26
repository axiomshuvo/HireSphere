"use client";

import { Card, Typography } from "@heroui/react";

function CompanyStatCard({ label, value, icon: Icon }) {
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-default bg-[#1b1c1e] text-muted-foreground">
            <Icon className="size-4" />
          </div>
        )}
        <div className="min-w-0">
          <Typography.Paragraph className="truncate text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </Typography.Paragraph>
          <Typography.Paragraph className="truncate text-sm font-semibold text-white">
            {value ?? "—"}
          </Typography.Paragraph>
        </div>
      </div>
    </Card>
  );
}

export default function CompanyStats({ company }) {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <CompanyStatCard
        label="Industry"
        value={company.industry}
        icon={null}
      />
      <CompanyStatCard
        label="Location"
        value={company.location}
        icon={null}
      />
      <CompanyStatCard
        label="Employees"
        value={company.employeeCount}
        icon={null}
      />
      <CompanyStatCard
        label="Plan"
        value={company.plan ? company.plan[0].toUpperCase() + company.plan.slice(1) : null}
        icon={null}
      />
    </section>
  );
}
