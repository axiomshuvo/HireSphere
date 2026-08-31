"use client";

import CompanyList from "@/components/dashboard/CompanyList";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import MarketJobsPanel from "@/components/dashboard/MarketJobsPanel";

const ICONS = {
  jobs: "file",
  applicants: "persons",
  active: "lightning",
  closed: "smile",
};

export default function RecruiterHomeView({
  greeting,
  subtitle,
  totalJobs,
  totalApplicants,
  activeJobs,
  closedJobs,
  recentJobs,
  recentJobsColumns,
  companyItems,
  marketJobs = [],
}) {
  const stats = [
    {
      key: "jobs",
      label: "Total Job Posts",
      value: String(totalJobs),
      icon: ICONS.jobs,
      tone: "indigo",
    },
    {
      key: "applicants",
      label: "Total Applicants",
      value: totalApplicants.toLocaleString(),
      icon: ICONS.applicants,
      tone: "emerald",
    },
    {
      key: "active",
      label: "Active Jobs",
      value: String(activeJobs),
      icon: ICONS.active,
      tone: "amber",
    },
    {
      key: "closed",
      label: "Jobs Closed",
      value: String(closedJobs),
      icon: ICONS.closed,
      tone: "rose",
    },
  ];

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">
        Welcome back, {greeting}
      </h1>
      <p className="mb-8 text-muted-foreground">{subtitle}</p>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            tone={stat.tone}
          />
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <DataTable
          title="Recent Job Posts"
          columns={recentJobsColumns}
          rows={recentJobs}
          viewAllLabel="View all jobs"
        />

        <CompanyList title="My Companies" companies={companyItems} />
      </section>

      {marketJobs.length > 0 && (
        <section className="mt-8">
          <MarketJobsPanel jobs={marketJobs} />
        </section>
      )}
    </div>
  );
}
