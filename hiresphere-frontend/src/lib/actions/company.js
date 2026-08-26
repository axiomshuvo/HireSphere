"use server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchCompanies() {
  return request("/api/companies");
}

export async function createCompany(companyData) {
  return request("/api/companies", {
    method: "POST",
    body: JSON.stringify(companyData),
  });
}

export async function updateCompany(companyId, companyData) {
  return request(`/api/companies/${companyId}`, {
    method: "PUT",
    body: JSON.stringify(companyData),
  });
}

export async function deleteCompany(companyId) {
  return request(`/api/companies/${companyId}`, { method: "DELETE" });
}
