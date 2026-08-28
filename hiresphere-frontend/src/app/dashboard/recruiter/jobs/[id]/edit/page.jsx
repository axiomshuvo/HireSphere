import JobForm from "@/components/dashboard/jobs/JobForm";
import ButtonLink from "@/components/shared/ButtonLink";
import { fetchCompanies } from "@/lib/actions/company";
import { fetchJobs } from "@/lib/actions/jobs";
import { getActiveCount, getJobId } from "@/lib/api/jobstruture";
import { ArrowLeft } from "@gravity-ui/icons";

export default async function EditJobPage({ params }) {
  const { id } = await params;

  let job = null;
  let activeJobCount = 0;
  let companies = [];

  try {
    const [jobs, companiesData] = await Promise.all([
      fetchJobs(),
      fetchCompanies(),
    ]);
    activeJobCount = getActiveCount(jobs);
    job = jobs.find((item) => getJobId(item) === id) ?? null;
    companies = Array.isArray(companiesData) ? companiesData : [];
  } catch (error) {
    console.error("Failed to load job:", error);
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

      <JobForm
        job={job}
        activeJobCount={activeJobCount}
        companies={companies}
      />
    </div>
  );
}
