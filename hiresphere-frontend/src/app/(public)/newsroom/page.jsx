import { Card } from "@heroui/react";
import Link from "next/link";

const posts = [
  {
    date: "Sep 2026",
    title: "HireSphere launches public job board",
    text: "Seekers can now discover, save, and apply to active roles, while recruiters manage companies and applicants from one dashboard.",
  },
  {
    date: "Aug 2026",
    title: "Recruiter dashboard goes live",
    text: "Company profiles, job posting with plan limits, applicant tracking, and role-aware access ship together.",
  },
  {
    date: "Jul 2026",
    title: "Subscription plans arrive",
    text: "Seeker and recruiter tiers with Stripe checkout, plan limits, and upgrade flows across the platform.",
  },
];

export default function NewsroomPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Resources
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Newsroom
      </h1>
      <p className="mt-2 max-w-xl text-sm text-(color-text-muted)">
        Milestones and updates from the HireSphere team.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {posts.map((p) => (
          <Card
            key={p.title}
            className="rounded-2xl border border-(color-border) bg-(color-surface) p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
              {p.date}
            </p>
            <h2 className="mt-1 font-semibold text-(color-text)">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-(color-text-muted)">
              {p.text}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/contact"
          className="inline-flex h-11 items-center rounded-xl border border-(color-border) bg-(color-surface-2) px-5 text-sm font-medium text-(color-text) hover:border-indigo-500/50 transition-colors"
        >
          Press inquiries
        </Link>
      </div>
    </div>
  );
}
