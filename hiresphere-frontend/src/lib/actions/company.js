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

export async function fetchCompanies() {
  return request("/api/companies", { tags: ["companies"] });
}

export async function createCompany(companyData) {
  const result = await request("/api/companies", {
    method: "POST",
    body: JSON.stringify(companyData),
  });
  revalidateTag("companies");
  revalidateTag("jobs");
  return result;
}

export async function updateCompany(companySlug, companyData) {
  const result = await request(`/api/companies/${companySlug}`, {
    method: "PUT",
    body: JSON.stringify(companyData),
  });
  revalidateTag("companies");
  return result;
}

export async function deleteCompany(companySlug) {
  const result = await request(`/api/companies/${companySlug}`, {
    method: "DELETE",
  });
  revalidateTag("companies");
  revalidateTag("jobs");
  return result;
}
