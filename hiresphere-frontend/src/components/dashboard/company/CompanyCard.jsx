"use client";

import { Briefcase, MapPin, OfficeBadge } from "@gravity-ui/icons";
import { getCompanySlug } from "@/lib/api/companies";
import { Avatar, Card, Chip } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";

export default function CompanyCard({ company }) {
  const activeJobs = Number(company.activeJobs ?? 0);

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "?";
  };

  return (
    <Link
      href={`/dashboard/mycompany/${getCompanySlug(company)}`}
      className="group block h-full outline-none"
    >
      <Card className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-default bg-content1 p-5 transition-colors group-hover:border-emerald-500/50">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent" />
        <div className="flex items-start gap-3">
          <Avatar.Root className="size-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 text-base font-semibold text-emerald-200 ring-1 ring-emerald-500/20">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={company.name}
                className="size-full object-cover"
                width={48}
                height={48}
              />
            ) : (
              <Avatar.Fallback>{getInitials(company.name)}</Avatar.Fallback>
            )}
          </Avatar.Root>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <OfficeBadge className="size-3.5 shrink-0 text-emerald-500" />
              <h2 className="truncate font-semibold text-foreground">
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
          <Chip
            color={activeJobs > 0 ? "success" : "default"}
            size="sm"
            variant="soft"
          >
            {activeJobs === 0
              ? "No open roles"
              : `${activeJobs} open ${activeJobs === 1 ? "role" : "roles"}`}
          </Chip>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-default pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="size-3.5" />
            {activeJobs === 0
              ? "No open roles"
              : `${activeJobs} open ${activeJobs === 1 ? "role" : "roles"}`}
          </span>
          <span className="text-xs font-medium text-emerald-500 transition-colors group-hover:text-emerald-600">
            Manage <span aria-hidden>→</span>
          </span>
        </div>
      </Card>
    </Link>
  );
}
