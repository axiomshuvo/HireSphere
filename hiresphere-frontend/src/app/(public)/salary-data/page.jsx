import { Card } from "@heroui/react";
import Link from "next/link";

export default function SalaryDataPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Product
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Salary data
      </h1>
      <p className="mt-2 max-w-xl text-sm text-(color-text-muted)">
        Transparent pay ranges on every listing — know what a role offers before
        you apply.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-5">
          <h2 className="font-semibold text-(color-text)">
            Ranges on listings
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-(color-text-muted)">
            Most roles show a minimum–maximum range with currency, so you can
            compare offers across companies, locations, and work modes.
          </p>
        </Card>
        <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-5">
          <h2 className="font-semibold text-(color-text)">
            Filter-friendly fields
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-(color-text-muted)">
            Ranges are stored as structured data (min, max, currency), which
            keeps listings comparable instead of free-text guesses.
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <Link
          href="/jobs"
          className="inline-flex h-11 items-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
        >
          Browse roles with salaries
        </Link>
      </div>
    </div>
  );
}
