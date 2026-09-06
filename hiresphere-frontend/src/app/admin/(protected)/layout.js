import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedAdminLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "admin" && session.user.role !== "mod") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar initialUser={session.user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
