"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/core/session";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const REVALIDATE_SECONDS = 30;

async function request(path, { tags: extraTags, revalidate, recruiterId, ...options } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (recruiterId) headers["x-recruiter-id"] = recruiterId;

  const res = await fetch(`${baseUrl}${path}`, {
    headers,
    next: { revalidate: revalidate ?? REVALIDATE_SECONDS, tags: extraTags },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchMyApplications({ page = 1, pageSize = 12 } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], page: 1, pageSize, total: 0, totalPages: 0 };
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  try {
    return await request(`/api/my/applications?${params.toString()}`, {
      tags: ["applications"],
    });
  } catch (error) {
    console.warn(
      "[fetchMyApplications] failed:",
      error?.message ?? error,
    );
    return { items: [], page, pageSize, total: 0, totalPages: 0 };
  }
}

export async function fetchApplicationForJob(jobId) {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const result = await request(
      `/api/my/applications/${encodeURIComponent(jobId)}`,
      { tags: ["applications"] },
    );
    return result?.application ?? null;
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
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to apply");
  if (user.role !== "seeker") {
    throw new Error(
      "Only job seekers can submit applications. Sign in with a seeker account to apply.",
    );
  }
  const result = await request("/api/my/applications", {
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
  });
  revalidateTag("applications");
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
  const result = await request(
    `/api/my/applications/${encodeURIComponent(jobId)}`,
    {
      method: "DELETE",
    },
  );
  revalidateTag("applications");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/jobs/${jobId}`);
  return result;
}

export async function fetchJobApplicants(jobId) {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const result = await request(
      `/api/my/applicants?jobId=${encodeURIComponent(jobId)}`,
      { recruiterId: user.id },
    );
    return Array.isArray(result?.items) ? result.items : [];
  } catch (error) {
    console.warn(
      `[fetchJobApplicants(${jobId})] failed:`,
      error?.message ?? error,
    );
    return [];
  }
}

export async function fetchAllApplicants({ jobId, page = 1, pageSize = 20 } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], total: 0, page, pageSize, totalPages: 0 };
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (jobId) params.set("jobId", String(jobId));
  try {
    return await request(`/api/my/applicants?${params.toString()}`, {
      recruiterId: user.id,
    });
  } catch (error) {
    console.warn("[fetchAllApplicants] failed:", error?.message ?? error);
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }
}
