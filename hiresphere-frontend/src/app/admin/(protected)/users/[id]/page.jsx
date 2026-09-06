import { getAdminUser } from "@/lib/actions/admin";
import { Card } from "@heroui/react";
import AdminUserActions from "../AdminUserActions";
import AdminPlanOverride from "./AdminPlanOverride";
import AdminUserNoteForm from "./AdminUserNoteForm";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }) {
  const { id } = await params;
  const data = await getAdminUser(id).catch(() => null);
  if (!data) return <p className="p-6">User not found.</p>;
  const { user, stats, subscription } = data;

  return (
    <div className="space-y-4 p-6">
      <h1>{user.name ?? user.email}</h1>
      <p className="text-sm text-(color-text-muted)">
        {user.email} · {user.role} · {user.plan ?? "free"} · {user.status ?? "active"}
        {user.flagged ? " · Flagged" : ""}
      </p>
      <AdminUserActions id={String(user._id)} status={user.status ?? "active"} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3>Activity</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Applications: {stats?.applicationsCount ?? 0}</li>
            <li>Saved jobs: {stats?.savedCount ?? 0}</li>
            <li>Companies: {stats?.companiesOwned ?? 0}</li>
            <li>Jobs posted: {stats?.jobsPosted ?? 0}</li>
          </ul>
        </Card>
        <Card className="p-4">
          <h3>Subscription</h3>
          <pre className="mt-2 overflow-x-auto text-xs">
            {JSON.stringify(subscription ?? { plan: user.plan ?? "free" }, null, 2)}
          </pre>
        </Card>
      </div>
      <AdminPlanOverride id={String(user._id)} currentPlan={user.plan ?? "free"} />
      <AdminUserNoteForm id={String(user._id)} />
      {user.internalNotes?.length ? (
        <Card className="p-4">
          <h3>Internal notes</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {user.internalNotes.map((n, i) => (
              <li key={i}>
                {n.text} — {n.authorName ?? "mod"} · {n.createdAt}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
