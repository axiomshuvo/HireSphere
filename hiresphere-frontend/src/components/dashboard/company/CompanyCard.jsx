"use client";

import { Briefcase, MapPin, OfficeBadge } from "@gravity-ui/icons";
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
      <Card className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-default bg-content1 p-5 transition-colors group-hover:border-emerald-500/50">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent" />
        <div className="flex items-start gap-3">
          <Avatar.Root className="size-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 text-base font-semibold text-emerald-200 ring-1 ring-emerald-500/20">
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
            <div className="flex items-center gap-2">
              <OfficeBadge className="size-3.5 shrink-0 text-emerald-300" />
              <h2 className="truncate font-semibold text-white">
                {company.name}
              </h2>
            </div>
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

        <div className="mt-auto flex items-center justify-between border-t border-default pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="size-3.5" />
            {activeJobs === 0
              ? "No open roles"
              : `${activeJobs} open ${activeJobs === 1 ? "role" : "roles"}`}
          </span>
          <span className="text-xs font-medium text-emerald-300 transition-colors group-hover:text-emerald-200">
            Manage <span aria-hidden>→</span>
          </span>
        </div>
      </Card>
    </Link>
  );
}
