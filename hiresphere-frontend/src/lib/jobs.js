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

export const MOCK_COMPANY = {
  name: "LuminaTech Systems",
  shortName: "LuminaTech",
  initials: "L",
  isApproved: true,
  plan: "growth",
};

export const INITIAL_JOBS = [
  {
    id: "job-001",
    title: "Senior Frontend Developer",
    status: "active",
    applicants: 42,
    datePosted: "Aug 10, 2026",
    type: "Full-time",
    location: "San Francisco, USA",
  },
  {
    id: "job-002",
    title: "Backend Engineer",
    status: "active",
    applicants: 28,
    datePosted: "Aug 08, 2026",
    type: "Remote",
    location: "Remote",
  },
  {
    id: "job-003",
    title: "Product Designer",
    status: "active",
    applicants: 19,
    datePosted: "Aug 05, 2026",
    type: "Full-time",
    location: "New York, USA",
  },
  {
    id: "job-004",
    title: "DevOps Architect",
    status: "active",
    applicants: 11,
    datePosted: "Aug 02, 2026",
    type: "Contract",
    location: "Austin, USA",
  },
  {
    id: "job-005",
    title: "Data Analyst",
    status: "closed",
    applicants: 36,
    datePosted: "Jul 28, 2026",
    type: "Part-time",
    location: "Chicago, USA",
  },
  {
    id: "job-006",
    title: "Mobile Engineer (iOS)",
    status: "active",
    applicants: 23,
    datePosted: "Jul 25, 2026",
    type: "Remote",
    location: "Remote",
  },
  {
    id: "job-007",
    title: "Technical Support Specialist",
    status: "draft",
    applicants: 0,
    datePosted: "Jul 20, 2026",
    type: "Full-time",
    location: "Seattle, USA",
  },
];

export function getActiveCount(jobs) {
  return jobs.filter((job) => job.status === "active").length;
}

export function getPlanUsage(activeCount) {
  const plan = MOCK_COMPANY.plan;
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.growth;

  return {
    plan,
    limit,
    used: activeCount,
    hasAvailableSlots: activeCount < limit,
  };
}

export const EMPTY_JOB_FORM = {
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
};

export function formatPostedDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function buildJobId() {
  return `job-${Date.now()}`;
}

export function buildLocation({ remote, city, country }) {
  return remote ? "Remote" : [city, country].filter(Boolean).join(", ");
}

export function jobFromForm(formData, existingJob) {
  if (existingJob) {
    return {
      ...existingJob,
      ...formData,
      title: formData.title.trim(),
      type: formData.type,
      location: buildLocation(formData),
    };
  }

  return {
    id: buildJobId(),
    title: formData.title.trim(),
    status: "active",
    applicants: 0,
    datePosted: formatPostedDate(),
    type: formData.type,
    location: buildLocation(formData),
    ...formData,
  };
}

export function jobToFormValues(job) {
  return {
    ...EMPTY_JOB_FORM,
    ...job,
  };
}
