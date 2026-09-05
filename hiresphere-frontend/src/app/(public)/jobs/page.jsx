import {
  JobCategoryBadge,
  JobRemoteBadge,
  JobTypeBadge,
} from "@/components/jobs/JobBadge";
import JobsFilterBar from "@/components/public/JobsFilterBar";
import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import JobCardSkeleton from "@/components/shared/JobCardSkeleton";
import { fetchPublicJobs } from "@/lib/actions/jobs";
import { Briefcase, MapPin, Wallet } from "@gravity-ui/icons";
import { Card } from "@heroui/react";
import Link from "next/link";
import { Suspense } from "react";

const PAGE_SIZE = 12;

export const dynamic = "force-dynamic";

function formatSalary(job) {
  if (!job.salaryMin || !job.salaryMax) return null;
  return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
}

function formatLocation(job) {
  if (job.remote) return "Remote";
  const parts = [job.city, job.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function formatDate(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return null;
  // Pin the locale so server and client always render the same string
  // (avoids hydration mismatches when the OS locales differ).
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PageStrip({ page, totalPages, searchParams }) {
  if (totalPages <= 1) return null;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === "page") continue;
    if (value) params.set(key, String(value));
  }
  const buildHref = (target) => {
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };
  const prev = page > 1 ? buildHref(page - 1) : null;
  const next = page < totalPages ? buildHref(page + 1) : null;
  return (
    <nav className="mt-10 flex items-center justify-center gap-3 text-sm">
      {prev ? (
        <Link
          href={prev}
          className="rounded-lg border border-(color-border) bg-(color-surface) px-4 py-2 text-(color-text) transition-colors hover:border-indigo-500/50"
        >
          Previous
        </Link>
      ) : (
        <span className="text-(color-text-muted)">Previous</span>
      )}
      <span className="text-(color-text-muted)">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link
          href={next}
          className="rounded-lg border border-(color-border) bg-(color-surface) px-4 py-2 text-(color-text) transition-colors hover:border-indigo-500/50"
        >
          Next
        </Link>
      ) : (
        <span className="text-(color-text-muted)">Next</span>
      )}
    </nav>
  );
}

export default async function PublicJobsPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);
  const search = typeof params?.search === "string" ? params.search : "";
  const category = typeof params?.category === "string" ? params.category : "";
  const type = typeof params?.type === "string" ? params.type : "";
  const remote = params?.remote === "true";
  const location = typeof params?.location === "string" ? params.location : "";

  const result = await fetchPublicJobs({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    category: category || undefined,
    type: type || undefined,
    remote: remote || undefined,
    location: location || undefined,
  });
  const items = Array.isArray(result) ? result : (result?.items ?? []);
  const totalPages =
    typeof result?.totalPages === "number" ? Math.max(1, result.totalPages) : 1;
  const total = typeof result?.total === "number" ? result.total : items.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-(color-text) sm:text-4xl">
          Open Roles
        </h1>
        <p className="mt-2 text-(color-text-muted)">
          {total === 0
            ? "No open roles match your filters."
            : `${total} ${total === 1 ? "role" : "roles"} hiring on HireSphere.`}
        </p>
      </header>

      <div className="mb-6">
        <Suspense fallback={<JobCardSkeleton />}>
          <JobsFilterBar />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(color-border) bg-(color-surface) px-6 py-16 text-center">
          <Briefcase className="size-8 text-(color-text-muted)" />
          <h2 className="text-lg font-semibold text-(color-text)">
            No matching roles
          </h2>
          <p className="max-w-sm text-sm text-(color-text-muted)">
            Try clearing your filters, or check back soon — companies post new
            roles every week.
          </p>
          <Link
            href="/jobs"
            className="mt-2 rounded-lg border border-(color-border) bg-(color-surface) px-4 py-2 text-sm text-(color-text) transition-colors hover:border-indigo-500/50"
          >
            Reset filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((job) => {
            const salary = formatSalary(job);
            const loc = formatLocation(job);
            const jobId = job._id ?? job.id;
            return (
              <Link
                key={jobId}
                href={`/jobs/${jobId}`}
                className="group block"
                data-job-card={jobId}
              >
                <Card className="relative overflow-hidden flex h-full flex-col gap-3 rounded-2xl border border-(color-border) bg-(color-surface) p-5 transition-colors group-hover:border-indigo-500/50 cursor-pointer">
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-0">
                    <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />
                  </div>

                  <div
                    className="relative z-10 flex flex-wrap items-center gap-1.5"
                    data-job-card-badges
                  >
                    <JobTypeBadge type={job.type} />
                    <JobRemoteBadge remote={job.remote} />
                    <JobCategoryBadge category={job.category} />
                  </div>
                  <div className="min-w-0" data-job-card-header>
                    <h2 className="truncate text-lg font-semibold text-(color-text)">
                      {job.title ?? "Untitled role"}
                    </h2>
                    {job.companySlug && (
                      <p className="mt-1 truncate text-sm text-(color-text-muted)">
                        {job.companySlug}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(color-text-muted)"
                    data-job-card-meta
                  >
                    {loc && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3 text-emerald-400" />
                        {loc}
                      </span>
                    )}
                    {salary && (
                      <span className="inline-flex items-center gap-1.5">
                        <Wallet className="size-3 text-indigo-500" />
                        {salary}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto" data-job-card-deadline>
                    <DeadlineCountdown deadline={job.deadline} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <PageStrip page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
