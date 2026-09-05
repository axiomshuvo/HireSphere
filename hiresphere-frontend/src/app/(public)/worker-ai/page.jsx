import { Card } from "@heroui/react";
import Link from "next/link";

const features = [
  {
    title: "Smart matching",
    text: "Roles are ranked by skills, experience level, and work mode so the most relevant openings surface first.",
  },
  {
    title: "Application tracking",
    text: "Every application keeps its status — submitted, reviewed, shortlisted — visible in your dashboard.",
  },
  {
    title: "Recruiter insights",
    text: "Recruiters see applicant counts and role performance, keeping both sides of hiring in sync.",
  },
];

export default function WorkerAiPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Product
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Worker AI
      </h1>
      <p className="mt-2 max-w-xl text-sm text-(color-text-muted)">
        Our product vision: an AI-native layer that makes talent discovery feel
        less painful and a lot more powerful.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <Card
            key={f.title}
            className="rounded-2xl border border-(color-border) bg-(color-surface) p-5"
          >
            <h2 className="font-semibold text-(color-text)">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-(color-text-muted)">
              {f.text}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/pricing"
          className="inline-flex h-11 items-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
        >
          See plans
        </Link>
        <Link
          href="/jobs"
          className="inline-flex h-11 items-center rounded-xl border border-(color-border) bg-(color-surface-2) px-5 text-sm font-medium text-(color-text) hover:border-indigo-500/50 transition-colors"
        >
          Try the job board
        </Link>
      </div>
    </div>
  );
}
