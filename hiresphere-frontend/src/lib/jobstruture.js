export const PLAN_LIMITS = {
  free: 3,
  growth: 10,
  enterprise: 50,
};

export const JOB_CATEGORIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Design",
  "Sales",
];

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Remote",
  "Contract",
  "Internship",
];

export const CURRENCIES = ["USD", "EUR", "GBP", "INR"];

export function getActiveCount(jobs) {
  return jobs.filter((job) => job.status === "active").length;
}

export function getPlanUsage(activeCount, plan = "growth") {
  const normalizedPlan = PLAN_LIMITS[plan] ? plan : "growth";
  const limit = PLAN_LIMITS[normalizedPlan];

  return {
    plan: normalizedPlan,
    limit,
    used: activeCount,
    hasAvailableSlots: activeCount < limit,
  };
}

export const EMPTY_JOB_FORM = {
  companyId: "",
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
