"use client";

import { ArrowRight } from "@gravity-ui/icons";
import { Button, Card, Typography } from "@heroui/react";
import CompanyListItem from "./CompanyListItem";

export default function CompanyList({
  title,
  companies,
  viewAllLabel = "View all",
  actionLabel = "View All Companies",
}) {
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <Typography.Heading className="text-lg font-semibold text-white" level={2}>
          {title}
        </Typography.Heading>
        <Button className="text-sm text-muted-foreground" variant="light">
          {viewAllLabel}
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <ul className="space-y-4">
        {companies.map((company) => (
          <CompanyListItem key={company.name} {...company} />
        ))}
      </ul>

      <Button className="mt-6 w-full rounded-xl bg-default text-white" variant="flat">
        {actionLabel}
      </Button>
    </Card>
  );
}
