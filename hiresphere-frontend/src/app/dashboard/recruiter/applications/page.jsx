import { fetchAllApplicants } from "@/lib/actions/applications";
import { getRecruiterJobs } from "@/lib/actions/jobs";
import ApplicantsList from "@/components/dashboard/applications/ApplicantsList";
import {
  Calendar,
  Envelope,
  Persons,
  Smartphone,
  Wallet,
} from "@gravity-ui/icons";
import { Card, Chip } from "@heroui/react";
import Link from "next/link";

const PAGE_SIZE = 20;

export const dynamic = "force-dynamic";

function getAppliedTime(applicant) {
  if (!applicant?.appliedAt) return 0;
  const t = new Date(applicant.appliedAt).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function JobFilterForm({ jobs, jobId, total }) {
  return (
    <form
      method="GET"
      action="/dashboard/recruiter/applications"
      className="flex flex-wrap items-center gap-2"
    >
      <label
        htmlFor="job-filter"
        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
      >
        Job
      </label>
      <select
        id="job-filter"
        name="jobId"
        defaultValue={jobId}
        className="rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
      >
        <option value="">All jobs ({total})</option>
        {jobs.map((job) => {
          const id = job._id ?? job.id;
          return (
            <option key={id} value={id}>
              {job.title ?? "Untitled role"}
            </option>
          );
        })}
      </select>
      <button
        type="submit"
        className="cursor-pointer rounded-lg border border-white/10 bg-[#1b1c1e] px-4 py-2 text-sm text-white transition-colors hover:border-indigo-500/50"
      >
        Apply
      </button>
      {jobId && (
        <Link
          href="/dashboard/recruiter/applications"
          className="text-sm text-muted-foreground transition-colors hover:text-white"
        >
          Clear
        </Link>
      )}
    </form>
  );
}

export default async function RecruiterApplicationsPage({ searchParams }) {
  const params = await searchParams;
  const jobId = typeof params?.jobId === "string" ? params.jobId : "";
  const page = Math.max(1, Number(params?.page) || 1);

  const [jobsResult, applicantsResult] = await Promise.all([
    getRecruiterJobs({ page: 1, pageSize: 100 }),
    fetchAllApplicants({ jobId: jobId || undefined, page, pageSize: PAGE_SIZE }),
  ]);

  const jobs = Array.isArray(jobsResult)
    ? jobsResult
    : (jobsResult?.items ?? []);
  const applicants = Array.isArray(applicantsResult)
    ? applicantsResult
    : (applicantsResult?.items ?? []);
  const total = applicantsResult?.total ?? applicants.length;

  // Server already returns newest first; pre-sort so the initial client
  // render matches the default sortId.
  const initialSorted = [...applicants].sort(
    (a, b) => getAppliedTime(b) - getAppliedTime(a),
  );

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Persons className="size-5 text-indigo-300" />
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Applicants
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Every candidate who applied to your jobs, in one place.
          </p>
        </div>
      </header>

      <div className="mb-6">
        <JobFilterForm jobs={jobs} jobId={jobId} total={total} />
      </div>

      {initialSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
          <Persons className="size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-white">No applicants yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Share your public job links to start receiving applications.
          </p>
        </div>
      ) : (
        <ApplicantsList applicants={initialSorted} total={total} />
      )}
    </div>
  );
}
