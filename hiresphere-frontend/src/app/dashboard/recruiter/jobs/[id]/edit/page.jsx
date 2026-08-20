"use client";

import JobForm from "@/components/dashboard/jobs/JobForm";
import { useJobs } from "@/context/JobsContext";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditJobPage() {
  const params = useParams();
  const { jobs } = useJobs();
  const job = jobs.find((item) => item.id === params.id);

  if (!job) {
    return (
      <div className="flex-1 px-4 py-8 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-[#121316] p-6 text-center">
          <h1 className="text-xl font-semibold text-white">Job not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This job may have been deleted or the link is invalid.
          </p>
          <Link
            href="/dashboard/recruiter/jobs"
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Edit Job
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update the details for {job.title}.
        </p>
      </div>

      <JobForm job={job} />
    </div>
  );
}
