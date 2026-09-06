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

export async function fetchPublicCompanies({ page = 1, pageSize = 12 } = {}) {
  const qs = buildQuery({ page, pageSize });
  return apiFetch(`/api/companies${qs}`, { tags: ["companies"] });
}

export async function fetchPublicCompanyById(companyId) {
  return apiFetch(`/api/companies/${companyId}`, {
    tags: [`company:${companyId}`, "companies"],
  });
}

export async function getRecruiterCompanies({ page = 1, pageSize = 12 } = {}) {
  const user = await getCurrentUser();
  if (!user) return { items: [], page: 1, pageSize, total: 0, totalPages: 0 };
  const qs = buildQuery({ page, pageSize });
  return apiFetch(`/api/my/companies${qs}`, {
    tags: ["companies"],
    requireAuth: true
  });
}

export async function getRecruiterCompanyStats() {
  const user = await getCurrentUser();
  if (!user) return { total: 0 };
  try {
    return await apiFetch(`/api/my/companies/stats`, {
      tags: ["companies"],
      requireAuth: true
    });
  } catch {
    return undefined;
  }
}

export async function createRecruiterCompany(companyData) {
  const user = await requireRecruiter();
  const { recruiterId: _strip, ...rest } = companyData ?? {};
  const payload = { ...rest, requireAuth: true };

  const result = await apiFetch("/api/my/companies", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: true
  });
  revalidateTag("companies");
  revalidateTag("jobs");
  return result;
}

export async function updateRecruiterCompany(companyId, companyData) {
  const user = await requireRecruiter();
  const { recruiterId: _strip, ...rest } = companyData ?? {};
  const payload = { ...rest, requireAuth: true };

  const result = await apiFetch(`/api/my/companies/${companyId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    requireAuth: true
  });
  revalidateTag("companies");
  revalidateTag(`company:${companyId}`);
  revalidateTag("jobs");
  return result;
}

export async function deleteRecruiterCompany(companyId) {
  const user = await requireRecruiter();

  const result = await apiFetch(`/api/my/companies/${companyId}`, {
    method: "DELETE",
    requireAuth: true
  });
  revalidateTag("companies");
  revalidateTag("jobs");
  revalidateTag(`company:${companyId}`);
  return result;
}

// Server-side ImgBB orphan cleanup: prefer this over the client-side
// deleteImage() when replacing a logo/cover, so orphans don't depend on
// a fire-and-forget browser fetch.
export async function deleteStoredImage(deleteUrl) {
  const user = await requireRecruiter();
  if (!deleteUrl) return { ok: true, skipped: true };
  return apiFetch("/api/my/images/delete", {
    method: "POST",
    body: JSON.stringify({ deleteUrl }),
    requireAuth: true
  });
}
