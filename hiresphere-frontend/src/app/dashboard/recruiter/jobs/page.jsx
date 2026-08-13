"use client";

import JobsTable from "@/components/dashboard/jobs/JobsTable";
import PlanUsageCard from "@/components/dashboard/jobs/PlanUsageCard";
import {
  getActiveCount,
  getPlanUsage,
  INITIAL_JOBS,
} from "@/lib/jobs";
import { CirclePlus } from "@gravity-ui/icons";
import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState(INITIAL_JOBS);

  const usage = getPlanUsage(getActiveCount(jobs));

  const handleToggleStatus = (job) => {
    setJobs((prev) =>
      prev.map((item) =>
        item.id === job.id
          ? { ...item, status: item.status === "active" ? "closed" : "active" }
          : item,
      ),
    );
    toast.success(job.status === "active" ? "Job closed" : "Job reopened", {
      description: `${job.title} status updated.`,
    });
  };

  const handleDelete = (job) => {
    setJobs((prev) => prev.filter((item) => item.id !== job.id));
  };

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Manage Jobs
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track and manage every job post from your recruiter dashboard.
          </p>
        </div>

        <Button
          variant="primary"
          isDisabled={!usage.hasAvailableSlots}
          onPress={() => router.push("/dashboard/recruiter/jobs/new")}
        >
          <CirclePlus className="size-4" />
          Post New Job
        </Button>
      </div>

      <div className="space-y-6">
        <PlanUsageCard usage={usage} />
        <JobsTable
          jobs={jobs}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
