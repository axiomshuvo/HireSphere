import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import {
  fetchPublicCompanies,
  fetchPublicCompanyById,
} from "@/lib/actions/company";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Globe,
  Link as LinkIcon,
  LogoLinkedin,
  MapPin,
  Persons,
  Wallet,
} from "@gravity-ui/icons";
import { Avatar, Card, Chip, Typography } from "@heroui/react";
import Link from "next/link";
import { notFound } from "next/navigation";

function getInitials(name) {
  const parts = name?.trim().split(/\s+/) ?? [];
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "U";
}

function formatSalary(job) {
  if (!job.salaryMin || !job.salaryMax) return null;
  return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
}

function formatLocation(job) {
  if (job.remote) return "Remote";
  const parts = [job.city, job.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export default async function PublicCompanyPage({ params }) {
  const { id } = await params;
  let company;

  try {
    company = await fetchPublicCompanyById(id);
  } catch (detailError) {
    console.warn(
      `[PublicCompanyPage] /api/companies/${id} failed, falling back to list lookup:`,
      detailError?.message ?? detailError,
    );
  }

  if (!company) {
    try {
      const list = await fetchPublicCompanies({ pageSize: 100 });
      const items = Array.isArray(list) ? list : (list?.items ?? []);
      company =
        items.find(
          (c) => c.companySlug === id || c.id === id || c._id === id,
        ) ?? null;
    } catch (listError) {
      console.error(
        `[PublicCompanyPage] List fallback failed for "${id}":`,
        listError,
      );
    }
  }

  if (!company) notFound();

  const activeJobs = Array.isArray(company.activeJobs)
    ? company.activeJobs
    : [];
  const initials = getInitials(company.name ?? "");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 lg:px-8">
      <Link
        href="/company"
        className="text-sm text-(color-text-muted) transition-colors hover:text-(color-text)"
      >
        ← Back to companies
      </Link>

      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-3xl border border-(color-border) bg-[radial-gradient(circle_at_78%_18%,rgba(99,102,241,0.32),transparent_45%),radial-gradient(circle_at_18%_82%,rgba(56,189,248,0.22),transparent_50%),linear-gradient(180deg,#16181c,#0f1013)] p-6 lg:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-indigo-500/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="size-24 shrink-0 rounded-2xl border border-(color-border) object-cover"
            />
          ) : (
            <Avatar.Root className="size-24 shrink-0 rounded-2xl bg-(color-surface-2) text-3xl font-semibold text-(color-text)">
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            </Avatar.Root>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {company.plan && company.plan !== "free" && (
                <Chip color="primary" size="sm" variant="soft">
                  {company.plan}
                </Chip>
              )}
              {company.isApproved && (
                <Chip color="success" size="sm" variant="soft">
                  Verified
                </Chip>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(color-border) bg-(color-surface-2) px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-(color-text)">
                <Briefcase className="size-3" />
                {activeJobs.length} open{" "}
                {activeJobs.length === 1 ? "role" : "roles"}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text) sm:text-4xl">
              {company.name ?? "Unnamed company"}
            </h1>
            {company.tagline && (
              <p className="mt-1.5 text-base text-(color-text-muted)">
                {company.tagline}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(color-text-muted)">
              {company.industry && <span>{company.industry}</span>}
              {company.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3" />
                  {company.location}
                </span>
              )}
              {company.employeeCount && (
                <span className="inline-flex items-center gap-1.5">
                  <Persons className="size-3" />
                  {company.employeeCount}
                </span>
              )}
              {company.foundedYear && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3" />
                  Founded {company.foundedYear}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-white/10"
                >
                  <Globe className="size-3.5" />
                  Website
                </a>
              )}
              {company.linkedinUrl && (
                <a
                  href={company.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-indigo-500 transition-colors hover:bg-white/10 hover:text-indigo-500"
                >
                  <LogoLinkedin className="size-3.5" />
                  LinkedIn
                </a>
              )}
              {company.twitterUrl && (
                <a
                  href={company.twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-sky-400 transition-colors hover:bg-white/10 hover:text-sky-300"
                >
                  <LinkIcon className="size-3.5" />
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {company.description && (
        <section className="mt-8">
          <Typography.Heading
            className="mb-2 text-sm font-semibold uppercase tracking-wider text-(color-text-muted)"
            level={2}
          >
            About
          </Typography.Heading>
          <p className="whitespace-pre-line text-sm leading-relaxed text-(color-text)">
            {company.description}
          </p>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <Typography.Heading
              className="text-xl font-semibold text-(color-text)"
              level={2}
            >
              Open Roles
            </Typography.Heading>
            <Typography.Paragraph className="text-sm text-(color-text-muted)">
              {activeJobs.length === 0
                ? "No open roles at the moment."
                : `${activeJobs.length} ${activeJobs.length === 1 ? "role" : "roles"} hiring now`}
            </Typography.Paragraph>
          </div>
        </div>

        {activeJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-(color-border) bg-(color-surface) px-6 py-12 text-center">
            <Briefcase className="size-8 text-(color-text-muted)" />
            <p className="text-sm text-(color-text-muted)">
              No open roles at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {activeJobs.map((job) => {
              const salary = formatSalary(job);
              const loc = formatLocation(job);
              const jobId = job._id ?? job.id;
              return (
                <Link
                  key={jobId}
                  href={`/jobs/${jobId}`}
                  className="group block"
                >
                  <Card className="flex h-full flex-col gap-2 rounded-2xl border border-(color-border) bg-(color-surface) p-4 transition-colors group-hover:border-indigo-500/50">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-(color-text)">
                        {job.title ?? "Untitled role"}
                      </h3>
                      {job.type && (
                        <span className="shrink-0 rounded-full border border-(color-border) bg-(color-surface-2) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-(color-text)">
                          {job.type}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(color-text-muted)">
                      {loc && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3" />
                          {loc}
                        </span>
                      )}
                      {salary && (
                        <span className="inline-flex items-center gap-1.5">
                          <Wallet className="size-3" />
                          {salary}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <DeadlineCountdown deadline={job.deadline} />
                      <span className="inline-flex items-center gap-1 text-xs text-indigo-500 transition-colors group-hover:text-(color-text)">
                        View
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
