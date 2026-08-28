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
} from "@/lib/actions/jobs";
import { getActiveCount } from "@/lib/api/jobstruture";
import ButtonLink from "@/components/shared/ButtonLink";
import RecruiterHomeView from "@/components/dashboard/RecruiterHomeView";

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
  const [companyStats, jobStats, companiesPage, jobsPage] = await Promise.all([
    safeCall("getRecruiterCompanyStats", { total: 0 }, () => getRecruiterCompanyStats()),
    safeCall("getRecruiterJobStats", { total: 0, active: 0, closed: 0, applicantsTotal: 0 }, () => getRecruiterJobStats()),
    safeCall("getRecruiterCompanies", { items: [] }, () => getRecruiterCompanies({ page: 1, pageSize: 4 })),
    safeCall("getRecruiterJobs", { items: [] }, () => getRecruiterJobs({ page: 1, pageSize: 5 })),
  ]);

  const companies = extractItems(companiesPage);
  const jobs = extractItems(jobsPage);

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
    />
  );
}

function SeekerHome({ user }) {
  const greeting = user.name ?? "there";
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">
        Welcome back, {greeting}
      </h1>
      <p className="mb-8 text-muted-foreground">
        Browse open roles and track your applications.
      </p>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border border-default bg-content1 p-6">
          <Typography.Heading className="text-lg font-semibold text-white" level={2}>
            Browse Jobs
          </Typography.Heading>
          <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
            See open roles from companies on HireSphere.
          </Typography.Paragraph>
          <ButtonLink href="/jobs" className="mt-4 w-fit">
            Explore Jobs
          </ButtonLink>
        </Card>

        <Card className="rounded-2xl border border-default bg-content1 p-6">
          <Typography.Heading className="text-lg font-semibold text-white" level={2}>
            My Applications
          </Typography.Heading>
          <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
            Track the status of every role you&apos;ve applied to.
          </Typography.Paragraph>
          <ButtonLink
            href="/dashboard/applications"
            variant="secondary"
            className="mt-4 w-fit"
          >
            View Applications
          </ButtonLink>
        </Card>
      </section>
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
