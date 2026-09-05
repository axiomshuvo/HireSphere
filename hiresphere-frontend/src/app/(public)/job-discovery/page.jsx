import { Card } from "@heroui/react";
import Link from "next/link";

const steps = [
  {
    title: "Search active roles",
    text: "Use keywords, category, type, and location filters on the job board. Only active, public roles are listed.",
  },
  {
    title: "Open the detail page",
    text: "Every listing shows salary range, work mode, deadline, responsibilities, and the hiring company.",
  },
  {
    title: "Save or apply",
    text: "Bookmark roles for later or apply with your profile. Seekers track everything from the dashboard.",
  },
];

export default function JobDiscoveryPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Product
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Job discovery
      </h1>
      <p className="mt-2 max-w-xl text-sm text-(color-text-muted)">
        Find open roles fast — search, filter, and follow the ones that fit.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Card
            key={s.title}
            className="rounded-2xl border border-(color-border) bg-(color-surface) p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
              Step {i + 1}
            </p>
            <h2 className="mt-2 font-semibold text-(color-text)">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-(color-text-muted)">
              {s.text}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/jobs"
          className="inline-flex h-11 items-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
        >
          Browse open roles
        </Link>
        <Link
          href="/company"
          className="inline-flex h-11 items-center rounded-xl border border-(color-border) bg-(color-surface-2) px-5 text-sm font-medium text-(color-text) hover:border-indigo-500/50 transition-colors"
        >
          Explore companies
        </Link>
      </div>
    </div>
  );
}
