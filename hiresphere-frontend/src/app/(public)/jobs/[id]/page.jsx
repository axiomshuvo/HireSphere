import {
  JobCategoryBadge,
  JobExperienceBadge,
  JobHiringBadge,
  JobRemoteBadge,
  JobTypeBadge,
  JobWorkplaceBadge,
} from "@/components/jobs/JobBadge";
import ApplyButton from "@/components/public/ApplyButton";
import ApplyInterestCta from "@/components/public/ApplyInterestCta";
import CompanyLogo from "@/components/public/CompanyLogo";
import JobUnavailableNotice from "@/components/public/JobUnavailableNotice";
import SaveJobButton from "@/components/public/SaveJobButton";
import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import { fetchApplicationForJob } from "@/lib/actions/applications";
import { fetchPublicCompanyById } from "@/lib/actions/company";
import { fetchPublicJobById, fetchPublicJobs } from "@/lib/actions/jobs";
import { fetchSavedJobs } from "@/lib/actions/saved-jobs";
import { getCompanySlug } from "@/lib/api/companies";
import { getCurrentUser } from "@/lib/core/session";
import {
  ArrowUpRightFromSquare,
  Briefcase,
  Calendar,
  CircleCheck,
  MapPin,
  Wallet,
} from "@gravity-ui/icons";
import { Avatar, Card, Typography } from "@heroui/react";
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
    <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-6">
      <div className="mb-3 flex items-center gap-2">
        {Icon && (
          <div className="flex size-8 items-center justify-center rounded-lg bg-(color-surface-2) text-indigo-500">
            <Icon className="size-4" />
          </div>
        )}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(color-text-muted)">
          {label}
        </h2>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-(color-text)">
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

  // For a signed-in seeker, ask the server whether they already
  // saved / applied to this job. The DB is the source of truth — the
  // button state is computed from it on every render.
  const user = await getCurrentUser();
  let initialSaved = false;
  let initialApplied = false;
  if (user?.role === "seeker") {
    const [savedResult, appliedResult] = await Promise.all([
      fetchSavedJobs({ pageSize: 100 }).catch(() => ({ items: [] })),
      fetchApplicationForJob(id).catch(() => null),
    ]);
    const savedItems = Array.isArray(savedResult)
      ? savedResult
      : (savedResult?.items ?? []);
    initialSaved = savedItems.some((s) => (s.jobId ?? s._id) === id);
    initialApplied = !!appliedResult;
  }

  if (!isPublicVisible || job.status === "closed") {
    return <JobUnavailableNotice reason={job.closedReason} />;
  }

  const salary = formatSalary(job);
  const location = formatLocation(job);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-8">
      <Link
        href="/jobs"
        className="text-sm text-(color-text-muted) transition-colors hover:text-(color-text)"
      >
        ← Back to jobs
      </Link>

      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-3xl border border-(color-border) bg-[radial-gradient(circle_at_78%_18%,rgba(99,102,241,0.32),transparent_45%),radial-gradient(circle_at_18%_82%,rgba(56,189,248,0.22),transparent_50%),linear-gradient(180deg,#16181c,#0f1013)] p-6 lg:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-indigo-500/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <JobTypeBadge type={job.type} />
              <JobCategoryBadge category={job.category} />
              {job.workplaceType ? (
                <JobWorkplaceBadge type={job.workplaceType} />
              ) : (
                <JobRemoteBadge remote={job.remote} />
              )}
              {job.experienceLevel && (
                <JobExperienceBadge level={job.experienceLevel} />
              )}
              <JobHiringBadge />
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {job.title ?? "Untitled role"}
            </h1>

            {company && (
              <Link
                href={`/company/${getCompanySlug(company)}`}
                className="mt-2 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              >
                <Avatar.Root className="size-5 shrink-0 rounded bg-white/10 text-[10px] font-semibold text-white">
                  <Avatar.Fallback>
                    {(company.name?.[0] ?? "?").toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
                <span>{company.name}</span>
              </Link>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/70">
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
                  {new Date(job.deadline).toLocaleDateString("en-US", {
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
            <ApplyButton
              jobId={id}
              jobTitle={job.title}
              companySlug={job.companySlug ?? job.companyId}
              recruiterId={job.recruiterId ?? null}
              initialApplied={initialApplied}
            />
            <SaveJobButton
              jobId={id}
              title={job.title}
              companySlug={job.companySlug ?? job.companyId}
              recruiterId={job.recruiterId ?? null}
              initialSaved={initialSaved}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-(color-surface-2) px-4 py-2 text-xs text-(color-text-muted) transition-colors hover:border-indigo-500/50 hover:text-(color-text)"
              >
                <ArrowUpRightFromSquare className="size-3.5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Body grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          {job.description && (
            <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-6">
              <h2 className="mb-4 text-lg font-semibold text-(color-text)">
                Role Overview
              </h2>
              <div
                className="prose prose-invert max-w-none text-sm leading-relaxed text-(color-text-muted)"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </Card>
          )}

          <LongBlock
            label="Responsibilities"
            value={job.responsibilities}
            icon={CircleCheck}
          />
          <LongBlock
            label="Requirements"
            value={job.requirements}
            icon={CircleCheck}
          />
          <LongBlock label="Benefits" value={job.benefits} icon={CircleCheck} />

          {job.skills?.length > 0 && (
            <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-6">
              <h2 className="mb-4 text-lg font-semibold text-(color-text)">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => {
                  const s = skill.trim();
                  if (!s) return null;
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-500 border border-indigo-500/20"
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {company && (
            <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-5">
              <Typography.Heading
                className="mb-3 text-xs font-semibold uppercase tracking-wider text-(color-text-muted)"
                level={2}
              >
                Hiring Company
              </Typography.Heading>
              <div className="flex items-center gap-3">
                <CompanyLogo
                  logo={company.logo}
                  name={company.name}
                  size="size-12"
                  text="text-base"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-(color-text)">
                    {company.name}
                  </p>
                  {company.industry && (
                    <p className="truncate text-xs text-(color-text-muted)">
                      {company.industry}
                    </p>
                  )}
                </div>
              </div>
              {company.tagline && (
                <p className="mt-3 text-sm text-(color-text-muted)">
                  {company.tagline}
                </p>
              )}
              <Link
                href={`/company/${getCompanySlug(company)}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-(color-surface-2) px-4 py-2 text-sm text-(color-text) transition-colors hover:border-indigo-500/50"
              >
                <Briefcase className="size-4" />
                View company
              </Link>
            </Card>
          )}

          <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-5">
            <Typography.Heading
              className="mb-3 text-xs font-semibold uppercase tracking-wider text-(color-text-muted)"
              level={2}
            >
              Quick Info
            </Typography.Heading>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-(color-text-muted)">Type</dt>
                <dd className="font-medium text-(color-text)">
                  <JobTypeBadge type={job.type} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-(color-text-muted)">Category</dt>
                <dd className="font-medium text-(color-text)">
                  <JobCategoryBadge category={job.category} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-(color-text-muted)">Work mode</dt>
                <dd className="font-medium text-(color-text)">
                  {job.workplaceType
                    ? job.workplaceType
                    : job.remote
                      ? "Remote"
                      : "On-site / Hybrid"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-(color-text-muted)">Location</dt>
                <dd className="font-medium text-(color-text)">
                  {location ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-(color-text-muted)">Salary</dt>
                <dd className="font-medium text-(color-text)">
                  {salary ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-(color-text-muted)">Visibility</dt>
                <dd className="font-medium text-(color-text)">
                  {job.isPublicVisible ? "Public" : "Private"}
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>

      {/* Bottom CTA */}
      <ApplyInterestCta
        jobId={id}
        jobTitle={job.title}
        companySlug={job.companySlug ?? job.companyId}
        recruiterId={job.recruiterId ?? null}
        initialApplied={initialApplied}
      />

      <span className="sr-only">{job.title}</span>
    </div>
  );
}
