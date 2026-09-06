import { getAdminModerators } from "@/lib/actions/admin";
import { ShieldCheck } from "@gravity-ui/icons";
import { Card } from "@heroui/react";
import AdminModeratorForms from "./AdminModeratorForms";
import AdminModDeleteButton from "./AdminModDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminModeratorsPage() {
  const data = await getAdminModerators().catch(() => ({ items: [] }));

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 text-rose-500 ring-1 ring-rose-500/30">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(color-foreground)">
              Moderation Team
            </h1>
            <p className="text-sm text-muted-foreground">
              Add or remove moderators from the platform.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm">
        <AdminModeratorForms />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data.items ?? []).map((m) => (
          <Card key={String(m._id)} className="p-5 shadow-sm border border-default-200">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-default-100 text-sm font-semibold text-foreground">
                {(m.name ?? m.email)?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.name || "Moderator"}</p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
            </div>
            <div className="mt-4 flex">
               <span className="w-fit rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-500">
                MODERATOR
              </span>
              <div className="ml-auto">
                <AdminModDeleteButton id={String(m._id)} />
              </div>
            </div>
          </Card>
        ))}
        {!data.items?.length ? (
          <div className="col-span-full p-12 flex flex-col items-center justify-center text-muted-foreground bg-content1 rounded-2xl border border-default-200">
            <ShieldCheck className="w-12 h-12 mb-4 text-default-300" />
            <p className="font-medium text-foreground">No moderators found</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
