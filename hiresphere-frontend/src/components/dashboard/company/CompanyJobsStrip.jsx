"use client";

import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import {
  formatJobDate,
  getJobCreatedAt,
} from "@/lib/api/jobstruture";
import { ArrowRight } from "@gravity-ui/icons";
import { Card, Typography } from "@heroui/react";
import Link from "next/link";
import JobStatusChip from "@/components/dashboard/jobs/JobStatusChip";

function formatLocation(job) {
  if (job.remote) return "Remote";
  const parts = [job.city, job.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function JobRow({ job }) {
  const jobId = job.id ?? job._id;
  const location = formatLocation(job);

  return (
    <Link
      href={`/dashboard/recruiter/jobs/${jobId}/edit`}
      className="group flex items-start gap-4 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-default hover:bg-[#1b1c1e]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-white">{job.title}</p>
          <JobStatusChip status={job.status} />
          <DeadlineCountdown deadline={job.deadline} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {job.type && <span>{job.type}</span>}
          {location && <span>• {location}</span>}
          <span>• Posted {formatJobDate(getJobCreatedAt(job))}</span>
        </div>
      </div>
      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
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
