"use client";

import ButtonLink from "@/components/shared/ButtonLink";
import { getRecruiterCompanies } from "@/lib/actions/company";
import { getRecruiterJob, updateRecruiterJobStatus } from "@/lib/actions/jobs";
import { getCompanyName, getCompanySlug } from "@/lib/api/companies";
import {
  formatJobDate,
  getJobCreatedAt,
  getJobId,
} from "@/lib/api/jobstruture";
import {
  ArrowLeft,
  Ban,
  Calendar,
  CircleCheck,
  CircleStop,
  Globe,
  MapPin,
  Pencil,
  Play,
  Wallet,
} from "@gravity-ui/icons";
import { Avatar, Button, Card, Chip, Typography, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

function statusMeta(status) {
  if (status === "active") {
    return { color: "success", label: "Active", icon: CircleCheck };
  }
  if (status === "closed") {
    return { color: "danger", label: "Closed", icon: CircleStop };
  }
  return { color: "warning", label: "Draft", icon: Pencil };
}

function InfoRow({ label, value, href }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/5 py-2.5 last:border-b-0">
      <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="truncate text-right text-sm text-indigo-500 transition-colors hover:text-indigo-500"
        >
          {value}
        </a>
      ) : (
        <span className="truncate text-right text-sm text-foreground">
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

function LongBlock({ label, value }) {
  if (!value) return null;
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <Typography.Paragraph className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Typography.Paragraph>
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
        {value}
      </p>
    </Card>
  );
}

export default function JobDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const loadJobAndCompany = (jobId) => {
    return getRecruiterJob(jobId)
      .then((data) => {
        const resolvedJobId = getJobId(data);
        if (!resolvedJobId) {
          setJob(null);
          setCompany(null);
          return;
        }
        setJob({ ...data, id: resolvedJobId });

        if (!data?.companySlug) {
          setCompany(null);
          return;
        }

        return getRecruiterCompanies({ pageSize: 100 })
          .then((companiesData) => {
            const list = Array.isArray(companiesData)
              ? companiesData
              : (companiesData?.items ?? []);
            const found = list.find(
              (c) => getCompanySlug(c) === data.companySlug,
            );
            setCompany(found ?? null);
          })
          .catch((innerError) => {
            console.warn(
              "[JobDetailPage] Failed to load company for job:",
              innerError,
            );
            setCompany(null);
          });
      })
      .catch((error) => {
        console.error("[JobDetailPage] Failed to load job:", error);
        setHasError(true);
        toast.warning("Could not load job", {
          description: "Make sure the API server is running.",
        });
      });
  };

  useEffect(() => {
    let cancelled = false;

    loadJobAndCompany(id).finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleToggleStatus = async () => {
    if (!job) return;
    setIsToggling(true);

    const nextStatus = job.status === "active" ? "closed" : "active";

    if (nextStatus === "active" && (!job.companySlug || !company)) {
      toast.warning("Cannot reopen job", {
        description:
          "This job has no company. Add a company to it before reopening.",
      });
      setIsToggling(false);
      return;
    }

    const previous = job.status;
    setJob((prev) => (prev ? { ...prev, status: nextStatus } : prev));

    try {
      await updateRecruiterJobStatus(job.id, nextStatus);
      toast.success(nextStatus === "active" ? "Job reopened" : "Job closed", {
        description: `${job.title} status updated.`,
      });
    } catch (error) {
      console.error("[JobDetailPage] Failed to update status:", error);
      setJob((prev) => (prev ? { ...prev, status: previous } : prev));
      toast.danger("Status update failed", {
        description: `${job.title} was not updated.`,
      });
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Typography.Paragraph className="text-sm text-muted-foreground">
          Loading job…
        </Typography.Paragraph>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
        <Typography.Paragraph className="text-sm text-muted-foreground">
          Could not load job.
        </Typography.Paragraph>
        <Button variant="primary" onPress={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="rounded-2xl border border-default bg-content1 p-8 text-center">
          <Typography.Heading
            className="text-xl font-semibold text-foreground"
            level={2}
          >
            Job not found
          </Typography.Heading>
          <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t find a job with the id{" "}
            <span className="font-mono text-foreground">{id}</span>.
          </Typography.Paragraph>
          <ButtonLink
            href="/dashboard/recruiter/jobs"
            variant="primary"
            className="mx-auto mt-6"
          >
            <ArrowLeft className="size-4" />
            Back to Manage Jobs
          </ButtonLink>
        </div>
      </div>
    );
  }

  const meta = statusMeta(job.status);
  const StatusIcon = meta.icon;
  const isActive = job.status === "active";

  const companyName = company ? getCompanyName(company) : null;
  const companyHref = company
    ? `/dashboard/mycompany/${getCompanySlug(company)}`
    : null;
  const isRemote = Boolean(job.remote);
  const location = isRemote
    ? "Remote"
    : [job.city, job.country].filter(Boolean).join(", ");

  const salary =
    job.salaryMin && job.salaryMax
      ? `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`
      : null;

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto mb-6 max-w-5xl">
        <ButtonLink
          href="/dashboard/recruiter/jobs"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Manage Jobs
        </ButtonLink>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-2xl border border-default bg-[radial-gradient(circle_at_78%_18%,rgba(99,102,241,0.30),transparent_45%),radial-gradient(circle_at_18%_82%,rgba(56,189,248,0.22),transparent_50%),linear-gradient(180deg,#16181c,#0f1013)] p-6 lg:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-indigo-500/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Chip color={meta.color} size="sm" variant="soft">
                  <StatusIcon className="size-3" />
                  {meta.label}
                </Chip>
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
                {job.isPublicVisible && (
                  <Chip color="success" size="sm" variant="soft">
                    <Globe className="size-3" />
                    Public
                  </Chip>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {job.title}
              </h1>

              {companyName && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  at{" "}
                  {companyHref ? (
                    <a
                      href={companyHref}
                      className="text-foreground transition-colors hover:text-indigo-500"
                    >
                      {companyName}
                    </a>
                  ) : (
                    <span className="text-foreground">{companyName}</span>
                  )}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                    Closes {formatJobDate(job.deadline)}
                  </span>
                )}
              </div>

              {job.id && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#1b1c1e] px-2 py-1 font-mono text-[10px] text-muted-foreground">
                  <span className="text-foreground/40">ID</span>
                  <span>{job.id}</span>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="secondary"
                onPress={handleToggleStatus}
                isDisabled={isToggling}
              >
                {isActive ? (
                  <Ban className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
                {isActive ? "Close Job" : "Reopen Job"}
              </Button>
              <Button
                variant="primary"
                onPress={() =>
                  router.push(`/dashboard/recruiter/jobs/${job.id}/edit`)
                }
              >
                <Pencil className="size-4" />
                Update
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="rounded-2xl border border-default bg-content1 p-4">
            <Typography.Paragraph className="text-xs uppercase tracking-wider text-muted-foreground">
              Applicants
            </Typography.Paragraph>
            <Typography.Paragraph className="mt-1 text-lg font-semibold text-foreground">
              {job.applicants ?? 0}
            </Typography.Paragraph>
          </Card>
          <Card className="rounded-2xl border border-default bg-content1 p-4">
            <Typography.Paragraph className="text-xs uppercase tracking-wider text-muted-foreground">
              Posted
            </Typography.Paragraph>
            <Typography.Paragraph className="mt-1 text-sm font-semibold text-foreground">
              {formatJobDate(getJobCreatedAt(job))}
            </Typography.Paragraph>
          </Card>
          <Card className="rounded-2xl border border-default bg-content1 p-4">
            <Typography.Paragraph className="text-xs uppercase tracking-wider text-muted-foreground">
              Closes
            </Typography.Paragraph>
            <Typography.Paragraph className="mt-1 text-sm font-semibold text-foreground">
              {job.deadline ? formatJobDate(job.deadline) : "—"}
            </Typography.Paragraph>
          </Card>
          <Card className="rounded-2xl border border-default bg-content1 p-4">
            <Typography.Paragraph className="text-xs uppercase tracking-wider text-muted-foreground">
              Type
            </Typography.Paragraph>
            <Typography.Paragraph className="mt-1 text-sm font-semibold text-foreground">
              {job.type ?? "—"}
            </Typography.Paragraph>
          </Card>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {job.description && (
              <Card className="rounded-2xl border border-default bg-content1 p-5">
                <Typography.Paragraph className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role Overview
                </Typography.Paragraph>
                <div
                  className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </Card>
            )}

            <LongBlock label="Responsibilities" value={job.responsibilities} />
            <LongBlock label="Requirements" value={job.requirements} />
            <LongBlock label="Benefits" value={job.benefits} />

            {job.skills?.length > 0 && (
              <Card className="rounded-2xl border border-default bg-content1 p-5">
                <Typography.Paragraph className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Required Skills
                </Typography.Paragraph>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => {
                    const s = skill.trim();
                    if (!s) return null;
                    return (
                      <Chip
                        key={index}
                        variant="flat"
                        color="primary"
                        size="sm"
                      >
                        {s}
                      </Chip>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            <Card className="rounded-2xl border border-default bg-content1 p-5">
              <Typography.Paragraph className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Info
              </Typography.Paragraph>
              <div>
                <InfoRow
                  label="Company"
                  value={companyName ?? "—"}
                  href={companyHref ?? undefined}
                />
                <InfoRow label="Category" value={job.category ?? "—"} />
                <InfoRow label="Type" value={job.type ?? "—"} />
                {job.experienceLevel && (
                  <InfoRow label="Level" value={job.experienceLevel} />
                )}
                <InfoRow
                  label="Work mode"
                  value={
                    job.workplaceType ||
                    (isRemote ? "Fully remote" : "On-site / Hybrid")
                  }
                />
                <InfoRow
                  label="Location"
                  value={isRemote ? "Remote" : location || "—"}
                />
                <InfoRow label="Salary" value={salary} />
                <InfoRow
                  label="Visibility"
                  value={job.isPublicVisible ? "Public" : "Private"}
                />
                <InfoRow label="Applicants" value={job.applicants ?? 0} />
              </div>
            </Card>

            {company && (
              <Card className="rounded-2xl border border-default bg-content1 p-5">
                <Typography.Paragraph className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hiring Company
                </Typography.Paragraph>
                <div className="flex items-center gap-3">
                  <Avatar.Root className="size-12 shrink-0 rounded-2xl bg-default text-sm font-semibold text-default-foreground">
                    <Avatar.Fallback>
                      {(
                        company.initials ??
                        company.name?.[0] ??
                        "?"
                      ).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {getCompanyName(company)}
                    </p>
                    {company.industry && (
                      <p className="truncate text-xs text-muted-foreground">
                        {company.industry}
                      </p>
                    )}
                  </div>
                </div>
                <ButtonLink
                  href={companyHref}
                  variant="secondary"
                  className="mt-4 w-full"
                >
                  View company
                </ButtonLink>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
