import { getAdminJobs } from "@/lib/actions/admin";
import { Card } from "@heroui/react";
import JobsTable from "./JobsTable";
import AdminJobButtons from "./AdminJobButtons";
import { Briefcase, ShieldCheck, Check, Ban, Pause } from "@gravity-ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage({ searchParams }) {
  const params = await searchParams;
  const data = await getAdminJobs({
    search: params?.search,
    status: params?.status,
    page: params?.page ?? 1,
  }).catch(() => ({ items: [], total: 0 }));

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-500 ring-1 ring-amber-500/30">
            <Briefcase className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(color-foreground)">
              Job Moderation
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor and force-close scam or abusive job postings.
            </p>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap gap-2 mb-4" method="get">
        <input
          name="search"
          placeholder="Search jobs..."
          defaultValue={params?.search ?? ""}
          className="rounded-lg border border-default bg-content1 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select name="status" defaultValue={params?.status ?? ""} className="rounded-lg border border-default bg-content1 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>
        <button type="submit" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-600 transition-colors">
          Filter
        </button>
      </form>

      <Card className="border border-default-200 shadow-sm overflow-hidden bg-content1">
        {(!data.items || data.items.length === 0) ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <ShieldCheck className="w-12 h-12 mb-4 text-default-300" />
            <p className="font-medium text-foreground">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your search filters.</p>
          </div>
        ) : (
          <JobsTable jobs={data.items} />
        )}
      </Card>
      <p className="text-sm text-muted-foreground">Total jobs: {data.total ?? 0}</p>
    </div>
  );
}
