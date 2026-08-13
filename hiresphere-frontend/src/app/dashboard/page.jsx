"use client";

import CompanyList from "@/components/dashboard/CompanyList";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import { FaceSmile, FileText, Persons, Thunderbolt } from "@gravity-ui/icons";
import { Chip, Typography } from "@heroui/react";

const stats = [
  { label: "Total Job Posts", value: "48", icon: FileText },
  { label: "Total Applicants", value: "1,284", icon: Persons },
  { label: "Active Jobs", value: "18", icon: Thunderbolt },
  { label: "Jobs Closed", value: "32", icon: FaceSmile },
];

const applicationColumns = [
  { key: "name", label: "Candidate Name" },
  { key: "role", label: "Role" },
  { key: "date", label: "Date Applied" },
  { key: "experience", label: "Experience" },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <Chip color={row.statusColor} size="sm" variant="soft">
        {row.status}
      </Chip>
    ),
  },
];

const applications = [
  {
    id: "julianne-moore",
    name: "Julianne Moore",
    role: "Senior Product Designer",
    date: "Oct 24, 2023",
    experience: "6 years",
    status: "Interviewing",
    statusColor: "success",
  },
  {
    id: "robert-downey",
    name: "Robert Downey",
    role: "Backend Engineer",
    date: "Oct 23, 2023",
    experience: "4 years",
    status: "New",
    statusColor: "default",
  },
  {
    id: "emma-stone",
    name: "Emma Stone",
    role: "Marketing Lead",
    date: "Oct 22, 2023",
    experience: "8 years",
    status: "Reviewing",
    statusColor: "warning",
  },
  {
    id: "chris-pratt",
    name: "Chris Pratt",
    role: "Product Manager",
    date: "Oct 21, 2023",
    experience: "5 years",
    status: "Rejected",
    statusColor: "danger",
  },
];

const companies = [
  {
    name: "Google Inc.",
    field: "Technology",
    location: "Mountain View",
    activeJobs: 24,
    initials: "G",
  },
  {
    name: "Meta Platforms",
    field: "Social Media",
    location: "Menlo Park",
    activeJobs: 18,
    initials: "M",
  },
  {
    name: "Stripe",
    field: "Fintech",
    location: "San Francisco",
    activeJobs: 12,
    initials: "S",
  },
  {
    name: "Tesla",
    field: "Automotive",
    location: "Austin",
    activeJobs: 31,
    initials: "T",
  },
];

export default function DashBoard() {
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <Typography.Heading
        className="mb-8 text-3xl font-semibold tracking-tight text-white"
        level={1}
      >
        Welcome back, Alex Sterling
      </Typography.Heading>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <DataTable
          title="Recent Applications"
          columns={applicationColumns}
          rows={applications}
        />

        <CompanyList title="My Top Companies" companies={companies} />
      </section>
    </div>
  );
}
