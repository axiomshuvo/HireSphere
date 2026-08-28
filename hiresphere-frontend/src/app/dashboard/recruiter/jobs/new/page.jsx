import JobForm from "@/components/dashboard/jobs/JobForm";
import ButtonLink from "@/components/shared/ButtonLink";
import { getRecruiterCompanies } from "@/lib/actions/company";
import { getRecruiterJobStats } from "@/lib/actions/jobs";
import { ArrowLeft } from "@gravity-ui/icons";

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

      <JobForm activeJobCount={activeJobCount} companies={companies} />
    </div>
  );
}
