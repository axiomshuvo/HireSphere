import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import { fetchPublicCompanyById } from "@/lib/actions/company";
import { fetchPublicJobById, fetchPublicJobs } from "@/lib/actions/jobs";
import {
  ArrowRight,
  ArrowUpRightFromSquare,
  Briefcase,
  Calendar,
  CircleCheckFill,
  Clock,
  Globe,
  MapPin,
  Wallet,
} from "@gravity-ui/icons";
import { Avatar, Card, Chip, Typography } from "@heroui/react";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatSalary(job) {
  if (!job.salaryMin || !job.salaryMax) return null;
  return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
}

function formatLocation(job) {
  if (job.remote) return "Remote";
  const parts = [job.city, job.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function LongBlock({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-6">
      <div className="mb-3 flex items-center gap-2">
        {Icon && (
          <div className="flex size-8 items-center justify-center rounded-lg bg-default text-indigo-300">
            <Icon className="size-4" />
          </div>
        )}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h2>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-white">
        {value}
      </p>
    </Card>
  );
}

export default async function PublicJobDetailPage({ params }) {
  const { id } = await params;
  let job;

  try {
    job = await fetchPublicJobById(id);
  } catch (detailError) {
    console.warn(
      `[PublicJobDetailPage] /api/jobs/${id} failed, falling back to list lookup:`,
      detailError?.message ?? detailError,
    );
  }

  if (!job) {
    try {
      const list = await fetchPublicJobs({ pageSize: 100 });
      const items = Array.isArray(list) ? list : (list?.items ?? []);
      job = items.find((j) => j._id === id || j.id === id) ?? null;
    } catch (listError) {
      console.error(
        `[PublicJobDetailPage] List fallback failed for "${id}":`,
        listError,
      );
    }
  }

  if (!job) notFound();

  const isPublicVisible = job.isPublicVisible !== false;
  const companySlug = job.companySlug ?? job.companyId ?? null;
  let company = null;
  if (companySlug) {
    try {
      company = await fetchPublicCompanyById(companySlug);
    } catch {
      company = null;
    }
  }

  if (!isPublicVisible) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 lg:px-8">
        <Link
          href="/jobs"
          className="text-sm text-muted-foreground transition-colors hover:text-white"
        >
          ← Back to jobs
        </Link>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold text-white">
            This role is no longer accepting public applications
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            The company has made this job private. Browse other open roles on
            HireSphere.
          </p>
          <Link
            href="/jobs"
            className="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  const salary = formatSalary(job);
  const location = formatLocation(job);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-8">
      <Link
        href="/jobs"
        className="text-sm text-muted-foreground transition-colors hover:text-white"
      >
        ← Back to jobs
      </Link>

      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-3xl border border-default bg-[radial-gradient(circle_at_78%_18%,rgba(99,102,241,0.32),transparent_45%),radial-gradient(circle_at_18%_82%,rgba(56,189,248,0.22),transparent_50%),linear-gradient(180deg,#16181c,#0f1013)] p-6 lg:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-indigo-500/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {job.type && (
                <Chip color="primary" size="sm" variant="soft">
                  {job.type}
                </Chip>
              )}
              {job.category && (
                <Chip color="default" size="sm" variant="soft">
                  {job.category}
                </Chip>
              )}
              <Chip color="success" size="sm" variant="soft">
                <CircleCheckFill className="size-3" />
                Actively hiring
              </Chip>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {job.title ?? "Untitled role"}
            </h1>

            {company && (
              <Link
                href={`/company/${company.companySlug ?? company.id}`}
                className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white"
              >
                <Avatar.Root className="size-5 shrink-0 rounded bg-default text-[10px] font-semibold text-default-foreground">
                  <Avatar.Fallback>
                    {(company.name?.[0] ?? "?").toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
                <span>{company.name}</span>
              </Link>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3" />
                  {location}
                </span>
              )}
              {salary && (
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="size-3" />
                  {salary}
                </span>
              )}
              {job.deadline && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3" />
                  Closes{" "}
                  {new Date(job.deadline).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            <div className="mt-4">
              <DeadlineCountdown deadline={job.deadline} />
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 lg:items-end">
            <button
              type="button"
              disabled
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black/60 lg:w-auto"
            >
              Apply (coming soon)
              <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1b1c1e] px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-indigo-500/50 hover:text-white"
            >
              <ArrowUpRightFromSquare className="size-3.5" />
              Share
            </button>
          </div>
        </div>
      </section>

      {/* Body grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          <LongBlock
            label="Responsibilities"
            value={job.responsibilities}
            icon={CircleCheckFill}
          />
          <LongBlock
            label="Requirements"
            value={job.requirements}
            icon={CircleCheckFill}
          />
          <LongBlock
            label="Benefits"
            value={job.benefits}
            icon={CircleCheckFill}
          />
        </div>

        <aside className="flex flex-col gap-4">
          {company && (
            <Card className="rounded-2xl border border-default bg-content1 p-5">
              <Typography.Heading
                className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                level={2}
              >
                Hiring Company
              </Typography.Heading>
              <div className="flex items-center gap-3">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="size-12 shrink-0 rounded-xl border border-default object-cover"
                  />
                ) : (
                  <Avatar.Root className="size-12 shrink-0 rounded-xl bg-default text-base font-semibold text-default-foreground">
                    <Avatar.Fallback>
                      {(company.name?.[0] ?? "?").toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {company.name}
                  </p>
                  {company.industry && (
                    <p className="truncate text-xs text-muted-foreground">
                      {company.industry}
                    </p>
                  )}
                </div>
              </div>
              {company.tagline && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {company.tagline}
                </p>
              )}
              <Link
                href={`/company/${company.companySlug ?? company.id}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1b1c1e] px-4 py-2 text-sm text-white transition-colors hover:border-indigo-500/50"
              >
                <Briefcase className="size-4" />
                View company
              </Link>
            </Card>
          )}

          <Card className="rounded-2xl border border-default bg-content1 p-5">
            <Typography.Heading
              className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              level={2}
            >
              Quick Info
            </Typography.Heading>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium text-white">{job.type ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium text-white">{job.category ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Work mode</dt>
                <dd className="font-medium text-white">
                  {job.remote ? "Fully remote" : "On-site / Hybrid"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-medium text-white">{location ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Salary</dt>
                <dd className="font-medium text-white">{salary ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Visibility</dt>
                <dd className="font-medium text-white">
                  {job.isPublicVisible ? "Public" : "Private"}
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>

      {/* Bottom CTA */}
      <Card className="mt-8 rounded-2xl border border-default bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.18),transparent_60%),linear-gradient(180deg,#16181c,#0f1013)] p-6 text-center">
        <Clock className="mx-auto size-8 text-indigo-300" />
        <h2 className="mt-3 text-xl font-semibold text-white">
          Interested in this role?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Applications open soon. Save this job and check back.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-xl bg-white/50 px-5 py-2.5 text-sm font-semibold text-black/50"
          >
            <Globe className="size-4" />
            Apply (coming soon)
          </button>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#1b1c1e] px-5 py-2.5 text-sm text-white transition-colors hover:border-indigo-500/50"
          >
            Browse more roles
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Card>

      <span className="sr-only">{job.title}</span>
    </div>
  );
}
