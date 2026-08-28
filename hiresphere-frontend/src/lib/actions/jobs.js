"use server";

import { revalidateTag } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const REVALIDATE_SECONDS = 30;

async function request(path, { tags, ...options } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: REVALIDATE_SECONDS, tags },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchJobs() {
  return request("/api/jobs", { tags: ["jobs"] });
}

export async function fetchJob(jobId) {
  return request(`/api/jobs/${jobId}`, { tags: [`job:${jobId}`, "jobs"] });
}

export async function createJob(jobData) {
  const result = await request("/api/jobs", {
    method: "POST",
    body: JSON.stringify(jobData),
  });
  revalidateTag("jobs");
  return result;
}

export async function updateJob(jobId, jobData) {
  const result = await request(`/api/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(jobData),
  });
  revalidateTag("jobs");
  revalidateTag(`job:${jobId}`);
  return result;
}

export async function updateJobStatus(jobId, status) {
  const result = await request(`/api/jobs/${jobId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  revalidateTag("jobs");
  revalidateTag(`job:${jobId}`);
  return result;
}

export async function deleteJob(jobId) {
  const result = await request(`/api/jobs/${jobId}`, { method: "DELETE" });
  revalidateTag("jobs");
  return result;
}
