import { fetchMyApplications } from "@/lib/actions/applications";
import LocalStateBridge from "@/components/dashboard/LocalStateBridge";
import OptimisticApplications from "@/components/dashboard/OptimisticApplications";
import WithdrawApplicationButton from "@/components/dashboard/WithdrawApplicationButton";
import { fetchPublicJobById } from "@/lib/actions/jobs";
import {
  Briefcase,
  Calendar,
  CircleCheck,
  Clock,
  Envelope,
  FileText,
  MapPin,
  Smartphone,
  Wallet,
} from "@gravity-ui/icons";
import { Card, Chip, Typography } from "@heroui/react";
import Link from "next/link";

const PAGE_SIZE = 12;

function formatLocation(job) {
  if (job?.remote) return "Remote";
  const parts = [job?.city, job?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function formatSalary(job) {
  if (!job?.salaryMin || !job?.salaryMax) return null;
  return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
}

function formatAppliedDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusColors = {
  submitted: "primary",
  reviewed: "warning",
  interviewing: "success",
  offered: "success",
  rejected: "danger",
  withdrawn: "default",
};

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);

  const result = await fetchMyApplications({ page, pageSize: PAGE_SIZE });
  const items = Array.isArray(result) ? result : result?.items ?? [];
  const totalPages =
    typeof result?.totalPages === "number" ? Math.max(1, result.totalPages) : 1;
  const total = typeof result?.total === "number" ? result.total : items.length;

  // Enrich each application with the live job so the cards show current
  // status + deadline. If the job is gone, fall back to the snapshot
  // stored on the application.
  const enriched = await Promise.all(
    items.map(async (application) => {
      let job = null;
      try {
        job = await fetchPublicJobById(application.jobId);
      } catch {
        job = null;
      }
      return { application, job };
    }),
  );
  const serverJobIds = new Set(items.map((i) => i.jobId));

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <LocalStateBridge />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            My Applications
          </h1>
          <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
            {total === 0
              ? "You haven't applied to any roles yet."
              : `${total} ${total === 1 ? "application" : "applications"} on this page.`}
          </Typography.Paragraph>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-lg border border-default bg-content1 px-4 py-2 text-sm text-white transition-colors hover:border-indigo-500/50"
        >
          <Briefcase className="size-4" />
          Find more roles
        </Link>
      </div>

      {enriched.length === 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-white">No applications yet</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Apply to a job on the public board and it will appear here with
              the recruiter&apos;s reply.
            </p>
            <Link
              href="/jobs"
              className="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
            >
              Browse open roles
            </Link>
          </div>
          <OptimisticApplications serverJobIds={serverJobIds} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enriched.map(({ application, job }) => {
            const status = application.status ?? "submitted";
            const statusColor = statusColors[status] ?? "default";
            const title = job?.title ?? application.jobTitle ?? "Untitled role";
            const company = job?.companySlug ?? application.companySlug;
            const location = job ? formatLocation(job) : null;
            const salary = job ? formatSalary(job) : null;
            const appliedDate = formatAppliedDate(application.appliedAt);
            return (
              <Card
                key={application._id ?? application.jobId}
                className="flex flex-col gap-3 rounded-2xl border border-default bg-content1 p-5"
              >
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {job ? (
                        <Link
                          href={`/jobs/${application.jobId}`}
                          className="truncate text-lg font-semibold text-white transition-colors hover:text-indigo-300"
                        >
                          {title}
                        </Link>
                      ) : (
                        <span className="truncate text-lg font-semibold text-white">
                          {title}
                        </span>
                      )}
                      <Chip color={statusColor} size="sm" variant="soft">
                        {status === "submitted" ? (
                          <>
                            <Clock className="size-3" />
                            Submitted
                          </>
                        ) : status === "interviewing" || status === "offered" ? (
                          <>
                            <CircleCheck className="size-3" />
                            {status === "interviewing"
                              ? "Interviewing"
                              : "Offered"}
                          </>
                        ) : (
                          status[0].toUpperCase() + status.slice(1)
                        )}
                      </Chip>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {company && (
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase className="size-3" />
                          {company}
                        </span>
                      )}
                      {location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3" />
                          {location}
                        </span>
                      )}
                      {salary && (
                        <span className="inline-flex items-center gap-1.5">
                          <Wallet className="size-3" />
                          {salary}
                        </span>
                      )}
                      {appliedDate && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3" />
                          Applied {appliedDate}
                        </span>
                      )}
                    </div>
                  </div>
                  {job && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link
                        href={`/jobs/${application.jobId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-indigo-500/50 hover:text-white"
                      >
                        View job
                      </Link>
                      <WithdrawApplicationButton
                        jobId={application.jobId}
                        jobTitle={title}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-default pt-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Envelope className="size-3" />
                    <span className="truncate">{application.email}</span>
                  </div>
                  {application.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Smartphone className="size-3" />
                      <span className="truncate">{application.phone}</span>
                    </div>
                  )}
                  {application.expectedSalary ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wallet className="size-3" />
                      <span>
                        Expected: $
                        {Number(application.expectedSalary).toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                  {application.resumeUrl && (
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-xs text-indigo-300 transition-colors hover:text-indigo-200"
                    >
                      Resume ↗
                    </a>
                  )}
                </div>

                {application.coverLetter && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer text-white">
                      Cover letter
                    </summary>
                    <p className="mt-2 whitespace-pre-line text-muted-foreground">
                      {application.coverLetter}
                    </p>
                  </details>
                )}
              </Card>
            );
          })}
          <OptimisticApplications serverJobIds={serverJobIds} />
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={`/dashboard/applications?page=${page - 1}`}
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
          {page < totalPages ? (
            <Link
              href={`/dashboard/applications?page=${page + 1}`}
              className="rounded-lg border border-default bg-content1 px-4 py-2 text-white transition-colors hover:border-indigo-500/50"
            >
              Next
            </Link>
          ) : (
            <span className="text-muted-foreground">Next</span>
          )}
        </nav>
      )}
    </div>
  );
}
