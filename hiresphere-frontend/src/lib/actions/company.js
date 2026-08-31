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

export async function fetchPublicCompanies({ page = 1, pageSize = 12 } = {}) {
  const qs = buildQuery({ page, pageSize });
  return request(`/api/companies${qs}`, { tags: ["companies"] });
}

export async function fetchPublicCompanyById(companyId) {
  return request(`/api/companies/${companyId}`, {
    tags: [`company:${companyId}`, "companies"],
  });
}

export async function getRecruiterCompany(companyId) {
  const user = await getCurrentUser();
  if (!user) return null;
  return request(`/api/my/companies/${companyId}`, {
    tags: [`company:${companyId}`, "companies"],
    recruiterId: user.id,
  });
}

export async function getRecruiterCompanies({ page = 1, pageSize = 12 } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], page: 1, pageSize, total: 0, totalPages: 0 };
  const qs = buildQuery({ page, pageSize });
  return request(`/api/my/companies${qs}`, {
    tags: ["companies"],
    recruiterId: user.id,
  });
}

export async function getRecruiterCompanyStats() {
  const user = await getCurrentUser();
  if (!user) return { total: 0 };
  try {
    return await request(`/api/my/companies/stats`, {
      tags: ["companies"],
      revalidate: STATS_REVALIDATE_SECONDS,
      recruiterId: user.id,
    });
  } catch {
    // Stats endpoint is optional — fall back to empty shape so the page renders.
    return { total: 0 };
  }
}

export async function createRecruiterCompany(companyData) {
  const user = await requireRecruiter();
  const { recruiterId: _strip, ...rest } = companyData ?? {};
  const payload = { ...rest, recruiterId: user.id };

  const result = await request("/api/my/companies", {
    method: "POST",
    body: JSON.stringify(payload),
    recruiterId: user.id,
  });
  revalidateTag("companies");
  revalidateTag("jobs");
  return result;
}

export async function updateRecruiterCompany(companyId, companyData) {
  const user = await requireRecruiter();
  const { recruiterId: _strip, ...rest } = companyData ?? {};
  const payload = { ...rest, recruiterId: user.id };

  const result = await request(`/api/my/companies/${companyId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    recruiterId: user.id,
  });
  revalidateTag("companies");
  revalidateTag(`company:${companyId}`);
  return result;
}

export async function deleteRecruiterCompany(companyId) {
  const user = await requireRecruiter();

  const result = await request(`/api/my/companies/${companyId}`, {
    method: "DELETE",
    recruiterId: user.id,
  });
  revalidateTag("companies");
  revalidateTag("jobs");
  return result;
}
