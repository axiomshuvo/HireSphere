"use server";

import { getPlans } from "@/lib/actions/plans";
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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const trimmed = String(plan ?? "")
    .trim()
    .toLowerCase();

  // Validate against database plans
  const allPlans = (await getPlans(session.user.role)) || [];
  const isValidPlan = allPlans.some(
    (p) => p.planId === trimmed || p.id === trimmed,
  );

  if (!isValidPlan) {
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

export async function verifyStripePayment(sessionId) {
  if (!sessionId) {
    throw new Error("No session ID provided");
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const res = await fetch(`${baseUrl}/api/my/subscriptions/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-recruiter-id": session.user.id,
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to verify subscription");
    }

    const data = await res.json();

    // Update better-auth user so the UI reflects it instantly
    if (data.planId) {
      await auth.api.updateUser({
        body: { plan: data.planId },
        headers: await headers(),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/pricing");

    return { success: true, plan: data.planId };
  } catch (error) {
    console.error("Stripe Verification Error:", error);
    throw new Error("Failed to verify payment");
  }
}
