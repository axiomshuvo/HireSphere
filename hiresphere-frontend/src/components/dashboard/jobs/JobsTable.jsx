"use client";

import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import {
  formatJobDate,
  getJobCreatedAt,
  getJobId,
} from "@/lib/api/jobstruture";
import { Ban, Briefcase, Eye, MapPin, Pencil, Play, Wallet } from "@gravity-ui/icons";
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
          <Typography.Heading className="text-lg font-semibold text-white" level={2}>
            Manage Jobs
          </Typography.Heading>
          <Typography.Paragraph className="text-sm text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} on this page
          </Typography.Paragraph>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-default bg-content1/50 px-6 py-12 text-center">
          <Briefcase className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No jobs on this page.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {jobs.map((job) => {
            const jobId = getJobId(job) ?? job.id ?? job._id;
            const companyName = job.companySlug
              ? (companyNameById[job.companySlug] ?? job.companySlug)
              : "—";
            const salary = formatSalary(job);
            const location = formatLocation(job);

            return (
              <li
                key={jobId}
                className="group flex flex-col gap-3 rounded-xl border border-default bg-[#15171a] p-4 transition-colors hover:border-indigo-500/40 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/recruiter/jobs/${jobId}`}
                      className="truncate text-base font-semibold text-white transition-colors hover:text-indigo-300"
                    >
                      {job.title || "Untitled job"}
                    </Link>
                    <JobStatusChip status={job.status} />
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
                        <span className="text-muted-foreground/70">·</span>
                        {job.applicants} applicant{job.applicants === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={`Edit ${job.title}`}
                    onPress={() => handleEdit(job)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={`View ${job.title}`}
                    onPress={() => handleView(job)}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={
                      job.status === "active"
                        ? `Close ${job.title}`
                        : `Reopen ${job.title}`
                    }
                    onPress={() => onToggleStatus(job)}
                  >
                    {job.status === "active" ? (
                      <Ban className="size-4" />
                    ) : (
                      <Play className="size-4" />
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
