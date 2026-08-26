const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_CLIENT_URI;

export const getCompanyJobs = async (companyId, status = "active") => {
  const res = await fetch(
    `${baseUrl}/api/jobs?companyId=${companyId}&status=${status}`,
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
