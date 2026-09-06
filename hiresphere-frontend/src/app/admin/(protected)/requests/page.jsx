import { getAdminRequests } from "@/lib/actions/admin";
import { FileCheck, ShieldCheck } from "@gravity-ui/icons";
import RequestsTable from "./RequestsTable";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const data = await getAdminRequests().catch(() => ({ items: [] }));

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-500 ring-1 ring-amber-500/30">
            <FileCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(color-foreground)">
              Subscription Requests
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage downgrade and cancellation queue from users.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-default-200 bg-content1 shadow-sm overflow-hidden">
        {(!data.items || data.items.length === 0) ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <ShieldCheck className="w-12 h-12 mb-4 text-default-300" />
            <p className="font-medium text-foreground">No pending requests</p>
            <p className="text-sm mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          <RequestsTable requests={data.items} />
        )}
      </div>
    </div>
  );
}
