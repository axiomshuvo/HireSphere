import { DashBoardSideBar } from "@/components/dashboard/DashBoardSideBar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="flex min-h-screen">
      <DashBoardSideBar initialUser={session.user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
