"use client";

import { Briefcase, MapPin } from "@gravity-ui/icons";
import { Avatar, Card, Chip } from "@heroui/react";
import Link from "next/link";

const planLabels = {
  free: "Free",
  growth: "Growth",
  enterprise: "Enterprise",
};

export default function CompanyCard({ company }) {
  const activeJobs = Number(company.activeJobs ?? 0);

  return (
    <Link
      href={`/dashboard/mycompany/${company.companySlug}`}
      className="group block"
    >
      <Card className="flex h-full flex-col gap-3 rounded-2xl border border-default bg-content1 p-5 transition-colors group-hover:border-indigo-500/50">
        <div className="flex items-start gap-3">
          <Avatar.Root className="size-12 shrink-0 overflow-hidden rounded-xl bg-default text-base font-semibold text-default-foreground">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="size-full object-cover"
              />
            ) : (
              <Avatar.Fallback>{company.initials}</Avatar.Fallback>
            )}
          </Avatar.Root>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-white">
              {company.name}
            </h2>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span>{company.industry}</span>
              <span>•</span>
              <MapPin className="size-3" />
              <span className="truncate">{company.location}</span>
            </div>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {company.tagline}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Chip color="primary" size="sm" variant="soft">
            {planLabels[company.plan] ?? company.plan}
          </Chip>
          <Chip
            color={company.isApproved ? "success" : "warning"}
            size="sm"
            variant="soft"
          >
            {company.isApproved ? "Approved" : "Pending"}
          </Chip>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-default pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="size-3.5" />
            {activeJobs === 0
              ? "No open roles"
              : `${activeJobs} open ${activeJobs === 1 ? "role" : "roles"}`}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {company.companySlug}
          </span>
        </div>
      </Card>
    </Link>
  );
}
