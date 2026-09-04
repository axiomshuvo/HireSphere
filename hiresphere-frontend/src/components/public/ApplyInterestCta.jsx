"use client";

import { Clock, Globe, ArrowRight } from "@gravity-ui/icons";
import Link from "next/link";
import ApplyButton from "./ApplyButton";

export default function ApplyInterestCta({ jobId, jobTitle, companySlug, recruiterId, initialApplied = false }) {
  return (
    <div className="mt-8 rounded-2xl border border-default bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.18),transparent_60%),linear-gradient(180deg,#16181c,#0f1013)] p-6 text-center">
      <Clock className="mx-auto size-8 text-indigo-500" />
      <h2 className="mt-3 text-xl font-semibold text-foreground">
        Interested in this role?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Apply in under a minute. We&apos;ll send your profile to the recruiter.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <ApplyButton
          jobId={jobId}
          jobTitle={jobTitle}
          companySlug={companySlug}
          recruiterId={recruiterId}
          initialApplied={initialApplied}
          className="px-5 py-2.5"
        />
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-xl border border-default-200 bg-default-100 px-5 py-2.5 text-sm text-foreground transition-colors hover:border-indigo-500/50"
        >
          Browse more roles
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
