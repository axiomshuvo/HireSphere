import { headers } from "next/headers";
import { Card, Typography } from "@heroui/react";
import { auth } from "@/lib/auth";
import {
  getRecruiterCompanies,
  getRecruiterCompanyStats,
} from "@/lib/actions/company";
import {
  getRecruiterJobs,
  getRecruiterJobStats,
  fetchPublicJobs,
} from "@/lib/actions/jobs";
import { fetchMyApplications } from "@/lib/actions/applications";
import { fetchSavedJobs } from "@/lib/actions/saved-jobs";
import { fetchPublicJobById } from "@/lib/actions/jobs";
import { getActiveCount } from "@/lib/api/jobstruture";
import ButtonLink from "@/components/shared/ButtonLink";
import RecruiterHomeView from "@/components/dashboard/RecruiterHomeView";
import MarketJobsPanel from "@/components/dashboard/MarketJobsPanel";
import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import {
  Bookmark,
  FileText,
  Magnifier,
  MapPin,
  Wallet,
} from "@gravity-ui/icons";
import Link from "next/link";

function getInitials(name) {
  const parts = name?.trim().split(/\s+/) ?? [];
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "U";
}

function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

async function safeCall(label, fallback, fn) {
  try {
    return await fn();
  } catch (error) {
    console.warn(`[RecruiterHome] ${label} failed:`, error?.message ?? error);
    return fallback;
  }
}

