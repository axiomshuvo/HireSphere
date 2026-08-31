import Link from "next/link";
import { Briefcase, MapPin, Wallet } from "@gravity-ui/icons";
import { Card } from "@heroui/react";

function formatLocation(job) {
  if (job?.remote) return "Remote";
  const parts = [job?.city, job?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function formatSalary(job) {
  if (!job?.salaryMin || !job?.salaryMax) return null;
  return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
}

export default function MarketJobsPanel({ jobs = [] }) {
  if (jobs.length === 0) {
    return (
      <Card className="rounded-2xl border border-default bg-content1 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          What&rsquo;s hiring on HireSphere
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          No public roles to show right now. Check back soon.
        </p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-default bg-content1 p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-amber-500/0 via-amber-500/60 to-amber-500/0"
      />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          What&rsquo;s hiring on HireSphere
        </h2>
        <Link
          href="/jobs"
          className="text-xs font-medium text-indigo-300 transition-colors hover:text-indigo-200"
        >
          Browse all →
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {jobs.map((job) => {
          const id = job.jobId ?? job.slug ?? job._id;
          const location = formatLocation(job);
          const salary = formatSalary(job);
          return (
            <li key={id}>
              <Link
                href={`/jobs/${id}`}
                className="group block rounded-xl border border-default bg-[#1b1c1e] p-3 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white group-hover:text-indigo-300">
                      {job.title ?? "Untitled role"}
                    </p>
                    {job.companySlug && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {job.companySlug}
                      </p>
                    )}
                  </div>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-300 ring-1 ring-indigo-500/30 transition-colors group-hover:text-indigo-200">
                    <Briefcase className="size-3.5" />
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                  {job.type && <span>{job.type}</span>}
                  {location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" />
                      {location}
                    </span>
                  )}
                  {salary && (
                    <span className="inline-flex items-center gap-1">
                      <Wallet className="size-3" />
                      {salary}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
