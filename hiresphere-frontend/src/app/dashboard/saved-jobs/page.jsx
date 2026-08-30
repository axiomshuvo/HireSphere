import { fetchSavedJobs } from "@/lib/actions/saved-jobs";
import { fetchPublicJobById } from "@/lib/actions/jobs";
import LocalStateBridge from "@/components/dashboard/LocalStateBridge";
import OptimisticSavedJobs from "@/components/dashboard/OptimisticSavedJobs";
import SavedJobCard from "@/components/dashboard/SavedJobCard";
import {
  Bookmark,
  Briefcase,
} from "@gravity-ui/icons";
import { Typography } from "@heroui/react";
import Link from "next/link";

const PAGE_SIZE = 12;

async function loadJobDetails(savedJobs) {
  return Promise.all(
    savedJobs.map(async (saved) => {
      try {
        const job = await fetchPublicJobById(saved.jobId);
        return { saved, job };
      } catch {
        return { saved, job: null };
      }
    }),
  );
}

function PageStrip({ page, totalPages }) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? `/dashboard/saved-jobs?page=${page - 1}` : null;
  const next = page < totalPages ? `/dashboard/saved-jobs?page=${page + 1}` : null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-3 text-sm">
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

export const dynamic = "force-dynamic";

export default async function SavedJobsPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);

  const result = await fetchSavedJobs({ page, pageSize: PAGE_SIZE });
  const savedJobs = Array.isArray(result) ? result : result?.items ?? [];
  const totalPages =
    typeof result?.totalPages === "number" ? Math.max(1, result.totalPages) : 1;

  const enriched = await loadJobDetails(savedJobs);
  const serverJobIds = new Set(savedJobs.map((s) => s.jobId));

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <LocalStateBridge />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Saved Jobs
          </h1>
          <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
            {savedJobs.length === 0
              ? "Bookmark roles to come back to them later."
              : `${savedJobs.length} ${savedJobs.length === 1 ? "role" : "roles"} saved on this page.`}
          </Typography.Paragraph>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-lg border border-default bg-content1 px-4 py-2 text-sm text-white transition-colors hover:border-indigo-500/50"
        >
          <Briefcase className="size-4" />
          Browse more
        </Link>
      </div>

      {enriched.length === 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
            <Bookmark className="size-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-white">No saved jobs yet</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Save a role from any job listing and it will show up here.
            </p>
            <Link
              href="/jobs"
              className="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
            >
              Find your first role
            </Link>
          </div>
          <OptimisticSavedJobs serverJobIds={serverJobIds} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {enriched.map(({ saved, job }) => (
            <SavedJobCard
              key={saved._id ?? saved.jobId}
              saved={saved}
              job={job}
            />
          ))}
          <OptimisticSavedJobs serverJobIds={serverJobIds} />
        </div>
      )}

      <PageStrip page={page} totalPages={totalPages} />
    </div>
  );
}
