import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import JobsFilterBar from "@/components/public/JobsFilterBar";
import { fetchPublicJobs } from "@/lib/actions/jobs";
import { Briefcase, Calendar, MapPin, Wallet } from "@gravity-ui/icons";
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
  return d.toLocaleDateString(undefined, {
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
          className="rounded-lg border border-default bg-content1 px-4 py-2 text-white transition-colors hover:border-indigo-500/50"
        >
          Previous
        </Link>
      ) : (
        <span className="text-muted-foreground">Previous</span>
      )}
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link
          href={next}
          className="rounded-lg border border-default bg-content1 px-4 py-2 text-white transition-colors hover:border-indigo-500/50"
        >
          Next
        </Link>
      ) : (
        <span className="text-muted-foreground">Next</span>
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
  const items = Array.isArray(result) ? result : result?.items ?? [];
  const totalPages =
    typeof result?.totalPages === "number" ? Math.max(1, result.totalPages) : 1;
  const total = typeof result?.total === "number" ? result.total : items.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Open Roles
        </h1>
        <p className="mt-2 text-muted-foreground">
          {total === 0
            ? "No open roles match your filters."
            : `${total} ${total === 1 ? "role" : "roles"} hiring on HireSphere.`}
        </p>
      </header>

      <div className="mb-6">
        <Suspense fallback={<div className="h-[88px] rounded-2xl border border-default bg-content1" />}>
          <JobsFilterBar />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
          <Briefcase className="size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-white">No matching roles</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try clearing your filters, or check back soon — companies post new
            roles every week.
          </p>
          <Link
            href="/jobs"
            className="mt-2 rounded-lg border border-default bg-content1 px-4 py-2 text-sm text-white transition-colors hover:border-indigo-500/50"
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
              >
                <Card className="flex h-full flex-col gap-3 rounded-2xl border border-default bg-content1 p-5 transition-colors group-hover:border-indigo-500/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-white">
                        {job.title ?? "Untitled role"}
                      </h2>
                      {job.companySlug && (
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {job.companySlug}
                        </p>
                      )}
                    </div>
                    {job.type && (
                      <span className="shrink-0 rounded-full border border-default bg-default px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-default-foreground">
                        {job.type}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {loc && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3" />
                        {loc}
                      </span>
                    )}
                    {salary && (
                      <span className="inline-flex items-center gap-1.5">
                        <Wallet className="size-3" />
                        {salary}
                      </span>
                    )}
                    {job.deadline && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3" />
                        Closes {formatDate(job.deadline)}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
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
