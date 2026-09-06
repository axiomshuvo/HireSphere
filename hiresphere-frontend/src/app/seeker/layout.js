import { SeekerSidebar } from "@/components/dashboard/SeekerSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SeekerLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role === "recruiter") redirect("/recruiter");
  if (session.user.role === "admin" || session.user.role === "mod") redirect("/admin");

  return (
    <div className="flex min-h-screen">
      <SeekerSidebar initialUser={session.user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
