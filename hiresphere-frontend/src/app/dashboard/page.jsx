import RecruiterHomeView from "@/components/dashboard/RecruiterHomeView";
import StatCard from "@/components/dashboard/StatCard";
import UpgradePlanButton from "@/components/dashboard/UpgradePlanButton";
import ButtonLink from "@/components/shared/ButtonLink";
import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import { fetchMyApplications } from "@/lib/actions/applications";
import {
  getRecruiterCompanies,
  getRecruiterCompanyStats,
} from "@/lib/actions/company";
import {
  fetchPublicJobById,
  fetchPublicJobs,
  getRecruiterJobs,
  getRecruiterJobStats,
} from "@/lib/actions/jobs";
import { fetchSavedJobs } from "@/lib/actions/saved-jobs";
import { getActiveCount } from "@/lib/api/jobstruture";
import { auth } from "@/lib/auth";
import {
  Bookmark,
  FileText,
  Magnifier,
  MapPin,
  Wallet,
} from "@gravity-ui/icons";
import { Card, Typography } from "@heroui/react";
import { headers } from "next/headers";
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
      safeCall("getRecruiterCompanyStats", { total: 0 }, () =>
        getRecruiterCompanyStats(),
      ),
      safeCall(
        "getRecruiterJobStats",
        { total: 0, active: 0, closed: 0, applicantsTotal: 0 },
        () => getRecruiterJobStats(),
      ),
      safeCall("getRecruiterCompanies", { items: [] }, () =>
        getRecruiterCompanies({ page: 1, pageSize: 4 }),
      ),
      safeCall("getRecruiterJobs", { items: [] }, () =>
        getRecruiterJobs({ page: 1, pageSize: 5 }),
      ),
      safeCall("fetchPublicJobs", { items: [] }, () =>
        fetchPublicJobs({ page: 1, pageSize: 6 }),
      ),
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
  const recentJobs = jobs.map((job) => {
    const id = job._id ?? job.id;
    return {
      id,
      title: job.title ?? "Untitled",
      company: job.companySlug ?? "—",
      status: job.status ?? "draft",
      href: id ? `/dashboard/recruiter/jobs/${id}` : null,
    };
  });

  const companyItems = companies.map((company) => ({
    id: company.slug ?? company.companySlug ?? company._id ?? company.id,
    name: company.name ?? "Unnamed",
    field: company.industry ?? "—",
    location: company.location ?? "—",
    activeJobs: getActiveCount(
      jobs.filter(
        (job) => job.companySlug === (company.companySlug ?? company.id),
      ),
    ),
    initials: getInitials(company.name ?? ""),
  }));

  if (totalCompanies === 0) {
    return (
      <div className="flex-1 px-4 py-8 lg:px-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-(color-foreground)">
              Welcome back, {greeting}
            </h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>
          <UpgradePlanButton role="recruiter" currentPlan={user.plan} />
        </header>

        <Card className="relative mb-8 overflow-hidden rounded-2xl border border-default bg-content1 p-6">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-indigo-500/10 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-indigo-500/0"
          />
          <Typography.Heading
            className="text-lg font-semibold text-(color-foreground)"
            level={2}
          >
            Create your first company
          </Typography.Heading>
          <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
            You need a company profile before you can post jobs.
          </Typography.Paragraph>
          <ButtonLink
            href="/dashboard/mycompany/new"
            className="mt-4 w-fit bg-gradient-to-r from-indigo-500 to-blue-500 font-semibold text-(color-foreground) shadow-lg shadow-indigo-500/20"
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
          currentPlan={user.plan}
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
      currentPlan={user.plan}
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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
  const [applicationsResult, savedResult, publicJobsResult] = await Promise.all(
    [
      fetchMyApplications({ page: 1, pageSize: 3 }),
      fetchSavedJobs({ page: 1, pageSize: 3 }),
      fetchPublicJobs({ page: 1, pageSize: 5 }),
    ],
  );

  const applications = Array.isArray(applicationsResult)
    ? applicationsResult
    : (applicationsResult?.items ?? []);
  const saved = Array.isArray(savedResult)
    ? savedResult
    : (savedResult?.items ?? []);
  const recommended = Array.isArray(publicJobsResult)
    ? publicJobsResult
    : (publicJobsResult?.items ?? []);
  const applicationTotal = Array.isArray(applicationsResult)
    ? applicationsResult.length
    : (applicationsResult?.total ?? applications.length);
  const savedTotal = Array.isArray(savedResult)
    ? savedResult.length
    : (savedResult?.total ?? saved.length);
  const recommendedTotal = Array.isArray(publicJobsResult)
    ? publicJobsResult.length
    : (publicJobsResult?.total ?? recommended.length);

  const enrichedApplications = await enrichJobs(applications);
  const enrichedSaved = await enrichJobs(saved);

  const greeting = user.name ?? "there";
  const seekerStats = [
    {
      key: "applications",
      label: "Applications",
      value: applicationTotal,
      icon: "file",
      tone: "indigo",
    },
    {
      key: "saved",
      label: "Saved Jobs",
      value: savedTotal,
      icon: "bookmark",
      tone: "amber",
    },
    {
      key: "recommended",
      label: "New Matches",
      value: recommendedTotal,
      icon: "magnifier",
      tone: "emerald",
    },
  ];
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-(color-foreground) sm:text-4xl">
            Welcome back, {greeting}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover new roles, track your applications, and revisit the jobs
            you saved.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UpgradePlanButton role="seeker" currentPlan={user.plan} />
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-lg border border-default bg-content1 px-4 py-2 text-sm text-(color-foreground) transition-colors hover:border-indigo-500/50"
          >
            <Magnifier className="size-4" />
            Browse all jobs
          </Link>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {seekerStats.map((stat) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={stat.value.toLocaleString()}
            icon={stat.icon}
            tone={stat.tone}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recommended jobs */}
        <section className="rounded-2xl border border-default bg-content1 p-5 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <Typography.Heading
                className="flex items-center gap-2 text-lg font-semibold text-(color-foreground)"
                level={2}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-500 ring-1 ring-emerald-500/30">
                  <Magnifier className="size-4" />
                </span>
                Recommended for you
              </Typography.Heading>
              <Typography.Paragraph className="text-xs text-muted-foreground">
                Latest open roles on HireSphere
              </Typography.Paragraph>
            </div>
            <Link
              href="/jobs"
              className="text-xs text-indigo-500 transition-colors hover:text-indigo-600"
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
                      className="group relative overflow-hidden block rounded-xl border border-transparent p-3 transition-colors hover:border-indigo-500/30 hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-0">
                        <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />
                      </div>
                      <p className="relative z-10 truncate text-sm font-semibold text-(color-foreground)">
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
                className="flex items-center gap-2 text-lg font-semibold text-(color-foreground)"
                level={2}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-500 ring-1 ring-indigo-500/30">
                  <FileText className="size-4" />
                </span>
                Recent applications
              </Typography.Heading>
              <Typography.Paragraph className="text-xs text-muted-foreground">
                Your last {applications.length} submissions
              </Typography.Paragraph>
            </div>
            <Link
              href="/dashboard/applications"
              className="text-xs text-indigo-500 transition-colors hover:text-indigo-600"
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
                const title =
                  job?.title ?? application.jobTitle ?? "Untitled role";
                const company =
                  job?.companySlug ?? application.companySlug ?? "—";
                const date = formatAppliedDate(application.appliedAt);
                return (
                  <li key={application._id ?? application.jobId}>
                    <Link
                      href={`/jobs/${application.jobId}`}
                      className="group relative overflow-hidden block rounded-xl border border-transparent p-3 transition-colors hover:border-indigo-500/30 hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-0">
                        <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />
                      </div>
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-(color-foreground)">
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
                className="flex items-center gap-2 text-lg font-semibold text-(color-foreground)"
                level={2}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-500 ring-1 ring-amber-500/30">
                  <Bookmark className="size-4" />
                </span>
                Saved jobs
              </Typography.Heading>
              <Typography.Paragraph className="text-xs text-muted-foreground">
                Bookmark roles to revisit
              </Typography.Paragraph>
            </div>
            <Link
              href="/dashboard/saved-jobs"
              className="text-xs text-indigo-500 transition-colors hover:text-indigo-600"
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
                const company = job?.companySlug ?? savedJob.companySlug ?? "—";
                return (
                  <li key={savedJob._id ?? savedJob.jobId}>
                    <Link
                      href={`/jobs/${savedJob.jobId}`}
                      className="group relative overflow-hidden block rounded-xl border border-transparent p-3 transition-colors hover:border-indigo-500/30 hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-0">
                        <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />
                      </div>
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-(color-foreground)">
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
