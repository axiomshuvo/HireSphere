const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getCompanyJobs = async (companySlug, status = "active") => {
  const res = await fetch(
    `${baseUrl}/api/jobs?companySlug=${encodeURIComponent(companySlug)}&status=${status}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  return res.json();
};
