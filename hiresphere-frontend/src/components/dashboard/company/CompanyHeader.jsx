"use client";

import { Briefcase, MapPin, Pencil, TrashBin } from "@gravity-ui/icons";
import { Avatar, Button, Chip } from "@heroui/react";

const planLabels = {
  free: "Free",
  growth: "Growth",
  enterprise: "Enterprise",
};

export default function CompanyHeader({ company, onEdit, onDelete }) {
  const websiteUrl = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-default bg-[radial-gradient(circle_at_78%_18%,rgba(99,102,241,0.30),transparent_45%),radial-gradient(circle_at_18%_82%,rgba(56,189,248,0.22),transparent_50%),linear-gradient(180deg,#16181c,#0f1013)] p-6 lg:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-indigo-500/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar.Root className="size-24 shrink-0 overflow-hidden rounded-2xl border border-default-200 bg-default-100 text-3xl font-bold text-foreground shadow-lg ring-1 ring-white/5">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo}
                alt={company.name}
                className="size-full object-cover"
              />
            ) : (
              <Avatar.Fallback>
                {company.initials ?? company.name?.[0]?.toUpperCase() ?? "?"}
              </Avatar.Fallback>
            )}
          </Avatar.Root>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {company.name}
              </h1>
              {company.plan && (
                <Chip color="primary" size="sm" variant="soft">
                  {planLabels[company.plan] ?? company.plan}
                </Chip>
              )}
              <Chip
                color={company.isApproved ? "success" : "warning"}
                size="sm"
                variant="soft"
              >
                {company.isApproved ? "Approved" : "Pending"}
              </Chip>
              {typeof company.activeJobs === "number" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-default px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-default-foreground">
                  <Briefcase className="size-3" />
                  {company.activeJobs} active{" "}
                  {company.activeJobs === 1 ? "job" : "jobs"}
                </span>
              )}
            </div>

            {company.tagline && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {company.tagline}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {company.industry && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  {company.industry}
                </span>
              )}
              {company.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3" />
                  {company.location}
                </span>
              )}
              {company.foundedYear && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Founded {company.foundedYear}
                </span>
              )}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-500 transition-colors hover:text-indigo-500"
                >
                  {company.website}
                </a>
              )}
              {company.linkedinUrl && (
                <a
                  href={company.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-500 transition-colors hover:text-indigo-500"
                >
                  LinkedIn
                </a>
              )}
              {company.twitterUrl && (
                <a
                  href={company.twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 transition-colors hover:text-sky-300"
                >
                  Twitter
                </a>
              )}
            </div>

            {company.id && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#1b1c1e] px-2 py-1 font-mono text-[10px] text-muted-foreground">
                <span className="text-foreground/40">ID</span>
                <span>{company.id}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onPress={onDelete}>
            <TrashBin className="size-4" />
            Delete
          </Button>
          <Button variant="primary" onPress={onEdit}>
            <Pencil className="size-4" />
            Update
          </Button>
        </div>
      </div>
    </section>
  );
}
