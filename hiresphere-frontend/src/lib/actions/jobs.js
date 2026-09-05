"use server";

import { revalidateTag } from "next/cache";
import { getCurrentUser, requireRecruiter } from "@/lib/core/session";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const REVALIDATE_SECONDS = 30;
const STATS_REVALIDATE_SECONDS = 60;

async function request(path, { tags, revalidate, recruiterId, ...options } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (recruiterId) headers["x-recruiter-id"] = recruiterId;

  // Per-user endpoints must bypass Next's data cache: the cache key is
  // URL-only and does NOT include x-recruiter-id, so a cached response
  // for one user would be served to another. The /api/my/* routes are
  // always per-user; everything else is public.
  const cacheDirective = path.startsWith("/api/my/")
    ? { cache: "no-store" }
    : { next: { revalidate: revalidate ?? REVALIDATE_SECONDS, tags } };

  const res = await fetch(`${baseUrl}${path}`, {
    headers,
    ...cacheDirective,
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  return res.json();
}

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
  return request(`/api/jobs${qs}`, { tags: ["jobs"] });
}

export async function fetchPublicJobById(jobId) {
  return request(`/api/jobs/${jobId}`, {
    tags: [`job:${jobId}`, "jobs"],
  });
}

export async function getRecruiterJob(jobId) {
  const user = await getCurrentUser();
  if (!user) return null;
  return request(`/api/my/jobs/${jobId}`, {
    tags: [`job:${jobId}`, "jobs"],
    recruiterId: user.id,
  });
}

export async function getRecruiterJobs({ page = 1, pageSize = 12, status } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], page: 1, pageSize, total: 0, totalPages: 0 };
  const qs = buildQuery({ page, pageSize, status });
  return request(`/api/my/jobs${qs}`, {
    tags: ["jobs"],
    recruiterId: user.id,
  });
}

export async function getRecruiterJobStats() {
  const user = await getCurrentUser();
  if (!user) return { total: 0, active: 0, closed: 0, applicantsTotal: 0 };
  try {
    return await request(`/api/my/jobs/stats`, {
      cache: "no-store",
      recruiterId: user.id,
    });
  } catch {
    // Stats endpoint is optional — fall back to empty shape so the page renders.
    return { total: 0, active: 0, closed: 0, applicantsTotal: 0 };
  }
}

export async function createRecruiterJob(jobData) {
  const user = await requireRecruiter();
  const { recruiterId: _strip, ...rest } = jobData ?? {};
  const payload = { ...rest, recruiterId: user.id };

  const result = await request("/api/my/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
    recruiterId: user.id,
  });
  revalidateTag("jobs");
  return result;
}

export async function updateRecruiterJob(jobId, jobData) {
  const user = await requireRecruiter();
  const { recruiterId: _strip, ...rest } = jobData ?? {};
  const payload = { ...rest, recruiterId: user.id };

  const result = await request(`/api/my/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    recruiterId: user.id,
  });
  revalidateTag("jobs");
  revalidateTag(`job:${jobId}`);
  return result;
}

export async function updateRecruiterJobStatus(jobId, status) {
  const user = await requireRecruiter();

  const result = await request(`/api/my/jobs/${jobId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    recruiterId: user.id,
  });
  revalidateTag("jobs");
  revalidateTag(`job:${jobId}`);
  return result;
}

export async function deleteRecruiterJob(jobId) {
  const user = await requireRecruiter();

  const result = await request(`/api/my/jobs/${jobId}`, {
    method: "DELETE",
    recruiterId: user.id,
  });
  revalidateTag("jobs");
  revalidateTag(`job:${jobId}`);
  return result;
}
