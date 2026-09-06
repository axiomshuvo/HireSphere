"use server";

import { getCurrentUser } from "@/lib/core/session";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const REVALIDATE_SECONDS = 30;

/**
 * Single unified fetch wrapper for the backend.
 * Automatically injects the internal service secret to prevent spoofing,
 * and sets the x-recruiter-id (which is really just the user ID for both roles).
 */
export async function apiFetch(path, { tags, revalidate, requireAuth = path.startsWith("/api/my/"), actor = null, ...options } = {}) {
  let user = null;
  if (requireAuth) {
    try {
      user = await getCurrentUser();
    } catch {
      user = null;
    }
    if (!user) throw new Error("Unauthorized: You must be signed in.");
  }

  const headers = {
    "Content-Type": "application/json",
    // Server-to-server gate: the Express backend checks this header
    // (requireAdmin reads x-admin-secret; x-recruiter-id paths use it too).
    "x-admin-secret": process.env.ADMIN_SECRET_KEY,
  };
  
  if (user) {
    headers["x-recruiter-id"] = user.id; // Backend uses this for both seekers and recruiters
  }

  // Admin actor attribution (backend records it in audit_log).
  if (actor) {
    headers["x-admin-actor-id"] = actor.id;
    headers["x-admin-actor-name"] = actor.name ?? actor.email ?? "";
    headers["x-admin-actor-role"] = actor.role ?? "";
  }

  // Next.js Cache Control
  const cacheDirective = path.startsWith("/api/my/") || path.startsWith("/api/admin/")
    ? { cache: "no-store" }
    : { next: { revalidate: revalidate ?? REVALIDATE_SECONDS, tags } };

  try {
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
  } catch (error) {
    // Prevent stack trace leaks
    if (error.name === "TypeError" && error.message === "fetch failed") {
      throw new Error("Backend service is currently unreachable.");
    }
    throw error;
  }
}
