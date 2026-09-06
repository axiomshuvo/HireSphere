"use server";
import { apiFetch } from "@/lib/api/client";
import { revalidateTag } from "next/cache";
import { getCurrentUser, requireRecruiter } from "@/lib/core/session";



function buildQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchPublicJobs({
  page = 1,
  pageSize = 12,
  search,
  category,
  type,
  location,
  remote,
} = {}) {
  const qs = buildQuery({
    page,
    pageSize,
    search,
    category,
    type,
    location,
    remote,
  });
  return apiFetch(`/api/jobs${qs}`, { tags: ["jobs"] });
}

export async function fetchPublicJobById(jobId) {
  return apiFetch(`/api/jobs/${jobId}`, {
    tags: [`job:${jobId}`, "jobs"],
  });
}

export async function getRecruiterJob(jobId) {
  const user = await getCurrentUser();
  if (!user) return null;
  return apiFetch(`/api/my/jobs/${jobId}`, {
    tags: [`job:${jobId}`, "jobs"],
    requireAuth: true
  });
}

export async function getRecruiterJobs({ page = 1, pageSize = 12, status } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], page: 1, pageSize, total: 0, totalPages: 0 };
  const qs = buildQuery({ page, pageSize, status });
  return apiFetch(`/api/my/jobs${qs}`, {
    tags: ["jobs"],
    requireAuth: true
  });
}

export async function getRecruiterJobStats() {
  const user = await getCurrentUser();
  if (!user) return { total: 0, active: 0, closed: 0, applicantsTotal: 0 };
  try {
    return await apiFetch(`/api/my/jobs/stats`, {
      cache: "no-store",
      requireAuth: true
    });
  } catch {
    // Stats endpoint is optional — fall back to empty shape so the page renders.
    return { total: 0, active: 0, closed: 0, applicantsTotal: 0 };
  }
}

export async function createRecruiterJob(jobData) {
  const user = await requireRecruiter();
  const { recruiterId: _strip, ...rest } = jobData ?? {};
  const payload = { ...rest, requireAuth: true };

  const result = await apiFetch("/api/my/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: true
  });
  revalidateTag("jobs");
  return result;
}

export async function updateRecruiterJob(jobId, jobData) {
  const user = await requireRecruiter();
  const { recruiterId: _strip, ...rest } = jobData ?? {};
  const payload = { ...rest, requireAuth: true };

  const result = await apiFetch(`/api/my/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    requireAuth: true
  });
  revalidateTag("jobs");
  revalidateTag(`job:${jobId}`);
  return result;
}

export async function updateRecruiterJobStatus(jobId, status) {
  const user = await requireRecruiter();

  const result = await apiFetch(`/api/my/jobs/${jobId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    requireAuth: true
  });
  revalidateTag("jobs");
  revalidateTag(`job:${jobId}`);
  return result;
}

export async function deleteRecruiterJob(jobId) {
  const user = await requireRecruiter();

  const result = await apiFetch(`/api/my/jobs/${jobId}`, {
    method: "DELETE",
    requireAuth: true
  });
  revalidateTag("jobs");
  revalidateTag(`job:${jobId}`);
  return result;
}
