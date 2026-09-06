import { getAdminActivity } from "@/lib/actions/admin";
import { ListTimeline, Person, Briefcase, FileCheck, ShieldCheck } from "@gravity-ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const data = await getAdminActivity().catch(() => null);
  
  if (!data) {
    return (
      <div className="space-y-6 p-6">
        <div className="rounded-2xl border border-danger-200 bg-danger-50/50 p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-danger-600 mb-2">Activity Data Unavailable</h1>
          <p className="text-sm text-danger-500">
            Is the backend running and ADMIN_SECRET_KEY set on both sides?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-500 ring-1 ring-indigo-500/30">
            <ListTimeline className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(color-foreground)">
              Platform Activity
            </h1>
            <p className="text-sm text-muted-foreground">
              Recent signups, job postings, and applications.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Signups */}
        <div className="rounded-2xl border border-default-200 bg-content1 shadow-sm overflow-hidden flex flex-col h-96">
          <div className="border-b border-default-200 bg-default-50/50 px-5 py-4 flex items-center gap-2">
             <span className="flex size-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-500">
                <Person className="size-3" />
             </span>
            <h2 className="text-base font-semibold">New Signups</h2>
          </div>
          <div className="overflow-y-auto p-4 flex-1">
             {(!data.signups || data.signups.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ShieldCheck className="w-8 h-8 mb-2 text-default-300" />
                  <p className="text-sm font-medium">No recent signups</p>
                </div>
             ) : (
                <ul className="space-y-3">
                  {data.signups.map((u) => (
                    <li key={String(u._id)} className="flex flex-col gap-1 text-sm border-b border-default-100 pb-3 last:border-0 last:pb-0">
                      <span className="font-medium truncate">{u.name ?? u.email}</span>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                         <span className="uppercase tracking-wider">{u.role}</span>
                         <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
             )}
          </div>
        </div>

        {/* Jobs */}
        <div className="rounded-2xl border border-default-200 bg-content1 shadow-sm overflow-hidden flex flex-col h-96">
          <div className="border-b border-default-200 bg-default-50/50 px-5 py-4 flex items-center gap-2">
             <span className="flex size-6 items-center justify-center rounded bg-indigo-500/10 text-indigo-500">
                <Briefcase className="size-3" />
             </span>
            <h2 className="text-base font-semibold">New Job Posts</h2>
          </div>
          <div className="overflow-y-auto p-4 flex-1">
             {(!data.jobPosts || data.jobPosts.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ShieldCheck className="w-8 h-8 mb-2 text-default-300" />
                  <p className="text-sm font-medium">No recent jobs</p>
                </div>
             ) : (
                <ul className="space-y-3">
                  {data.jobPosts.map((j) => (
                    <li key={String(j._id)} className="flex flex-col gap-1 text-sm border-b border-default-100 pb-3 last:border-0 last:pb-0">
                      <span className="font-medium line-clamp-2">{j.title}</span>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                         <span className="truncate max-w-[120px]">{j.companySlug}</span>
                         <span>{new Date(j.createdAt).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
             )}
          </div>
        </div>

        {/* Applications */}
        <div className="rounded-2xl border border-default-200 bg-content1 shadow-sm overflow-hidden flex flex-col h-96">
          <div className="border-b border-default-200 bg-default-50/50 px-5 py-4 flex items-center gap-2">
             <span className="flex size-6 items-center justify-center rounded bg-amber-500/10 text-amber-500">
                <FileCheck className="size-3" />
             </span>
            <h2 className="text-base font-semibold">New Applications</h2>
          </div>
          <div className="overflow-y-auto p-4 flex-1">
             {(!data.applications || data.applications.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ShieldCheck className="w-8 h-8 mb-2 text-default-300" />
                  <p className="text-sm font-medium">No recent applications</p>
                </div>
             ) : (
                <ul className="space-y-3">
                  {data.applications.map((a) => (
                    <li key={String(a._id)} className="flex flex-col gap-1 text-sm border-b border-default-100 pb-3 last:border-0 last:pb-0">
                      <span className="font-medium truncate">{a.name}</span>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-0.5">
                         <span className="truncate max-w-[120px]">Applied: {a.jobTitle ?? a.jobId}</span>
                         <span>{new Date(a.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
