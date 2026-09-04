"use client";

import {
  Briefcase,
  Copy,
  Envelope,
  FileText,
  House,
  LifeRing,
  Lock,
  Magnifier,
  MapPin,
  Star,
  Wallet,
  Xmark,
} from "@gravity-ui/icons";
import { Card } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";

// ── Searchable FAQ items ────────────────────────────────────
const faqs = [
  {
    id: "apply-job",
    category: "Job Applications",
    icon: Briefcase,
    q: "How do I apply for a job?",
    a: "Click the 'Apply' button on any job listing. Fill out the application form, upload your resume, and submit. You can track your application status in the Applications page.",
  },
  {
    id: "resume-upload",
    category: "Job Applications",
    icon: FileText,
    q: "What resume formats are accepted?",
    a: "We accept PDF, DOC, and DOCX files up to 5 MB. PDFs are recommended to preserve formatting.",
  },
  {
    id: "saved-jobs",
    category: "Job Applications",
    icon: Star,
    q: "Can I save jobs for later?",
    a: "Yes — click the bookmark icon on any job listing to save it. Access your saved jobs from the Saved Jobs page in your dashboard.",
  },
  {
    id: "password",
    category: "Account",
    icon: Lock,
    q: "How do I change my password?",
    a: "Go to Settings → Account, then click 'Change password'. You'll receive an email to verify the change.",
  },
  {
    id: "profile-visibility",
    category: "Account",
    icon: House,
    q: "Can I make my profile private?",
    a: "Yes. In Settings → Privacy, you can control who sees your profile, activity, and contact information.",
  },
  {
    id: "salary-insights",
    category: "Pricing",
    icon: Wallet,
    q: "Are salary insights included?",
    a: "Salary ranges are shown on job listings for most roles. Full salary benchmarking and personalized insights are available on Pro plans.",
  },
  {
    id: "remote-jobs",
    category: "Job Applications",
    icon: MapPin,
    q: "How do I find remote-only jobs?",
    a: "Use the location filter on the jobs page and select 'Remote'. You can combine it with job title and salary filters.",
  },
];

const quickLinks = [
  { href: "/dashboard/saved-jobs", icon: Star, label: "Saved jobs" },
  {
    href: "/dashboard/applications",
    icon: Briefcase,
    label: "My applications",
  },
  { href: "/settings", icon: Lock, label: "Account settings" },
  { href: "/dashboard/profile", icon: House, label: "Edit profile" },
];

const AccordionItem = ({ faq }) => {
  const Icon = faq.icon;
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 pb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 text-left transition-opacity hover:opacity-85"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.02] ring-1 ring-white/5">
          <Icon className="size-4 text-indigo-500" />
        </div>
        <span className="flex-1 text-left font-medium text-(color-text)">
          {faq.q}
        </span>
        <Xmark
          className={`size-4 text-(color-text-muted) transition-transform duration-200 ${
            open ? "rotate-180 opacity-100" : "opacity-50"
          }`}
        />
      </button>
      {open && (
        <div className="mt-3 pl-13 text-sm text-(color-text-muted)">
          {faq.a}
        </div>
      )}
    </div>
  );
};

function FaqCategory({ category, items }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-(color-text-muted)">
        {category}
      </h3>
      <div className="space-y-2.5">
        {items.map((faq) => (
          <AccordionItem key={faq.id} faq={faq} />
        ))}
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const categories = [...new Set(faqs.map((f) => f.category))];
  const filtered = search
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase()),
      )
    : faqs;
  const grouped = categories.map((cat) => ({
    category: cat,
    items: filtered.filter((f) => f.category === cat),
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hero */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
          <LifeRing className="size-3.5 text-indigo-500" />
          Help & Support
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
          Help center
        </h1>
        <p className="mt-2 max-w-lg text-sm text-(color-text-muted)">
          Find answers to common questions, manage your account, and get help
          from our support team.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Magnifier
          className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-(color-text-muted)"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search help articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-(color-border) bg-(color-surface-2) py-3.5 pl-12 pr-4 text-sm text-(color-text) placeholder-(color-text-muted) focus:border-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        {search && filtered.length === 0 && (
          <p className="mt-2 text-xs text-(color-text-muted)">
            No articles match your search.{" "}
            <Link
              href="/dashboard/help"
              className="text-indigo-500 hover:text-indigo-600"
              onClick={() => setSearch("")}
            >
              Clear search
            </Link>
          </p>
        )}
      </div>

      {/* Quick links */}
      {/* <Card className="mb-8 rounded-2xl border border-(color-border) bg-(color-surface-2) p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-(color-text-muted)">
          Quick links
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center transition-all duration-200 hover:border-indigo-500/30 hover:bg-white/[0.04]"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <link.icon className="size-4 text-indigo-500" />
              </div>
              <span className="text-xs font-medium text-(color-text)">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </Card> */}

      {/* FAQ */}
      {grouped
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <FaqCategory
            key={group.category}
            category={group.category}
            items={group.items}
          />
        ))}

      {/* Contact support */}
      <Card className="mt-10 rounded-2xl border border-(color-border) bg-(color-surface-2) p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15">
            <Envelope className="size-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-(color-text)">
              Can&apos;t find what you need?
            </h2>
            <p className="text-sm text-(color-text-muted)">
              Contact our support team for anything else.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <span className="text-(color-text-muted)">Email</span>
            <span className="font-medium text-(color-text)">
              support@hire-sphere.ai
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <span className="text-(color-text-muted)">Support hours</span>
            <span className="font-medium text-(color-text)">
              Mon–Fri · 9am–6pm UTC
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("support@hire-sphere.ai");
              }}
              className="flex items-center gap-2 text-left"
            >
              <Copy className="size-4 text-indigo-500" />
              Copy support email
            </button>
            <span className="text-xs text-(color-text-muted)">
              Click to copy
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