async function RecruiterHome({ user }) {
  const [companyStats, jobStats, companiesPage, jobsPage, marketJobsPage] =
    await Promise.all([
      safeCall("getRecruiterCompanyStats", { total: 0 }, () => getRecruiterCompanyStats()),
      safeCall("getRecruiterJobStats", { total: 0, active: 0, closed: 0, applicantsTotal: 0 }, () => getRecruiterJobStats()),
      safeCall("getRecruiterCompanies", { items: [] }, () => getRecruiterCompanies({ page: 1, pageSize: 4 })),
      safeCall("getRecruiterJobs", { items: [] }, () => getRecruiterJobs({ page: 1, pageSize: 5 })),
      safeCall("fetchPublicJobs", { items: [] }, () => fetchPublicJobs({ page: 1, pageSize: 6 })),
    ]);

  const companies = extractItems(companiesPage);
  const jobs = extractItems(jobsPage);
  const marketJobs = extractItems(marketJobsPage).slice(0, 6);

  const totalJobs = jobStats?.total ?? jobs.length;
  const activeJobs = jobStats?.active ?? getActiveCount(jobs);
  const closedJobs = jobStats?.closed ?? Math.max(totalJobs - activeJobs, 0);
  const totalApplicants = jobStats?.applicantsTotal ?? 0;
  const totalCompanies = companyStats?.total ?? companies.length;

  const greeting = user.name ?? "there";
  const subtitle =
    totalCompanies === 0
      ? "Get started by creating your first company."
      : `Managing ${totalCompanies} ${totalCompanies === 1 ? "company" : "companies"} and ${activeJobs} active ${activeJobs === 1 ? "job" : "jobs"}.`;

  const recentJobsColumns = [
    { key: "title", label: "Title" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
  ];
  const recentJobs = jobs.map((job) => ({
    id: job._id ?? job.id,
    title: job.title ?? "Untitled",
    company: job.companySlug ?? "—",
    status: job.status ?? "draft",
  }));

  const companyItems = companies.map((company) => ({
    name: company.name ?? "Unnamed",
    field: company.industry ?? "—",
    location: company.location ?? "—",
    activeJobs: getActiveCount(
      jobs.filter((job) => job.companySlug === (company.companySlug ?? company.id)),
    ),
    initials: getInitials(company.name ?? ""),
  }));

  if (totalCompanies === 0) {
    return (
      <div className="flex-1 px-4 py-8 lg:px-8">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">
          Welcome back, {greeting}
        </h1>
        <p className="mb-8 text-muted-foreground">{subtitle}</p>

        <Card className="mb-8 rounded-2xl border border-default bg-content1 p-6">
          <Typography.Heading className="text-lg font-semibold text-white" level={2}>
            Create your first company
          </Typography.Heading>
          <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
            You need a company profile before you can post jobs.
          </Typography.Paragraph>
          <ButtonLink
            href="/dashboard/mycompany/new"
            className="mt-4 w-fit"
          >
            Add Company
          </ButtonLink>
        </Card>

        <RecruiterHomeView
          greeting={greeting}
          subtitle={`Once you create a company you'll see your active jobs and applications here.`}
          totalJobs={totalJobs}
          totalApplicants={totalApplicants}
          activeJobs={activeJobs}
          closedJobs={closedJobs}
          recentJobs={recentJobs}
          recentJobsColumns={recentJobsColumns}
          companyItems={companyItems}
          marketJobs={marketJobs}
        />
      </div>
    );
  }

  return (
    <RecruiterHomeView
      greeting={greeting}
      subtitle={subtitle}
      totalJobs={totalJobs}
      totalApplicants={totalApplicants}
      activeJobs={activeJobs}
      closedJobs={closedJobs}
      recentJobs={recentJobs}
      recentJobsColumns={recentJobsColumns}
      companyItems={companyItems}
      marketJobs={marketJobs}
    />
  );
}

function formatLocation(job) {
  if (job?.remote) return "Remote";
  const parts = [job?.city, job?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function formatSalary(job) {
  if (!job?.salaryMin || !job?.salaryMax) return null;
  return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
}

function formatAppliedDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

async function enrichJobs(apps) {
  return Promise.all(
    apps.map(async (application) => {
      let job = null;
      try {
        job = await fetchPublicJobById(application.jobId);
      } catch {
        job = null;
      }
      return { application, job };
    }),
  );
}

async function SeekerHome({ user }) {
  const [applicationsResult, savedResult, publicJobsResult] = await Promise.all([
    fetchMyApplications({ page: 1, pageSize: 3 }),
    fetchSavedJobs({ page: 1, pageSize: 3 }),
    fetchPublicJobs({ page: 1, pageSize: 5 }),
  ]);

  const applications = Array.isArray(applicationsResult)
    ? applicationsResult
    : (applicationsResult?.items ?? []);
  const saved = Array.isArray(savedResult) ? savedResult : (savedResult?.items ?? []);
  const recommended = Array.isArray(publicJobsResult)
    ? publicJobsResult
    : (publicJobsResult?.items ?? []);

  const enrichedApplications = await enrichJobs(applications);
  const enrichedSaved = await enrichJobs(saved);

  const greeting = user.name ?? "there";
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Welcome back, {greeting}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover new roles, track your applications, and revisit the jobs
            you saved.
          </p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-lg border border-default bg-content1 px-4 py-2 text-sm text-white transition-colors hover:border-indigo-500/50"
        >
          <Magnifier className="size-4" />
          Browse all jobs
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recommended jobs */}
        <section className="rounded-2xl border border-default bg-content1 p-5 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <Typography.Heading
                className="flex items-center gap-2 text-lg font-semibold text-white"
                level={2}
              >
                <Magnifier className="size-4 text-indigo-300" />
                Recommended for you
              </Typography.Heading>
              <Typography.Paragraph className="text-xs text-muted-foreground">
                Latest open roles on HireSphere
              </Typography.Paragraph>
            </div>
            <Link
              href="/jobs"
              className="text-xs text-indigo-300 transition-colors hover:text-indigo-200"
            >
              View all →
            </Link>
          </div>

          {recommended.length === 0 ? (
            <p className="rounded-xl border border-dashed border-default bg-content1/50 px-4 py-8 text-center text-sm text-muted-foreground">
              No roles posted yet. Check back soon.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recommended.slice(0, 5).map((job) => {
                const salary = formatSalary(job);
                const location = formatLocation(job);
                return (
                  <li key={job._id ?? job.id}>
                    <Link
                      href={`/jobs/${job._id ?? job.id}`}
                      className="block rounded-xl border border-transparent p-3 transition-colors hover:border-default hover:bg-[#1b1c1e]"
                    >
                      <p className="truncate text-sm font-semibold text-white">
                        {job.title ?? "Untitled role"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {job.companySlug ?? "—"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        {location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-2.5" />
                            {location}
                          </span>
                        )}
                        {salary && (
                          <span className="inline-flex items-center gap-1">
                            <Wallet className="size-2.5" />
                            {salary}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Recent applications */}
        <section className="rounded-2xl border border-default bg-content1 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <Typography.Heading
                className="flex items-center gap-2 text-lg font-semibold text-white"
                level={2}
              >
                <FileText className="size-4 text-indigo-300" />
                Recent applications
              </Typography.Heading>
              <Typography.Paragraph className="text-xs text-muted-foreground">
                Your last {applications.length} submissions
              </Typography.Paragraph>
            </div>
            <Link
              href="/dashboard/applications"
              className="text-xs text-indigo-300 transition-colors hover:text-indigo-200"
            >
              View all →
            </Link>
          </div>

          {enrichedApplications.length === 0 ? (
            <p className="rounded-xl border border-dashed border-default bg-content1/50 px-4 py-8 text-center text-sm text-muted-foreground">
              You haven&apos;t applied to any roles yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {enrichedApplications.map(({ application, job }) => {
                const title = job?.title ?? application.jobTitle ?? "Untitled role";
                const company =
                  job?.companySlug ?? application.companySlug ?? "—";
                const date = formatAppliedDate(application.appliedAt);
                return (
                  <li key={application._id ?? application.jobId}>
                    <Link
                      href={`/jobs/${application.jobId}`}
                      className="block rounded-xl border border-transparent p-3 transition-colors hover:border-default hover:bg-[#1b1c1e]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {title}
                        </p>
                        {date && (
                          <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {date}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {company}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Saved jobs */}
        <section className="rounded-2xl border border-default bg-content1 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <Typography.Heading
                className="flex items-center gap-2 text-lg font-semibold text-white"
                level={2}
              >
                <Bookmark className="size-4 text-indigo-300" />
                Saved jobs
              </Typography.Heading>
              <Typography.Paragraph className="text-xs text-muted-foreground">
                Bookmark roles to revisit
              </Typography.Paragraph>
            </div>
            <Link
              href="/dashboard/saved-jobs"
              className="text-xs text-indigo-300 transition-colors hover:text-indigo-200"
            >
              View all →
            </Link>
          </div>

          {enrichedSaved.length === 0 ? (
            <p className="rounded-xl border border-dashed border-default bg-content1/50 px-4 py-8 text-center text-sm text-muted-foreground">
              No saved jobs yet. Hit Save on any role to bookmark it.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {enrichedSaved.map(({ application: savedJob, job }) => {
                const title = job?.title ?? savedJob.title ?? "Untitled role";
                const company =
                  job?.companySlug ?? savedJob.companySlug ?? "—";
                return (
                  <li key={savedJob._id ?? savedJob.jobId}>
                    <Link
                      href={`/jobs/${savedJob.jobId}`}
                      className="block rounded-xl border border-transparent p-3 transition-colors hover:border-default hover:bg-[#1b1c1e]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {title}
                        </p>
                        <DeadlineCountdown
                          deadline={job?.deadline}
                          className="shrink-0"
                        />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {company}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) return null;

  if (user.role === "recruiter") {
    return <RecruiterHome user={user} />;
  }
  return <SeekerHome user={user} />;
}
