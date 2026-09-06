import { getAdminPlans } from "@/lib/actions/admin";
import { LayoutCells, ShieldCheck } from "@gravity-ui/icons";
import AdminPlanCreate from "./AdminPlanCreate";
import PlansTable from "./PlansTable";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const data = await getAdminPlans().catch(() => ({ items: [] }));

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 text-pink-500 ring-1 ring-pink-500/30">
            <LayoutCells className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(color-foreground)">
              Plan Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure subscription plans, pricing, and limits.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm">
        <AdminPlanCreate />
      </div>

      <div className="rounded-2xl border border-default-200 bg-content1 shadow-sm overflow-hidden">
        {(!data.items || data.items.length === 0) ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <ShieldCheck className="w-12 h-12 mb-4 text-default-300" />
            <p className="font-medium text-foreground">No plans configured</p>
            <p className="text-sm mt-1">Create a plan above to get started.</p>
          </div>
        ) : (
          <PlansTable plans={data.items} />
        )}
      </div>
    </div>
  );
}
