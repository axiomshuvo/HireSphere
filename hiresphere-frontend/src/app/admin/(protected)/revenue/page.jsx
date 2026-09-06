import { getAdminRevenue } from "@/lib/actions/admin";
import { FileDollar, Persons, LayoutCells, ChartLineArrowUp, ShieldCheck } from "@gravity-ui/icons";
import StatCard from "@/components/dashboard/StatCard";
import RevenueTable from "./RevenueTable";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const data = await getAdminRevenue().catch(() => null);
  
  if (!data) {
    return (
      <div className="space-y-6 p-6">
        <div className="rounded-2xl border border-danger-200 bg-danger-50/50 p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-danger-600 mb-2">Revenue Data Unavailable</h1>
          <p className="text-sm text-danger-500">
            Is the backend running and ADMIN_SECRET_KEY set on both sides?
          </p>
        </div>
      </div>
    );
  }

  const byPlanEntries = Object.entries(data.byPlan ?? {}).filter(([k,v]) => k !== "free" && v > 0);
  const topPlan = byPlanEntries.sort((a,b) => b[1] - a[1])[0]?.[0] || "None";

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-500 ring-1 ring-emerald-500/30">
            <FileDollar className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(color-foreground)">
              Revenue Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Estimated Monthly Recurring Revenue (MRR) based on active subscriptions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Estimated MRR"
          value={`$${data.mrr.toLocaleString()}`}
          icon="chart"
          tone="emerald"
        />
        <StatCard
          label="Paying Subscribers"
          value={data.payingUsers.toLocaleString()}
          icon="persons"
          tone="indigo"
        />
        <StatCard
          label="Most Popular Plan"
          value={topPlan.charAt(0).toUpperCase() + topPlan.slice(1)}
          icon="layout"
          tone="amber"
        />
      </div>

      <div className="rounded-2xl border border-default-200 bg-content1 shadow-sm overflow-hidden mt-6">
        <div className="border-b border-default-200 bg-default-50/50 px-5 py-4">
          <h2 className="text-base font-semibold">Recent Subscription Events</h2>
        </div>
        {(!data.recent || data.recent.length === 0) ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <ShieldCheck className="w-12 h-12 mb-4 text-default-300" />
            <p className="font-medium text-foreground">No recent events</p>
          </div>
        ) : (
          <RevenueTable subscriptions={data.recent} />
        )}
      </div>
    </div>
  );
}
