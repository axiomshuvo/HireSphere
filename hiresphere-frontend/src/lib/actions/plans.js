"use server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Fetch plans dynamically from MongoDB /api/plans endpoint
 * with fallback to safe default objects if server or database is unreachable.
 */
export async function getPlans(role) {
  try {
    const query = role ? `?role=${encodeURIComponent(role)}` : "";
    const res = await fetch(`${baseUrl}/api/plans${query}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60, tags: ["plans"] },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch plans: ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn(
      "Could not fetch plans from backend, using default fallback:",
      err.message,
    );
  }

  return null;
}
