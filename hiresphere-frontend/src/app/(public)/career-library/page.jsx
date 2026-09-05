import { Card } from "@heroui/react";
import Link from "next/link";

const guides = [
  {
    title: "Write a resume that gets read",
    text: "One page per 10 years of experience, quantified outcomes, skills matched to the listing.",
  },
  {
    title: "Interview with confidence",
    text: "Research the company, prepare STAR stories, and ask about team, growth, and success metrics.",
  },
  {
    title: "Negotiate your offer",
    text: "Anchor on market ranges, consider total compensation, and get the final offer in writing.",
  },
  {
    title: "Go remote the right way",
    text: "Show async communication skills, overlap hours, and a track record of independent delivery.",
  },
];

export default function CareerLibraryPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Resources
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Career library
      </h1>
      <p className="mt-2 max-w-xl text-sm text-(color-text-muted)">
        Practical guides for every stage of the job hunt.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {guides.map((g) => (
          <Card
            key={g.title}
            className="rounded-2xl border border-(color-border) bg-(color-surface) p-5"
          >
            <h2 className="font-semibold text-(color-text)">{g.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-(color-text-muted)">
              {g.text}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/jobs"
          className="inline-flex h-11 items-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
        >
          Put it into practice
        </Link>
      </div>
    </div>
  );
}
