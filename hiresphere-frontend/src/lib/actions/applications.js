"use server";
import { apiFetch } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/core/session";
import { revalidatePath, revalidateTag } from "next/cache";


// Accept any common list shape the backend might return.
function normalizeList(payload, hint) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 1,
      pageSize: payload.length,
      total: payload.length,
      totalPages: 1,
    };
  }
  if (payload && typeof payload === "object") {
    const items =
      payload.items ??
      payload.data ??
      payload.results ??
      payload[hint] ??
      payload.savedJobs ??
      payload.applications ??
      payload.jobs ??
      [];
    return {
      items: Array.isArray(items) ? items : [],
      page: Number(payload.page) || 1,
      pageSize: Number(payload.pageSize) || items.length || 0,
      total: Number(payload.total) || items.length || 0,
      totalPages: Number(payload.totalPages) || 1,
    };
  }
  return { items: [], page: 1, pageSize: 0, total: 0, totalPages: 0 };
}


export async function fetchMyApplications({ page = 1, pageSize = 12 } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], page: 1, pageSize, total: 0, totalPages: 0 };
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  try {
    const result = await apiFetch(`/api/my/applications?${params.toString()}`, {
      tags: ["applications"],
      requireAuth: true
    });
    return normalizeList(result, "applications");
  } catch (error) {
    console.warn("[fetchMyApplications] failed:", error?.message ?? error);
    return { items: [], page, pageSize, total: 0, totalPages: 0 };
  }
}

export async function fetchApplicationForJob(jobId) {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const result = await apiFetch(
      `/api/my/applications/${encodeURIComponent(jobId)}`,
      { tags: ["applications"], requireAuth: true },
    );
    // Accept any of: { application: {...} }, { data: {...} }, or the
    // application object directly.
    if (!result) return null;
    if (Array.isArray(result)) return result[0] ?? null;
    if (Object.prototype.hasOwnProperty.call(result, "application")) {
      return result.application ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result, "data")) {
      return result.data ?? null;
    }
    return result;
  } catch (error) {
    console.warn(
      `[fetchApplicationForJob(${jobId})] failed:`,
      error?.message ?? error,
    );
    return null;
  }
}

export async function applyToJob({
  jobId,
  name,
  email,
  phone,
  coverLetter,
  resumeUrl,
  expectedSalary,
  recruiterId,
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to apply");
  if (user.role !== "seeker") {
    throw new Error(
      "Only job seekers can submit applications. Sign in with a seeker account to apply.",
    );
  }
  const result = await apiFetch("/api/my/applications", {
    method: "POST",
    body: JSON.stringify({
      jobId,
      name,
      email,
      phone,
      coverLetter,
      resumeUrl,
      expectedSalary,
    }),
    requireAuth: true
  });
  revalidateTag("applications");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/jobs/${jobId}`);
  return result;
}

export async function withdrawApplication(jobId) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to withdraw an application");
  if (user.role !== "seeker") {
    throw new Error("Only job seekers can withdraw applications.");
  }
  if (!jobId) throw new Error("jobId is required");
  const result = await apiFetch(
    `/api/my/applications/${encodeURIComponent(jobId)}`,
    {
      method: "DELETE",
      requireAuth: true
    },
  );
  revalidateTag("applications");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/jobs/${jobId}`);
  return result;
}

export async function fetchAllApplicants({
  jobId,
  page = 1,
  pageSize = 20,
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], total: 0, page, pageSize, totalPages: 0 };
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (jobId) params.set("jobId", String(jobId));
  try {
    return await apiFetch(`/api/my/applicants?${params.toString()}`, {
      requireAuth: true
    });
  } catch (error) {
    console.warn("[fetchAllApplicants] failed:", error?.message ?? error);
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

export async function fetchApplicantById(applicationId) {
  const user = await getCurrentUser();
  if (!user || user.role !== "recruiter" || !applicationId) return null;
  try {
    const result = await apiFetch(
      `/api/my/applicants/${encodeURIComponent(applicationId)}`,
      { requireAuth: true },
    );
    return result?.application ?? null;
  } catch (error) {
    console.warn(
      `[fetchApplicantById(${applicationId})] failed:`,
      error?.message ?? error,
    );
    return null;
  }
}
