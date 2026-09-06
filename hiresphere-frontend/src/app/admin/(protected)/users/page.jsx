import { getAdminUsers } from "@/lib/actions/admin";
import { auth } from "@/lib/auth";
import { Card } from "@heroui/react";
import UsersTable from "./UsersTable";
import { headers } from "next/headers";
import Link from "next/link";
import AdminUserActions from "./AdminUserActions";
import { Persons, ShieldCheck, Ban, Check } from "@gravity-ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const viewerIsAdmin = session?.user?.role === "admin";
  const data = await getAdminUsers({
    search: params?.search,
    role: params?.role,
    status: params?.status,
    page: params?.page ?? 1,
  }).catch(() => ({ items: [], total: 0 }));

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-500 ring-1 ring-indigo-500/30">
            <Persons className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(color-foreground)">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">
              View and moderate all users across the platform.
            </p>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap gap-2 mb-4" method="get">
        <input
          name="search"
          placeholder="Search users..."
          defaultValue={params?.search ?? ""}
          className="rounded-lg border border-default bg-content1 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select name="role" defaultValue={params?.role ?? ""} className="rounded-lg border border-default bg-content1 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <option value="">All roles</option>
          <option value="seeker">Seekers</option>
          <option value="recruiter">Recruiters</option>
          {viewerIsAdmin ? (
            <>
              <option value="mod">Moderators</option>
              <option value="admin">Admins</option>
            </>
          ) : null}
        </select>
        <button type="submit" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-600 transition-colors">
          Filter
        </button>
      </form>

      <Card className="border border-default-200 shadow-sm overflow-hidden bg-content1">
        {(!data.items || data.items.length === 0) ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <ShieldCheck className="w-12 h-12 mb-4 text-default-300" />
            <p className="font-medium text-foreground">No users found</p>
            <p className="text-sm mt-1">Try adjusting your search filters.</p>
          </div>
        ) : (
          <UsersTable users={data.items} />
        )}
      </Card>
      <p className="text-sm text-muted-foreground">Total users matching criteria: {data.total ?? 0}</p>
    </div>
  );
}
