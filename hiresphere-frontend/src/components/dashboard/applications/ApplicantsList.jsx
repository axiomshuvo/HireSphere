"use client";

import RelativeTime from "@/components/shared/RelativeTime";
import { Calendar, Envelope, Smartphone, Wallet } from "@gravity-ui/icons";
import { Card, Chip } from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
];

function getAppliedTime(applicant) {
  if (!applicant?.appliedAt) return 0;
  const t = new Date(applicant.appliedAt).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default function ApplicantsList({ applicants, total }) {
  const [sortId, setSortId] = useState("newest");

  const sorted = useMemo(() => {
    const copy = [...applicants];
    copy.sort((a, b) => {
      const diff = getAppliedTime(b) - getAppliedTime(a);
      return sortId === "oldest" ? -diff : diff;
    });
    return copy;
  }, [applicants, sortId]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          Showing {sorted.length} of {total}{" "}
          {total === 1 ? "candidate" : "candidates"}
        </span>
        <div className="flex items-center gap-2">
          <label
            htmlFor="applicants-sort"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Sort
          </label>
          <select
            id="applicants-sort"
            value={sortId}
            onChange={(e) => setSortId(e.target.value)}
            className="cursor-pointer rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sorted.map((applicant, index) => {
        const initials = (applicant.name || "?")
          .split(" ")
          .map((part) => part[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const isNewest =
          sortId === "newest" && index === 0 && applicant.appliedAt;
        return (
          <Card
            key={applicant._id ?? applicant.id}
            className="rounded-2xl border border-default bg-content1 p-5 transition-colors hover:border-indigo-500/40"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-default text-sm font-semibold text-default-foreground">
                {initials || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/dashboard/recruiter/applications/${applicant._id ?? applicant.id}`}
                    className="text-base font-semibold text-white transition-colors hover:text-indigo-200"
                  >
                    {applicant.name || "Unnamed candidate"}
                  </Link>
                  <Chip color="primary" size="sm" variant="soft">
                    {applicant.status === "submitted"
                      ? "Submitted"
                      : (applicant.status ?? "Submitted")[0].toUpperCase() +
                        (applicant.status ?? "Submitted").slice(1)}
                  </Chip>
                  {isNewest && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      Newest
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Envelope className="size-3" />
                    <a
                      href={`mailto:${applicant.email}`}
                      className="text-indigo-300 transition-colors hover:text-indigo-200"
                    >
                      {applicant.email}
                    </a>
                  </span>
                  {applicant.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Smartphone className="size-3" />
                      {applicant.phone}
                    </span>
                  )}
                  {applicant.expectedSalary ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Wallet className="size-3" />
                      Expected $
                      {Number(applicant.expectedSalary).toLocaleString()}
                    </span>
                  ) : null}
                  {applicant.appliedAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3" />
                      Applied <RelativeTime iso={applicant.appliedAt} />
                    </span>
                  )}
                </div>
                {applicant.jobTitle && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Role: {applicant.jobTitle}
                  </p>
                )}
                <Link
                  href={`/dashboard/recruiter/applications/${applicant._id ?? applicant.id}`}
                  className="mt-3 inline-flex text-xs font-semibold text-indigo-300 transition-colors hover:text-indigo-200"
                >
                  View full application →
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
