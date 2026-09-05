"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Account
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-(color-text-muted)">
        Enter your account email and we&apos;ll send you reset instructions.
      </p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-(color-border) bg-(color-surface) p-6 text-center">
          <p className="font-medium text-(color-text)">Check your inbox</p>
          <p className="mt-2 text-sm text-(color-text-muted)">
            If an account exists for {email}, reset instructions are on the
            way.
          </p>
          <Link
            href="/auth/signin"
            className="mt-4 inline-block text-sm font-semibold text-indigo-500 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-(color-border) bg-(color-surface) p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="reset-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(color-text-muted)"
            >
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="w-full rounded-xl border border-(color-border) bg-(color-surface-2) px-4 py-2.5 text-sm text-(color-text) placeholder-(color-text-muted) focus:border-indigo-500/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
          >
            Send reset link
          </button>
        </form>
      )}
    </div>
  );
}
