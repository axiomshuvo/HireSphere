"use server";

import { getCurrentUser } from "@/lib/core/session";
import { revalidatePath, revalidateTag } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const REVALIDATE_SECONDS = 30;

// Accept any common list shape the backend might return. The contract
// isn't documented, so we look for items / data / savedJobs / applications
// / results in that order, and fall back to treating the response itself
// as the list when it's already an array.
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

async function request(
  path,
  { tags: extraTags, revalidate, recruiterId, ...options } = {},
) {
  const headers = { "Content-Type": "application/json" };
  if (recruiterId) headers["x-recruiter-id"] = recruiterId;

  // Per-user endpoints must bypass Next's data cache: the cache key is
  // URL-only and does NOT include x-recruiter-id, so a cached response
  // for one user would be served to another. The /api/my/* routes are
  // always per-user; everything else is public.
  const cacheDirective = path.startsWith("/api/my/")
    ? { cache: "no-store" }
    : {
        next: { revalidate: revalidate ?? REVALIDATE_SECONDS, tags: extraTags },
      };

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

export async function fetchSavedJobs({ page = 1, pageSize = 12 } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], page: 1, pageSize, total: 0, totalPages: 0 };
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  try {
    const result = await request(`/api/my/saved-jobs?${params.toString()}`, {
      tags: ["saved-jobs"],
      recruiterId: user.id,
    });
    return normalizeList(result, "saved-jobs");
  } catch (error) {
    console.warn(`[fetchSavedJobs] failed:`, error?.message ?? error);
    return { items: [], page, pageSize, total: 0, totalPages: 0 };
  }
}

// Server actions for RSC form handlers.
export async function saveJob({ jobId, title, companySlug, recruiterId }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to save jobs");
  const result = await request("/api/my/saved-jobs", {
    method: "POST",
    body: JSON.stringify({ jobId, title, companySlug }),
    recruiterId: user.id,
  });
  revalidateTag("saved-jobs");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/saved-jobs");
  revalidatePath(`/jobs/${jobId}`);
  return result;
}

export async function unsaveJob(jobId) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to manage saved jobs");
  const result = await request(
    `/api/my/saved-jobs/${encodeURIComponent(jobId)}`,
    {
      method: "DELETE",
      recruiterId: user.id,
    },
  );
  revalidateTag("saved-jobs");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/saved-jobs");
  revalidatePath(`/jobs/${jobId}`);
  return result;
}
