import CompanyCard from "@/components/dashboard/company/CompanyCard";
import ButtonLink from "@/components/shared/ButtonLink";
import { getRecruiterCompanies } from "@/lib/actions/company";
import { normalizeCompanies } from "@/lib/api/companies";
import { CirclePlus } from "@gravity-ui/icons";

const PAGE_SIZE = 9;

function PageStrip({ page, totalPages, basePath }) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? `${basePath}?page=${page - 1}` : null;
  const next = page < totalPages ? `${basePath}?page=${page + 1}` : null;
  return (
    <nav className="mt-6 flex items-center justify-center gap-3 text-sm">
      {prev ? (
        <ButtonLink href={prev} variant="secondary" size="sm">
          Previous
        </ButtonLink>
      ) : (
        <span className="text-muted-foreground">Previous</span>
      )}
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <ButtonLink href={next} variant="secondary" size="sm">
          Next
        </ButtonLink>
      ) : (
        <span className="text-muted-foreground">Next</span>
      )}
    </nav>
  );
}

export default async function MyCompanyPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);
  const result = await getRecruiterCompanies({ page, pageSize: PAGE_SIZE });
  const items = Array.isArray(result) ? result : result?.items ?? [];
  const totalPages =
    typeof result?.totalPages === "number"
      ? Math.max(1, result.totalPages)
      : 1;
  const companies = normalizeCompanies(items);

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            My Companies
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every company you manage on HireSphere, in one place.
          </p>
        </div>

        <ButtonLink href="/dashboard/mycompany/new" variant="primary">
          <CirclePlus className="size-4" />
          Add Company
        </ButtonLink>
      </div>

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-white">No companies yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Register your first company to start posting jobs and managing
            applicants.
          </p>
          <ButtonLink
            href="/dashboard/mycompany/new"
            variant="primary"
            className="mt-2"
          >
            <CirclePlus className="size-4" />
            Add Your First Company
          </ButtonLink>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard
                key={company.companySlug ?? company.id ?? company._id}
                company={company}
              />
            ))}
          </div>
          <PageStrip page={page} totalPages={totalPages} basePath="/dashboard/mycompany" />
        </>
      )}
    </div>
  );
}
