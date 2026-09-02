"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function updateProfileImage(imageUrl) {
  const trimmed = String(imageUrl ?? "").trim();

  const result = await auth.api.updateUser({
    body: { image: trimmed },
    headers: await headers(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return result;
}

export async function updateProfileEmail(email) {
  const trimmed = String(email ?? "").trim();
  if (!trimmed) {
    throw new Error("Email is required");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Invalid email format");
  }

  const result = await auth.api.updateUser({
    body: { email: trimmed },
    headers: await headers(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return result;
}

export async function updateProfileName(name) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) {
    throw new Error("Name is required");
  }
  if (trimmed.length > 80) {
    throw new Error("Name must be 80 characters or fewer");
  }

  const result = await auth.api.updateUser({
    body: { name: trimmed },
    headers: await headers(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return result;
}

export async function updateProfilePlan(plan) {
  const allowed = ["free", "pro", "growth", "enterprise", "premium"];
  const trimmed = String(plan ?? "")
    .trim()
    .toLowerCase();
  if (!allowed.includes(trimmed)) {
    throw new Error("Invalid plan");
  }

  const result = await auth.api.updateUser({
    body: { plan: trimmed },
    headers: await headers(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/pricing");

  return result;
}
