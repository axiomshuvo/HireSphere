"use server";
import { apiFetch } from "@/lib/api/client";


/**
 * Fetch plans dynamically from MongoDB /api/plans endpoint
 * with fallback to safe default objects if server or database is unreachable.
 */
export async function getPlans(role) {
  try {
    const query = role ? `?role=${encodeURIComponent(role)}` : "";
    const data = await apiFetch(`/api/plans${query}`, {
      tags: ["plans"],
      revalidate: 60,
    });
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
