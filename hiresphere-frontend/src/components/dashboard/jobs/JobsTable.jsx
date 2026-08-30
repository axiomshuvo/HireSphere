"use client";

import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import {
  formatJobDate,
  getJobCreatedAt,
  getJobId,
} from "@/lib/api/jobstruture";
import {
  Ban,
  Briefcase,
  Eye,
  MapPin,
  Pencil,
  Persons,
  Play,
  Wallet,
} from "@gravity-ui/icons";
import { Button, Card, Typography } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteJobDialog from "./DeleteJobDialog";
import JobStatusChip from "./JobStatusChip";

function formatSalary(job) {
  if (!job.salaryMin || !job.salaryMax) return null;
  return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
}

function formatLocation(job) {
  if (job.remote) return "Remote";
  const parts = [job.city, job.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

const STATUS_BAR = {
  active: "bg-emerald-500",
  draft: "bg-amber-500",
  closed: "bg-red-500",
};

export default function JobsTable({
  jobs,
  companyNameById = {},
  onToggleStatus,
  onDelete,
}) {
  const router = useRouter();

  const handleEdit = (job) => {
    const id = getJobId(job);
    if (!id) return;
    router.push(`/dashboard/recruiter/jobs/${id}/edit`);
  };

  const handleView = (job) => {
    const id = getJobId(job);
    if (!id) return;
    router.push(`/dashboard/recruiter/jobs/${id}`);
  };

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Typography.Heading
            className="text-lg font-semibold text-white"
            level={2}
          >
            Jobs
          </Typography.Heading>
          <Typography.Paragraph className="text-sm text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} shown
          </Typography.Paragraph>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-default bg-content1/50 px-6 py-12 text-center">
          <Briefcase className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No jobs to show.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {jobs.map((job) => {
            const jobId = getJobId(job) ?? job.id ?? job._id;
            const companyName = job.companySlug
              ? (companyNameById[job.companySlug] ?? job.companySlug)
              : "—";
            const salary = formatSalary(job);
            const location = formatLocation(job);
            const status = job.status ?? "draft";
            const barColor = STATUS_BAR[status] ?? "bg-muted-foreground";

            return (
              <li
                key={jobId}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-default bg-[#15171a] p-4 pl-5 transition-colors hover:border-indigo-500/40 sm:flex-row sm:items-center sm:gap-4"
              >
                <span
                  className={`absolute left-0 top-0 h-full w-1 ${barColor}`}
                  aria-hidden
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/recruiter/jobs/${jobId}`}
                      className="truncate text-base font-semibold text-white transition-colors hover:text-indigo-300"
                    >
                      {job.title || "Untitled job"}
                    </Link>
                    <JobStatusChip status={job.status} />
                    {job.closedReason === "company-renamed" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
                        company renamed
                      </span>
                    )}
                    <DeadlineCountdown deadline={job.deadline} />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="size-3" />
                      {companyName}
                    </span>
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
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-muted-foreground/70">Posted</span>
                      {formatJobDate(getJobCreatedAt(job))}
                    </span>
                    {typeof job.applicants === "number" && (
                      <span className="inline-flex items-center gap-1.5">
                        <Persons className="size-3" />
                        {job.applicants} applicant
                        {job.applicants === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => handleView(job)}
                    className="cursor-pointer"
                  >
                    <Eye className="size-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => handleEdit(job)}
                    className="cursor-pointer"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "active" ? "secondary" : "primary"}
                    onPress={() => onToggleStatus?.(job)}
                    className="cursor-pointer"
                  >
                    {status === "active" ? (
                      <>
                        <Ban className="size-4" />
                        Close
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Reopen
                      </>
                    )}
                  </Button>
                  <DeleteJobDialog job={job} onConfirm={onDelete} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
