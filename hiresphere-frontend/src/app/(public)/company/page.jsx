import { fetchPublicCompanies } from "@/lib/actions/company";
import { getCompanySlug } from "@/lib/api/companies";
import CompanyLogo from "@/components/public/CompanyLogo";
import SpotlightCard from "@/components/public/SpotlightCard";
import {
  Briefcase,
  Globe,
  Magnifier,
  MapPin,
  OfficeBadge,
  Person,
} from "@gravity-ui/icons";
import { Chip } from "@heroui/react";
import Link from "next/link";

const PAGE_SIZE = 12;

export const dynamic = "force-dynamic";

function PageStrip({ page, totalPages, searchParams }) {
  if (totalPages <= 1) return null;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === "page") continue;
    if (value) params.set(key, String(value));
  }
  const buildHref = (target) => {
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/company?${qs}` : "/company";
  };
  const prev = page > 1 ? buildHref(page - 1) : null;
  const next = page < totalPages ? buildHref(page + 1) : null;
  return (
    <div className="mt-12 flex items-center justify-center gap-3">
      {prev ? (
        <Link
          href={prev}
          className="h-10 rounded-xl border border-white/10 bg-(color-surface-2) px-5 text-sm font-medium text-(color-text) transition-colors hover:border-indigo-500/50"
        >
          ← Previous
        </Link>
      ) : (
        <span className="h-10 rounded-xl border border-white/10 bg-(color-surface-2)/50 px-5 text-sm text-(color-text-muted)">
          ← Previous
        </span>
      )}
      <span className="text-sm text-(color-text-muted)">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link
          href={next}
          className="h-10 rounded-xl border border-white/10 bg-(color-surface-2) px-5 text-sm font-medium text-(color-text) transition-colors hover:border-indigo-500/50"
        >
          Next →
        </Link>
      ) : (
        <span className="h-10 rounded-xl border border-white/10 bg-(color-surface-2)/50 px-5 text-sm text-(color-text-muted)">
          Next →
        </span>
      )}
    </div>
  );
}

export default async function PublicCompanyListPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);
  const result = await fetchPublicCompanies({ page, pageSize: PAGE_SIZE });
  const items = Array.isArray(result) ? result : (result?.items ?? []);
  const totalPages =
    typeof result?.totalPages === "number" ? Math.max(1, result.totalPages) : 1;
  const total = typeof result?.total === "number" ? result.total : items.length;

  // Aggregate stats
  let totalOpenRoles = 0;
  let allIndustries = [];
  items.forEach((c) => {
    const aj = Number(c.activeJobs ?? 0);
    totalOpenRoles += aj;
    if (c.industry) allIndustries.push(c.industry);
  });
  const uniqueIndustries = [...new Set(allIndustries)];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-(color-border) bg-[radial-gradient(circle_at_30%_0%,rgba(99,102,241,0.25),transparent_50%),radial-gradient(circle_at_70%_100%,rgba(16,185,129,0.15),transparent_50%),linear-gradient(180deg,#16181c,#0f1013)] p-6 pb-10 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-indigo-500/8 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-emerald-500/8 blur-3xl"
        />

        <div className="relative">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/70">
            <OfficeBadge className="size-3.5 text-indigo-300" />
            Discover companies hiring now
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Companies on HireSphere
          </h1>
          <p className="mt-2 max-w-lg text-base text-white/70">
            Explore organizations building innovative products. Find your next
            role or partnership among our growing network.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative mt-8 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/20">
              <OfficeBadge className="size-4 text-indigo-500" />
            </div>
            <div>
              <span className="block text-lg font-semibold text-white">
                {total}
              </span>
              <span className="text-[11px] text-white/60">
                companies
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
              <Briefcase className="size-4 text-emerald-500" />
            </div>
            <div>
              <span className="block text-lg font-semibold text-white">
                {totalOpenRoles.toLocaleString()}
              </span>
              <span className="text-[11px] text-white/60">
                open roles
              </span>
            </div>
          </div>
          {uniqueIndustries.length > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/20">
                <Globe className="size-4 text-amber-500" />
              </div>
              <div>
              <span className="block text-lg font-semibold text-white">
                {uniqueIndustries.length}
              </span>
              <span className="text-[11px] text-white/60">
                industries
              </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Industry filter chips */}
      {uniqueIndustries.length > 1 && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Magnifier className="size-3.5 text-(color-text-muted)" />
          {["All", ...uniqueIndustries].map((ind) => (
            <Chip
              key={ind}
              variant="flat"
              className={`cursor-pointer text-xs ${
                ind === "All"
                  ? "border-white/15 bg-(color-surface-2) font-medium"
                  : "bg-white/[0.03] text-(color-text-muted) hover:bg-white/[0.06] hover:text-(color-text)"
              }`}
            >
              {ind === "All" ? "All industries" : ind}
            </Chip>
          ))}
        </div>
      )}

      {/* Company grid */}
      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-(color-surface) px-6 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
            <OfficeBadge className="size-7 text-(color-text-muted)" />
          </div>
          <h2 className="text-xl font-semibold text-(color-text)">
            No companies listed yet
          </h2>
          <p className="max-w-sm text-sm text-(color-text-muted)">
            Recruiters haven&apos;t added any public company profiles yet. Check
            back soon as we onboard new organizations.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((company) => {
            const slug = getCompanySlug(company);
            const activeJobs = Number(company.activeJobs ?? 0);
            return (
              <SpotlightCard key={slug} href={`/company/${slug}`}>
                <div className="flex items-start gap-3">
                  {/* Logo */}
                  <CompanyLogo logo={company.logo} name={company.name} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-semibold text-(color-text) transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {company.name ?? "Unnamed company"}
                      </h2>
                      {company.industry && (
                        <Chip
                          size="sm"
                          variant="flat"
                          className="mt-1 bg-default px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-(color-text-muted)"
                        >
                          {company.industry}
                        </Chip>
                      )}
                    </div>
                  </div>

                  {company.tagline && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-(color-text-muted)">
                      {company.tagline}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-(color-text-muted)">
                    {company.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3 text-emerald-600 dark:text-emerald-400" />
                        {company.location}
                      </span>
                    )}
                    {company.employeeCount && (
                      <span className="inline-flex items-center gap-1.5">
                        <Person className="size-3 text-amber-600 dark:text-amber-400" />
                        {company.employeeCount}
                      </span>
                    )}
                    {company.website && (
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="size-3 text-indigo-600 dark:text-indigo-400" />
                      </span>
                    )}
                  </div>

                  {/* Bottom row */}
                  <div className="mt-auto flex items-center justify-between border-t border-(color-border) pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <Briefcase className="size-3.5 text-indigo-600/70 dark:text-indigo-400/70" />
                      <span
                        className={
                          activeJobs > 0
                            ? "text-(color-text) font-medium"
                            : "text-(color-text-muted)"
                        }
                      >
                        {activeJobs > 0
                          ? `${activeJobs} open ${activeJobs === 1 ? "role" : "roles"}`
                          : "No open roles"}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors group-hover:text-indigo-500 dark:text-indigo-400">
                      View profile
                      <svg
                        className="size-3 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      <PageStrip page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
