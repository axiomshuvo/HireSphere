export const Recruiter_PLAN_LIMITS = {
  free: 3,
  growth: 10,
  enterprise: 50,
};

export const SEEKER_PLAN_LIMITS = {
  free: 3,
  pro: 30,
  premium: Infinity,
};

export const SEEKER_SAVED_JOBS_LIMITS = {
  free: 10,
  pro: Infinity,
  premium: Infinity,
};

export function getSeekerPlanUsage(activeApplications, plan = "free") {
  const normalized = SEEKER_PLAN_LIMITS[plan] ? plan : "free";
  const limit = SEEKER_PLAN_LIMITS[normalized];
  const savedJobsLimit = SEEKER_SAVED_JOBS_LIMITS[normalized];
  return {
    plan: normalized,
    limit,
    used: activeApplications,
    isUnlimited: !Number.isFinite(limit),
    savedJobsLimit,
    isSavedJobsUnlimited: !Number.isFinite(savedJobsLimit),
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

export function getPlanUsage(activeCount, plan = "free") {
  const normalizedPlan = Recruiter_PLAN_LIMITS[plan] ? plan : "free";
  const limit = Recruiter_PLAN_LIMITS[normalizedPlan];

  return {
    plan: normalizedPlan,
    limit,
    used: activeCount,
    hasAvailableSlots: activeCount < limit,
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
