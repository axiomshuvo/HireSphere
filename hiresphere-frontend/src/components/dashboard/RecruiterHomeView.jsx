"use client";

import {
  FaceSmile,
  FileText,
  Persons,
  Thunderbolt,
} from "@gravity-ui/icons";
import CompanyList from "@/components/dashboard/CompanyList";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";

const ICONS = {
  jobs: FileText,
  applicants: Persons,
  active: Thunderbolt,
  closed: FaceSmile,
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
}) {
  const stats = [
    { key: "jobs", label: "Total Job Posts", value: String(totalJobs), icon: ICONS.jobs },
    { key: "applicants", label: "Total Applicants", value: totalApplicants.toLocaleString(), icon: ICONS.applicants },
    { key: "active", label: "Active Jobs", value: String(activeJobs), icon: ICONS.active },
    { key: "closed", label: "Jobs Closed", value: String(closedJobs), icon: ICONS.closed },
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
    </div>
  );
}
