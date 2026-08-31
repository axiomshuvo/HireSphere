import ApplicationCard from "@/components/dashboard/ApplicationCard";
import { fetchMyApplications } from "@/lib/actions/applications";
import { fetchPublicJobById } from "@/lib/actions/jobs";
import { Briefcase, FileText } from "@gravity-ui/icons";
import { Typography } from "@heroui/react";
import Link from "next/link";

const PAGE_SIZE = 12;

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);

  const result = await fetchMyApplications({ page, pageSize: PAGE_SIZE });
  const items = Array.isArray(result) ? result : (result?.items ?? []);
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

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
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
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
          <FileText className="size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-white">
            No applications yet
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Apply to a job on the public board and it will appear here with the
            recruiter&apos;s reply.
          </p>
          <Link
            href="/jobs"
            className="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
          >
            Browse open roles
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enriched.map(({ application, job }) => (
            <ApplicationCard
              key={application._id ?? application.jobId}
              application={application}
              job={job}
            />
          ))}
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
