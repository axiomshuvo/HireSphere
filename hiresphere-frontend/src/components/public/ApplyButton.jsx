"use client";

import { useSession } from "@/lib/auth-client";
import { ArrowRight, Check } from "@gravity-ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ApplyJobModal from "./ApplyJobModal";

export default function ApplyButton({
  jobId,
  jobTitle,
  companySlug,
  recruiterId,
  initialApplied = false,
  className = "",
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const role = session?.user?.role;
  const isSeeker = role === "seeker";
  const isVisitor = !isPending && !session?.user;
  const [applied, setApplied] = useState(initialApplied);
  const [open, setOpen] = useState(false);

  if (isPending) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex w-full cursor-wait items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-muted-foreground/60 lg:w-auto ${className}`}
      >
        Checking account...
      </button>
    );
  }

  if (isVisitor) {
    const next = encodeURIComponent(`/jobs/${jobId}`);
    return (
      <Link
        href={`/auth/signin?next=${next}`}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-200 lg:w-auto ${className}`}
      >
        Apply now <ArrowRight className="size-4" />
      </Link>
    );
  }

  if (!isSeeker) {
    return (
      <button
        type="button"
        disabled
        title="Only job seekers can apply"
        className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-muted-foreground/60 lg:w-auto ${className}`}
      >
        Only seekers can apply <ArrowRight className="size-4" />
      </button>
    );
  }

  if (applied) {
    return (
      <Link
        href="/dashboard/applications"
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-500/60 lg:w-auto ${className}`}
      >
        <Check className="size-4" />
        Applied — view applications
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-200 lg:w-auto ${className}`}
      >
        Apply now <ArrowRight className="size-4" />
      </button>
      <ApplyJobModal
        jobId={jobId}
        jobTitle={jobTitle}
        companySlug={companySlug}
        recruiterId={recruiterId}
        open={open}
        onClose={() => setOpen(false)}
        onApplied={() => {
          setApplied(true);
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
