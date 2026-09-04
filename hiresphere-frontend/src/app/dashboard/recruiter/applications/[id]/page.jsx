import { fetchApplicantById } from "@/lib/actions/applications";
import { fetchPublicJobById } from "@/lib/actions/jobs";
import {
  ArrowLeft,
  Calendar,
  Envelope,
  FileText,
  MapPin,
  Smartphone,
  Wallet,
} from "@gravity-ui/icons";
import { Card, Chip, Typography } from "@heroui/react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const statusColors = {
  submitted: "primary",
  reviewed: "warning",
  interviewing: "success",
  offered: "success",
  rejected: "danger",
  withdrawn: "default",
};

function formatDate(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not provided"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 border-b border-default py-4 last:border-b-0">
      <Icon className="mt-0.5 size-4 shrink-0 text-indigo-500" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 break-words text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

export default async function RecruiterApplicationDetailPage({ params }) {
  const { id } = await params;
  const application = await fetchApplicantById(id);
  if (!application) notFound();

  let job = null;
  try {
    job = await fetchPublicJobById(application.jobId);
  } catch {
    job = null;
  }

  const initials = (application.name || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const status = application.status ?? "submitted";
  const statusLabel = status[0].toUpperCase() + status.slice(1);

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <Link
        href="/dashboard/recruiter/applications"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to applicants
      </Link>

      <header className="mt-6 flex flex-col gap-5 border-b border-default pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-lg font-semibold text-indigo-200 ring-1 ring-indigo-500/30">
            {initials || "?"}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
              Candidate application
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              {application.name || "Unnamed candidate"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {job?.title ?? application.jobTitle ?? "Untitled role"}
              {application.companySlug ? ` · ${application.companySlug}` : ""}
            </p>
          </div>
        </div>
        <Chip
          color={statusColors[status] ?? "default"}
          size="sm"
          variant="soft"
        >
          {statusLabel}
        </Chip>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border border-default bg-content1 p-5">
            <Typography.Heading
              level={2}
              className="text-lg font-semibold text-foreground"
            >
              Submission
            </Typography.Heading>
            <div className="mt-2">
              <Detail icon={Envelope} label="Email">
                <a
                  href={`mailto:${application.email}`}
                  className="text-indigo-500 hover:text-indigo-600"
                >
                  {application.email || "Not provided"}
                </a>
              </Detail>
              <Detail icon={Smartphone} label="Phone">
                {application.phone || "Not provided"}
              </Detail>
              <Detail icon={Calendar} label="Applied">
                {formatDate(application.appliedAt)}
              </Detail>
              <Detail icon={Wallet} label="Expected salary">
                {application.expectedSalary
                  ? `$${Number(application.expectedSalary).toLocaleString()}`
                  : "Not provided"}
              </Detail>
            </div>
          </Card>

          <Card className="rounded-2xl border border-default bg-content1 p-5">
            <Typography.Heading
              level={2}
              className="text-lg font-semibold text-foreground"
            >
              Cover letter
            </Typography.Heading>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {application.coverLetter || "No cover letter was submitted."}
            </p>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card className="rounded-2xl border border-default bg-content1 p-5">
            <Typography.Heading
              level={2}
              className="text-lg font-semibold text-foreground"
            >
              Application files
            </Typography.Heading>
            {application.resumeUrl ? (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
              >
                <FileText className="size-4" />
                Open resume
              </a>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No resume link was submitted.
              </p>
            )}
          </Card>

          <Card className="rounded-2xl border border-default bg-content1 p-5">
            <Typography.Heading
              level={2}
              className="text-lg font-semibold text-foreground"
            >
              Role details
            </Typography.Heading>
            <div className="mt-2">
              <Detail icon={FileText} label="Position">
                {job?.title ?? application.jobTitle ?? "Untitled role"}
              </Detail>
              <Detail icon={MapPin} label="Company">
                {job?.companySlug ?? application.companySlug ?? "Not provided"}
              </Detail>
              <Detail icon={FileText} label="Job ID">
                {application.jobId}
              </Detail>
            </div>
            {job && (
              <Link
                href={`/jobs/${application.jobId}`}
                className="mt-4 inline-flex text-sm text-indigo-500 hover:text-indigo-600"
              >
                View public job →
              </Link>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
