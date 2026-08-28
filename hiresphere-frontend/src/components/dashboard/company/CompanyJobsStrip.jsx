"use client";

import { formatJobDate, getJobCreatedAt } from "@/lib/api/jobstruture";
import { ArrowRight } from "@gravity-ui/icons";
import { Card, Chip, Typography } from "@heroui/react";
import Link from "next/link";

function statusMeta(status) {
  if (status === "active") {
    return { color: "success", label: "Active" };
  }
  if (status === "closed") {
    return { color: "danger", label: "Closed" };
  }
  return { color: "warning", label: "Draft" };
}

function JobRow({ job }) {
  const meta = statusMeta(job.status);
  const jobId = job.id ?? job._id;

  return (
    <Link
      href={`/dashboard/recruiter/jobs/${jobId}/edit`}
      className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-default hover:bg-[#1b1c1e]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{job.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{job.type ?? job.category ?? "—"}</span>
          {job.location && <span>• {job.location}</span>}
          <span>• Posted {formatJobDate(getJobCreatedAt(job))}</span>
        </div>
      </div>
      <Chip color={meta.color} size="sm" variant="soft">
        {meta.label}
      </Chip>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
    </Link>
  );
}

export default function CompanyJobsStrip({ jobs = [] }) {
  if (jobs.length === 0) return null;

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="mb-3 flex items-center justify-between">
        <Typography.Heading
          className="text-lg font-semibold text-white"
          level={2}
        >
          Recent Jobs
        </Typography.Heading>
        <Link
          href="/dashboard/recruiter/jobs"
          className="text-xs text-indigo-400 transition-colors hover:text-indigo-300"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-white/5">
        {jobs.slice(0, 5).map((job, index) => (
          <JobRow key={job.id ?? job._id ?? index} job={job} />
        ))}
      </div>
    </Card>
  );
}
