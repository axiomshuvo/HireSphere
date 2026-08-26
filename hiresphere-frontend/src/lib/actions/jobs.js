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

export async function fetchJobs() {
  return request("/api/jobs");
}

export async function fetchJob(jobId) {
  return request(`/api/jobs/${jobId}`);
}

export async function createJob(jobData) {
  return request("/api/jobs", {
    method: "POST",
    body: JSON.stringify(jobData),
  });
}

export async function updateJob(jobId, jobData) {
  return request(`/api/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(jobData),
  });
}

export async function updateJobStatus(jobId, status) {
  return request(`/api/jobs/${jobId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteJob(jobId) {
  return request(`/api/jobs/${jobId}`, { method: "DELETE" });
}
