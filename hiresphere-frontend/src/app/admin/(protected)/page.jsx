import { getAdminActivity, getAdminStats } from "@/lib/actions/admin";
import StatCard from "@/components/dashboard/StatCard";
import Link from "next/link";
import { LayoutCells, ShieldCheck } from "@gravity-ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [stats, activity] = await Promise.all([
    getAdminStats().catch(() => null),
    getAdminActivity().catch(() => null),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-500 ring-1 ring-indigo-500/30">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(color-foreground)">
            Command Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Platform overview and quick actions.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? "—"}
          icon="persons"
          tone="indigo"
          hint="All registered members"
        />
        <StatCard
          label="Active Jobs"
          value={stats?.activeJobs ?? "—"}
          icon="file"
          tone="amber"
          hint="Open positions"
        />
        <StatCard
          label="Applications"
          value={stats?.totalApplications ?? "—"}
          icon="lightning"
          tone="emerald"
          hint="Total submissions"
        />
        <StatCard
          label="Active Companies"
          value={stats?.activeCompanies ?? "—"}
          icon="bookmark"
          tone="rose"
          hint="Approved employers"
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-(color-foreground)">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-xl border border-default bg-content1 px-4 py-2.5 text-sm font-medium transition-colors hover:border-indigo-500/50 hover:bg-white/[0.02]" href="/admin/users">
            Manage Users
          </Link>
          <Link className="rounded-xl border border-default bg-content1 px-4 py-2.5 text-sm font-medium transition-colors hover:border-amber-500/50 hover:bg-white/[0.02]" href="/admin/companies">
            Review Companies
          </Link>
          <Link className="rounded-xl border border-default bg-content1 px-4 py-2.5 text-sm font-medium transition-colors hover:border-rose-500/50 hover:bg-white/[0.02]" href="/admin/jobs">
            Moderate Jobs
          </Link>
          <Link className="rounded-xl border border-default bg-content1 px-4 py-2.5 text-sm font-medium transition-colors hover:border-emerald-500/50 hover:bg-white/[0.02]" href="/admin/plans">
            Edit Plans
          </Link>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-default bg-content1 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-(color-foreground)">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-500 ring-1 ring-indigo-500/30">
                <LayoutCells className="size-4" />
              </span>
              Recent activity
            </h2>
            <p className="text-xs text-muted-foreground">
              Live stream of platform events
            </p>
          </div>
        </div>
        
        {activity && (activity.signups?.length > 0 || activity.jobPosts?.length > 0) ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-(color-foreground)">Recent Signups</h3>
              <ul className="flex flex-col gap-2">
                {activity.signups.slice(0, 5).map((u) => (
                  <li key={String(u._id)} className="rounded-xl border border-default p-3 bg-white/[0.01]">
                    <p className="truncate text-sm font-semibold text-(color-foreground)">{u.name || u.email}</p>
                    <p className="truncate text-xs text-muted-foreground">joined as {u.role}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-(color-foreground)">Recent Jobs</h3>
              <ul className="flex flex-col gap-2">
                {activity.jobPosts.slice(0, 5).map((j) => (
                  <li key={String(j._id)} className="rounded-xl border border-default p-3 bg-white/[0.01]">
                    <p className="truncate text-sm font-semibold text-(color-foreground)">{j.title}</p>
                    <p className="truncate text-xs text-muted-foreground">at {j.companyName || "Unknown"}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-default bg-content1/50 px-4 py-8 text-center text-sm text-muted-foreground">
            No recent activity found.
          </p>
        )}
      </section>
    </div>
  );
}
