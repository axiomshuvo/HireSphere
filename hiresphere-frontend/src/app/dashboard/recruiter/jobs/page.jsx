"use client";

import JobsFilters from "@/components/dashboard/jobs/JobsFilters";
import JobsOverview from "@/components/dashboard/jobs/JobsOverview";
import JobsTable from "@/components/dashboard/jobs/JobsTable";
import ButtonLink from "@/components/shared/ButtonLink";
import { getRecruiterCompanies } from "@/lib/actions/company";
import {
  deleteRecruiterJob,
  getRecruiterJobStats,
  getRecruiterJobs,
  updateRecruiterJobStatus,
} from "@/lib/actions/jobs";
import { getCompanySlug, normalizeCompanies } from "@/lib/api/companies";
import { getJobId, getPlanUsage } from "@/lib/api/jobstruture";
import { CirclePlus } from "@gravity-ui/icons";
import { Button, Card, Typography, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const FETCH_PAGE_SIZE = 100;

function normalizeJob(job) {
  if (!job) return job;
  const id = getJobId(job);
  if (id && !job.id) {
    return { ...job, id };
  }
  return job;
}

function jobMatches(job, { status, companyId, query }) {
  if (status !== "all" && (job.status ?? "draft") !== status) return false;
  if (companyId !== "all" && (job.companySlug ?? job.companyId) !== companyId) {
    return false;
  }
  if (query) {
    const haystack = [job.title, job.companySlug, job.city, job.country]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query.toLowerCase())) return false;
  }
  return true;
}

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    closed: 0,
    applicantsTotal: 0,
  });
  const [companies, setCompanies] = useState([]);
  const [companyNameById, setCompanyNameById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [query, setQuery] = useState("");

  const refresh = () => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getRecruiterJobs({ page: 1, pageSize: FETCH_PAGE_SIZE }),
      getRecruiterJobStats(),
      getRecruiterCompanies({ pageSize: 100 }),
    ])
      .then(([jobsData, statsData, companiesData]) => {
        if (cancelled) return;

        const jobList = Array.isArray(jobsData)
          ? jobsData
          : (jobsData?.items ?? []);
        setJobs(jobList.map(normalizeJob));
        setStats(statsData ?? {});

        const companyList = Array.isArray(companiesData)
          ? companiesData
          : (companiesData?.items ?? []);
        const normalized = normalizeCompanies(companyList);
        setCompanies(normalized);
        const lookup = {};
        for (const company of normalized) {
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
  }, [refreshKey]);

  const counts = useMemo(() => {
    const draft = Math.max(
      0,
      (stats.total ?? 0) - (stats.active ?? 0) - (stats.closed ?? 0),
    );
    return {
      all: jobs.length,
      active: jobs.filter((j) => (j.status ?? "draft") === "active").length,
      draft,
      closed: jobs.filter((j) => (j.status ?? "draft") === "closed").length,
    };
  }, [jobs, stats]);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) =>
        jobMatches(job, {
          status: statusFilter,
          companyId: companyFilter,
          query,
        }),
      ),
    [jobs, statusFilter, companyFilter, query],
  );

  const usage = getPlanUsage(stats.active ?? 0);

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
      refresh();
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

    deleteRecruiterJob(jobId)
      .then(() => {
        refresh();
      })
      .catch((error) => {
        console.error("Failed to delete job:", error);
        refresh();
        toast.danger("Delete failed", {
          description: `${job.title} could not be deleted.`,
        });
      });
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setCompanyFilter("all");
    setQuery("");
  };

  const companyOptions = companies.map((c) => ({
    id: getCompanySlug(c),
    name: c.name ?? c.shortName ?? "—",
  }));

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <p className="text-sm text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Manage Jobs
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track and manage every job post from your recruiter dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ButtonLink
              href="/jobs"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white"
            >
              View public board
            </ButtonLink>
            <Button
              variant="primary"
              isDisabled={!usage.hasAvailableSlots}
              onPress={() => router.push("/dashboard/recruiter/jobs/new")}
              className="cursor-pointer"
            >
              <CirclePlus className="size-4" />
              Post New Job
            </Button>
          </div>
        </header>

        <JobsOverview stats={stats} activeJobCount={stats.active ?? 0} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
          <JobsFilters
            counts={counts}
            companies={companyOptions}
            currentStatus={statusFilter}
            currentCompanyId={companyFilter}
            query={query}
            onChangeStatus={setStatusFilter}
            onChangeCompany={setCompanyFilter}
            onChangeQuery={setQuery}
            onReset={resetFilters}
          />

          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <Card className="rounded-2xl border border-dashed border-default bg-content1 p-8 text-center">
                <Typography.Heading
                  className="text-base font-semibold text-white"
                  level={2}
                >
                  No jobs match these filters
                </Typography.Heading>
                <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
                  Try a different status, pick a different company, or clear
                  your search.
                </Typography.Paragraph>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 cursor-pointer rounded-lg border border-white/10 bg-default px-4 py-2 text-sm font-medium text-white transition-colors hover:border-indigo-500/50"
                >
                  Reset filters
                </button>
              </Card>
            ) : (
              <JobsTable
                jobs={filteredJobs}
                companyNameById={companyNameById}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
