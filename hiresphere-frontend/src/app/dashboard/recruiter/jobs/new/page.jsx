import JobForm from "@/components/dashboard/jobs/JobForm";
import ButtonLink from "@/components/shared/ButtonLink";
import { getRecruiterCompanies } from "@/lib/actions/company";
import { getRecruiterJobStats } from "@/lib/actions/jobs";
import { ArrowLeft, Briefcase } from "@gravity-ui/icons";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  let activeJobCount = 0;
  let companies = [];

  try {
    const [stats, companiesData] = await Promise.all([
      getRecruiterJobStats(),
      getRecruiterCompanies({ pageSize: 100 }),
    ]);
    activeJobCount = stats?.active ?? 0;
    companies = Array.isArray(companiesData)
      ? companiesData
      : (companiesData?.items ?? []);
  } catch (error) {
    console.error("Failed to load job form data:", error);
  }

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto mb-6 max-w-3xl">
        <ButtonLink
          href="/dashboard/recruiter/jobs"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Manage Jobs
        </ButtonLink>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-indigo-500/20 bg-content1 p-6 sm:p-8">
          <div className="absolute -right-10 -top-20 size-56 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/25">
              <Briefcase className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                Role publishing
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Post a new job
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a clear role that attracts the right candidates.
              </p>
            </div>
          </div>
        </div>
        <JobForm activeJobCount={activeJobCount} companies={companies} />
      </div>
    </div>
  );
}
