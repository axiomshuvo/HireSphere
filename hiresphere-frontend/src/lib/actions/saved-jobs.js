"use server";
import { apiFetch } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/core/session";
import { revalidatePath, revalidateTag } from "next/cache";


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


export async function fetchSavedJobs({ page = 1, pageSize = 12 } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], page: 1, pageSize, total: 0, totalPages: 0 };
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  try {
    const result = await apiFetch(`/api/my/saved-jobs?${params.toString()}`, {
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
  const result = await apiFetch("/api/my/saved-jobs", {
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
  const result = await apiFetch(
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
