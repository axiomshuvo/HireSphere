"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${name || "website visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:support@hire-sphere.ai?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Support
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Contact
      </h1>
      <p className="mt-2 text-sm text-(color-text-muted)">
        Questions, feedback, or partnership ideas — we read everything at{" "}
        <span className="font-medium text-(color-text)">
          support@hire-sphere.ai
        </span>
        .
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-(color-border) bg-(color-surface) p-6 space-y-4"
      >
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-sm font-medium text-(color-text)"
          >
            Name
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="w-full rounded-xl border border-(color-border) bg-(color-surface-2) px-4 py-2.5 text-sm text-(color-text) placeholder-(color-text-muted) focus:border-indigo-500/40 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-sm font-medium text-(color-text)"
          >
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-(color-border) bg-(color-surface-2) px-4 py-2.5 text-sm text-(color-text) placeholder-(color-text-muted) focus:border-indigo-500/40 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-sm font-medium text-(color-text)"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            placeholder="How can we help?"
            className="w-full rounded-xl border border-(color-border) bg-(color-surface-2) px-4 py-2.5 text-sm text-(color-text) placeholder-(color-text-muted) focus:border-indigo-500/40 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
        >
          Send message
        </button>
        {sent && (
          <p className="text-sm text-(color-text-muted)">
            Opening your email app — we&apos;ll reply within 2 business days.
          </p>
        )}
      </form>
    </div>
  );
}
