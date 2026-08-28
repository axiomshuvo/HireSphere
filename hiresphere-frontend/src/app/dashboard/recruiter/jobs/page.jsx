"use client";

import JobsTable from "@/components/dashboard/jobs/JobsTable";
import PlanUsageCard from "@/components/dashboard/jobs/PlanUsageCard";
import { fetchCompanies } from "@/lib/actions/company";
import { deleteJob, fetchJobs, updateJobStatus } from "@/lib/actions/jobs";
import { getCompanySlug, normalizeCompanies } from "@/lib/api/companies";
import { getActiveCount, getJobId, getPlanUsage } from "@/lib/api/jobstruture";
import { CirclePlus } from "@gravity-ui/icons";
import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function normalizeJob(job) {
  if (!job) return job;
  const id = getJobId(job);
  if (id && !job.id) {
    return { ...job, id };
  }
  return job;
}

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [companyNameById, setCompanyNameById] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const reloadJobs = useCallback(() => {
    return fetchJobs().then((data) => {
      const list = Array.isArray(data) ? data : [];
      setJobs(list.map(normalizeJob));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchJobs(), fetchCompanies()])
      .then(([jobsData, companiesData]) => {
        if (cancelled) return;

        const jobList = Array.isArray(jobsData) ? jobsData : [];
        setJobs(jobList.map(normalizeJob));

        const companyList = Array.isArray(companiesData) ? companiesData : [];
        const lookup = {};
        for (const company of normalizeCompanies(companyList)) {
          const id = getCompanySlug(company);
          if (id) {
            lookup[id] = company.name ?? company.shortName ?? "—";
          }
        }
        setCompanyNameById(lookup);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load jobs:", error);
        toast.danger("Could not load jobs", {
          description: "Make sure the API server is running.",
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const usage = getPlanUsage(getActiveCount(jobs));

  const handleToggleStatus = async (job) => {
    const jobId = getJobId(job);
    if (!jobId) return;
    const nextStatus = job.status === "active" ? "closed" : "active";

    if (
      nextStatus === "active" &&
      (!job.companySlug || !companyNameById[job.companySlug])
    ) {
      toast.warning("Cannot reopen job", {
        description:
          "This job has no company. Add a company to it before reopening.",
      });
      return;
    }

    setJobs((prev) =>
      prev.map((item) =>
        getJobId(item) === jobId ? { ...item, status: nextStatus } : item,
      ),
    );

    try {
      await updateJobStatus(jobId, nextStatus);
      toast.success(nextStatus === "active" ? "Job reopened" : "Job closed", {
        description: `${job.title} status updated.`,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      setJobs((prev) =>
        prev.map((item) =>
          getJobId(item) === jobId ? { ...item, status: job.status } : item,
        ),
      );
      toast.danger("Status update failed", {
        description: `${job.title} was not updated.`,
      });
    }
  };

  const handleDelete = (job) => {
    const jobId = getJobId(job);
    if (!jobId) return;

    setJobs((prev) => prev.filter((item) => getJobId(item) !== jobId));

    deleteJob(jobId).catch((error) => {
      console.error("Failed to delete job:", error);
      reloadJobs();
      toast.danger("Delete failed", {
        description: `${job.title} could not be deleted.`,
      });
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <p className="text-sm text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

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
          companyNameById={companyNameById}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
