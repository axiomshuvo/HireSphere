import WithdrawApplicationButton from "@/components/dashboard/WithdrawApplicationButton";
import {
  Briefcase,
  Calendar,
  CircleCheck,
  Clock,
  Envelope,
  MapPin,
  Smartphone,
  Wallet,
} from "@gravity-ui/icons";
import { Card, Chip } from "@heroui/react";
import Link from "next/link";

const statusColors = {
  submitted: "primary",
  reviewed: "warning",
  interviewing: "success",
  offered: "success",
  rejected: "danger",
  withdrawn: "default",
};

function formatDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function formatLocation(job) {
  if (job?.remote) return "Remote";
  const parts = [job?.city, job?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function formatSalary(job) {
  if (!job?.salaryMin || !job?.salaryMax) return null;
  return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
}

export default function ApplicationCard({ application, job }) {
  const status = application.status ?? "submitted";
  const statusLabel = status[0].toUpperCase() + status.slice(1);
  const title = job?.title ?? application.jobTitle ?? "Untitled role";
  const company = job?.companySlug ?? application.companySlug;
  const location = job ? formatLocation(job) : null;
  const salary = job ? formatSalary(job) : null;
  const appliedDate = formatDate(application.appliedAt);

  return (
    <Card className="group overflow-hidden rounded-2xl border border-default bg-content1 transition-colors hover:border-indigo-500/40">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden h-14 w-1 shrink-0 rounded-full bg-gradient-to-b from-indigo-400 to-cyan-400 sm:block" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                {job ? (
                  <Link
                    href={`/jobs/${application.jobId}`}
                    className="block truncate text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-indigo-600"
                  >
                    {title}
                  </Link>
                ) : (
                  <p className="truncate text-xl font-semibold tracking-tight text-foreground">
                    {title}
                  </p>
                )}
                {company && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Briefcase className="size-3.5" />
                    {company}
                  </p>
                )}
              </div>
              <Chip
                color={statusColors[status] ?? "default"}
                size="sm"
                variant="soft"
              >
                {status === "submitted" && <Clock className="size-3" />}
                {(status === "interviewing" || status === "offered") && (
                  <CircleCheck className="size-3" />
                )}
                {statusLabel}
              </Chip>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {location && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                  <MapPin className="size-3.5 text-indigo-500" />
                  {location}
                </span>
              )}
              {salary && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                  <Wallet className="size-3.5 text-indigo-500" />
                  {salary}
                </span>
              )}
              {appliedDate && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                  <Calendar className="size-3.5 text-indigo-500" />
                  Applied {appliedDate}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-default pt-4 sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <Envelope className="size-3.5 shrink-0 text-indigo-500" />
            <span className="truncate">
              {application.email || "No email provided"}
            </span>
          </div>
          {application.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Smartphone className="size-3.5 text-indigo-500" />
              <span>{application.phone}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {application.coverLetter
              ? "Cover letter included"
              : "No cover letter"}
            {application.resumeUrl ? " · Resume attached" : " · No resume link"}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {job && (
              <Link
                href={`/jobs/${application.jobId}`}
                className="inline-flex items-center rounded-lg border border-default-200 bg-default-100 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-indigo-500/50"
              >
                View job
              </Link>
            )}
            <WithdrawApplicationButton
              jobId={application.jobId}
              jobTitle={title}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
