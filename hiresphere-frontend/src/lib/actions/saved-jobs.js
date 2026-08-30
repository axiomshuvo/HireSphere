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

export async function fetchSavedJobs({ page = 1, pageSize = 12 } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], page: 1, pageSize, total: 0, totalPages: 0 };
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  try {
    return await request(`/api/my/saved-jobs?${params.toString()}`, {
      tags: ["saved-jobs"],
      recruiterId: user.id,
    });
  } catch (error) {
    console.warn(
      `[fetchSavedJobs] failed:`,
      error?.message ?? error,
    );
    return { items: [], page, pageSize, total: 0, totalPages: 0 };
  }
}

// Server actions for RSC form handlers.
export async function saveJob({ jobId, title, companySlug }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to save jobs");
  const result = await request("/api/my/saved-jobs", {
    method: "POST",
    body: JSON.stringify({ jobId, title, companySlug }),
    recruiterId: user.id,
  });
  revalidateTag("saved-jobs");
  revalidatePath("/dashboard/saved-jobs");
  return result;
}

export async function unsaveJob(jobId) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to manage saved jobs");
  const result = await request(`/api/my/saved-jobs/${encodeURIComponent(jobId)}`, {
    method: "DELETE",
    recruiterId: user.id,
  });
  revalidateTag("saved-jobs");
  revalidatePath("/dashboard/saved-jobs");
  return result;
}
