"use client";

import JobsTable from "@/components/dashboard/jobs/JobsTable";
import PlanUsageCard from "@/components/dashboard/jobs/PlanUsageCard";
import ButtonLink from "@/components/shared/ButtonLink";
import { deleteRecruiterJob, getRecruiterJobs, updateRecruiterJobStatus } from "@/lib/actions/jobs";
import { getRecruiterCompanies } from "@/lib/actions/company";
import { getCompanySlug, normalizeCompanies } from "@/lib/api/companies";
import { getActiveCount, getJobId, getPlanUsage } from "@/lib/api/jobstruture";
import { CirclePlus } from "@gravity-ui/icons";
import { Button, toast } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

function normalizeJob(job) {
  if (!job) return job;
  const id = getJobId(job);
  if (id && !job.id) {
    return { ...job, id };
  }
  return job;
}

function PageStrip({ page, totalPages }) {
  if (totalPages <= 1) return null;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <nav className="flex items-center justify-center gap-3 text-sm">
      {canPrev ? (
        <ButtonLink
          href={`/dashboard/recruiter/jobs?page=${page - 1}`}
          variant="secondary"
          size="sm"
        >
          Previous
        </ButtonLink>
      ) : (
        <span className="text-muted-foreground">Previous</span>
      )}
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {canNext ? (
        <ButtonLink
          href={`/dashboard/recruiter/jobs?page=${page + 1}`}
          variant="secondary"
          size="sm"
        >
          Next
        </ButtonLink>
      ) : (
        <span className="text-muted-foreground">Next</span>
      )}
    </nav>
  );
}

export default function RecruiterJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [companyNameById, setCompanyNameById] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getRecruiterJobs({ page, pageSize: PAGE_SIZE }),
      getRecruiterCompanies({ pageSize: 100 }),
    ])
      .then(([jobsData, companiesData]) => {
        if (cancelled) return;

        const jobList = Array.isArray(jobsData)
          ? jobsData
          : (jobsData?.items ?? []);
        setJobs(jobList.map(normalizeJob));
        if (typeof jobsData?.totalPages === "number") {
          setTotalPages(Math.max(1, jobsData.totalPages));
        } else {
          setTotalPages(1);
        }

        const companyList = Array.isArray(companiesData)
          ? companiesData
          : (companiesData?.items ?? []);
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
  }, [page]);

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
      await updateRecruiterJobStatus(jobId, nextStatus);
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

    deleteRecruiterJob(jobId).catch((error) => {
      console.error("Failed to delete job:", error);
      // Re-fetch the current page if the optimistic removal didn't work.
      getRecruiterJobs({ page, pageSize: PAGE_SIZE }).then((data) => {
        const list = Array.isArray(data) ? data : (data?.items ?? []);
        setJobs(list.map(normalizeJob));
      });
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
        <PageStrip page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
