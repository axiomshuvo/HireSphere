import { DashBoardSideBar } from "@/components/dashboard/DashBoardSideBar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

export default function DashBoardlayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <DashBoardSideBar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
