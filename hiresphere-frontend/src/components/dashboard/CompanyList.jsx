"use client";

import { ArrowRight } from "@gravity-ui/icons";
import { Button, Card, Typography } from "@heroui/react";
import Link from "next/link";
import CompanyListItem from "./CompanyListItem";

export default function CompanyList({
  title,
  companies,
  viewAllLabel = "View all",
  viewAllHref,
  actionLabel = "View All Companies",
  actionHref,
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border border-default bg-content1 p-5">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0"
      />
      <div className="mb-4 flex items-center justify-between">
        <Typography.Heading
          className="text-lg font-semibold text-foreground"
          level={2}
        >
          {title}
        </Typography.Heading>
        {viewAllHref && (
          <Button
            as={Link}
            href={viewAllHref}
            className="text-sm text-emerald-500 hover:text-emerald-600"
            variant="light"
            endContent={<ArrowRight className="size-4" />}
          >
            {viewAllLabel}
          </Button>
        )}
      </div>

      <ul className="space-y-4">
        {companies.map((company) => (
          <CompanyListItem key={company.name} {...company} />
        ))}
      </ul>

      {actionHref && (
        <Button
          as={Link}
          href={actionHref}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500/90 to-teal-500/90 font-semibold text-foreground shadow-lg shadow-emerald-500/20"
          variant="flat"
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
