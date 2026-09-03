export function getSeekerPlanUsage(activeApplications, dbPlan = null) {
  const planId = dbPlan?.planId ?? "free";
  const limit = dbPlan?.limits?.applicationsPerMonth ?? 3;
  const savedJobsLimit = dbPlan?.limits?.savedJobs ?? 10;

  return {
    plan: planId,
    limit: limit === -1 ? Infinity : limit,
    used: activeApplications,
    isUnlimited: limit === -1,
    savedJobsLimit: savedJobsLimit === -1 ? Infinity : savedJobsLimit,
    isSavedJobsUnlimited: savedJobsLimit === -1,
  };
}

export const JOB_CATEGORIES = [
  "Technology",
  "Engineering",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Design",
  "Sales",
];

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export const CURRENCIES = ["USD", "EUR", "GBP", "INR"];

export function getActiveCount(jobs) {
  return jobs.filter((job) => job.status === "active").length;
}

export function getPlanUsage(activeCount, dbPlan = null) {
  const planId = dbPlan?.planId ?? "free";
  const limit = dbPlan?.limits?.activeJobPosts ?? 3;

  return {
    plan: planId,
    limit: limit === -1 ? Infinity : limit,
    used: activeCount,
    hasAvailableSlots: limit === -1 || activeCount < limit,
  };
}

export const EMPTY_JOB_FORM = {
  companySlug: "",
  title: "",
  category: "Technology",
  type: "Full-time",
  salaryMin: "",
  salaryMax: "",
  currency: "USD",
  city: "",
  country: "",
  remote: false,
  deadline: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  isPublicVisible: true,
};

export function jobToFormValues(job) {
  return {
    ...EMPTY_JOB_FORM,
    ...job,
  };
}

export function getJobId(job) {
  return job?.id ?? job?._id ?? null;
}

export function getJobCreatedAt(job) {
  return job?.createdAt ?? job?.datePosted ?? null;
}

export function formatJobDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
