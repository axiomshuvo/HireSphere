"use client";

import { toast } from "@heroui/react";

export function roleLabel(role) {
  if (role === "recruiter") return "Recruiter";
  if (role === "seeker") return "Job Seeker";
  return "Member";
}

export function displayName(user, fallback = "there") {
  const name = user?.name?.trim();
  if (name) return name.split(" ")[0];
  const email = user?.email ?? "";
  if (email.includes("@")) return email.split("@")[0];
  return fallback;
}

// Map raw auth errors to human text — never surface backend internals.
export function friendlyAuthError(error, fallback) {
  const raw = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  if (!raw.trim()) return fallback;
  if (
    raw.includes("already exists") ||
    raw.includes("duplicate") ||
    raw.includes("user already registered")
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (
    raw.includes("not found") ||
    raw.includes("does not exist") ||
    raw.includes("no account") ||
    raw.includes("invalid email")
  ) {
    return "No account found with this email. Check the address or create an account.";
  }
  if (
    raw.includes("incorrect") ||
    raw.includes("wrong password") ||
    raw.includes("invalid password") ||
    raw.includes("credential")
  ) {
    return "Incorrect email or password. Please try again.";
  }
  if (raw.includes("password") && raw.includes("weak")) {
    return "That password is too weak. Use at least 6 characters.";
  }
  if (
    raw.includes("network") ||
    raw.includes("fetch") ||
    raw.includes("failed to fetch")
  ) {
    return "A network error occurred. Check your connection and try again.";
  }
  return fallback;
}

export const authToasts = {
  signInSuccess(user) {
    const name = displayName(user);
    const role = user?.role;
    toast.success(`Welcome back, ${name}!`, {
      description:
        role === "recruiter" || role === "seeker"
          ? `Signed in as ${roleLabel(role)}. Redirecting to your dashboard...`
          : "Signed in successfully. Redirecting to your dashboard...",
    });
  },
  signInFailed(error) {
    toast.danger("Sign in failed", {
      description: friendlyAuthError(
        error,
        "Incorrect email or password. Please try again.",
      ),
    });
  },
  signUpSuccess({ name, role }) {
    const first = (name ?? "").trim().split(" ")[0] || "there";
    toast.success(`Welcome to HireSphere, ${first}!`, {
      description: `Your ${roleLabel(role)} account is ready. Redirecting to your dashboard...`,
    });
  },
  signUpFailed(error) {
    toast.danger("Registration failed", {
      description: friendlyAuthError(
        error,
        "Could not create your account. Please check your details and try again.",
      ),
    });
  },
  networkError() {
    toast.danger("Network error", {
      description: "A network error occurred. Check your connection and try again.",
    });
  },
  signedOut(user) {
    const name = displayName(user, null);
    toast.info("Signed out", {
      description: name
        ? `See you soon, ${name}.`
        : "You have been signed out securely.",
    });
  },
};
