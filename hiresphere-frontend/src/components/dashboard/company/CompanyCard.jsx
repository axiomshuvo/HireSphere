"use client";

import { MapPin } from "@gravity-ui/icons";
import { Avatar, Card, Chip } from "@heroui/react";
import Link from "next/link";

const planLabels = {
  free: "Free",
  growth: "Growth",
  enterprise: "Enterprise",
};

export default function CompanyCard({ company }) {
  return (
    <Link href={`/dashboard/mycompany/${company.id}`} className="group">
      <Card className="h-full rounded-2xl border border-default bg-content1 p-5 transition-colors group-hover:border-indigo-500/50">
        <div className="flex items-start gap-3">
          <Avatar.Root className="size-12 shrink-0 rounded-xl bg-default text-base font-semibold text-default-foreground">
            <Avatar.Fallback>{company.initials}</Avatar.Fallback>
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

        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {company.tagline}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
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
          <span className="ml-auto rounded-md border border-white/10 bg-[#1b1c1e] px-2 py-1 font-mono text-[10px] text-muted-foreground">
            {company.id}
          </span>
        </div>
      </Card>
    </Link>
  );
}
