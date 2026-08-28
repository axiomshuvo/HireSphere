import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: no active session");
  return user;
}

export async function requireRecruiter() {
  const user = await requireCurrentUser();
  if (user.role !== "recruiter") {
    throw new Error("Forbidden: recruiter role required");
  }
  return user;
}
