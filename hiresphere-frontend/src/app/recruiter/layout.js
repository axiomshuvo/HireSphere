import { RecruiterSidebar } from "@/components/dashboard/RecruiterSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RecruiterLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "recruiter") redirect("/seeker");

  return (
    <div className="flex min-h-screen">
      <RecruiterSidebar initialUser={session.user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
