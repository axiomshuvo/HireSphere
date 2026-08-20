import { DashBoardSideBar } from "./DashBoardSideBar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { JobsProvider } from "@/context/JobsContext";

export default function DashBoardlayout({ children }) {
  return (
    <JobsProvider>
      <div className="flex min-h-screen">
        <DashBoardSideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopBar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </JobsProvider>
  );
}
