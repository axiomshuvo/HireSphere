import { fetchPublicCompanies } from "@/lib/actions/company";
import { Briefcase, MapPin, Persons } from "@gravity-ui/icons";
import { Avatar, Card } from "@heroui/react";
import Link from "next/link";

const PAGE_SIZE = 12;

export const dynamic = "force-dynamic";

function getInitials(name) {
  const parts = name?.trim().split(/\s+/) ?? [];
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "U";
}

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
    <nav className="mt-10 flex items-center justify-center gap-3 text-sm">
      {prev ? (
        <Link
          href={prev}
          className="rounded-lg border border-default bg-content1 px-4 py-2 text-white transition-colors hover:border-indigo-500/50"
        >
          Previous
        </Link>
      ) : (
        <span className="text-muted-foreground">Previous</span>
      )}
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link
          href={next}
          className="rounded-lg border border-default bg-content1 px-4 py-2 text-white transition-colors hover:border-indigo-500/50"
        >
          Next
        </Link>
      ) : (
        <span className="text-muted-foreground">Next</span>
      )}
    </nav>
  );
}

export default async function PublicCompanyListPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);
  const result = await fetchPublicCompanies({ page, pageSize: PAGE_SIZE });
  const items = Array.isArray(result) ? result : result?.items ?? [];
  const totalPages =
    typeof result?.totalPages === "number" ? Math.max(1, result.totalPages) : 1;
  const total = typeof result?.total === "number" ? result.total : items.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Companies
        </h1>
        <p className="mt-2 text-muted-foreground">
          {total === 0
            ? "No companies listed yet."
            : `${total} ${total === 1 ? "company" : "companies"} hiring on HireSphere.`}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
          <Briefcase className="size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-white">
            No companies listed yet
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Recruiters haven&apos;t added any public company profiles yet. Check
            back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((company) => {
            const slug = company.companySlug ?? company.id ?? company._id;
            const activeJobs = Number(company.activeJobs ?? 0);
            return (
              <Link
                key={slug}
                href={`/company/${slug}`}
                className="group block"
              >
                <Card className="flex h-full flex-col gap-3 rounded-2xl border border-default bg-content1 p-5 transition-colors group-hover:border-indigo-500/50">
                  <div className="flex items-start gap-3">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="size-14 shrink-0 rounded-2xl border border-default object-cover"
                      />
                    ) : (
                      <Avatar.Root className="size-14 shrink-0 rounded-2xl bg-default text-lg font-semibold text-default-foreground">
                        <Avatar.Fallback>
                          {getInitials(company.name ?? "")}
                        </Avatar.Fallback>
                      </Avatar.Root>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-semibold text-white">
                        {company.name ?? "Unnamed company"}
                      </h2>
                      {company.industry && (
                        <p className="truncate text-sm text-muted-foreground">
                          {company.industry}
                        </p>
                      )}
                    </div>
                  </div>

                  {company.tagline && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {company.tagline}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-default pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="size-3.5" />
                      {activeJobs === 0
                        ? "No open roles"
                        : `${activeJobs} open ${activeJobs === 1 ? "role" : "roles"}`}
                    </span>
                    <span className="text-xs text-indigo-300 transition-colors group-hover:text-white">
                      View →
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <PageStrip page={page} totalPages={totalPages} searchParams={params} />
    </div>
  );
}
