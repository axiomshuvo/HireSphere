"use client";

import { Card, Typography } from "@heroui/react";

function InfoRow({ label, value, href }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/5 py-2.5 last:border-b-0">
      <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="truncate text-right text-sm text-indigo-400 transition-colors hover:text-indigo-300"
        >
          {value}
        </a>
      ) : (
        <span className="truncate text-right text-sm text-white">{value}</span>
      )}
    </div>
  );
}

export default function CompanyQuickInfo({ company }) {
  const websiteUrl = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : null;

  const createdAt = company.createdAt
    ? new Date(company.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <Typography.Paragraph className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Quick Info
      </Typography.Paragraph>

      <div>
        <InfoRow label="Website" value={company.website ?? "—"} href={websiteUrl} />
        <InfoRow label="Headcount" value={company.employeeCount ?? "—"} />
        <InfoRow
          label="Plan"
          value={
            company.plan
              ? company.plan[0].toUpperCase() + company.plan.slice(1)
              : "—"
          }
        />
        <InfoRow
          label="Status"
          value={company.isApproved ? "Approved" : "Pending review"}
        />
        <InfoRow label="Joined" value={createdAt ?? "—"} />
        <InfoRow label="Company ID" value={company.id ?? "—"} />
      </div>
    </Card>
  );
}
