"use client";

import { saveJob, unsaveJob } from "@/lib/actions/saved-jobs";
import { useSession } from "@/lib/auth-client";
import { Bookmark, Check } from "@gravity-ui/icons";
import { toast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SaveJobButton({
  jobId,
  title,
  companySlug,
  recruiterId,
  initialSaved = false,
  className = "",
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const role = session?.user?.role;
  const isSeeker = role === "seeker";
  const isVisitor = !isPending && !session?.user;
  const [saved, setSaved] = useState(initialSaved);

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
        <Bookmark className="size-4" />
        Save job
      </Link>
    );
  }

  if (!isSeeker) {
    return (
      <button
        type="button"
        disabled
        title="Only job seekers can save jobs"
        className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-muted-foreground/60 lg:w-auto ${className}`}
      >
        <Bookmark className="size-4" />
        Only seekers can save
      </button>
    );
  }

  if (saved) {
    return (
      <div className={`flex w-full flex-col gap-2 lg:w-auto ${className}`}>
        <Link
          href="/dashboard/saved-jobs"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-500 transition-colors hover:border-emerald-500/60 lg:w-auto"
        >
          <Check className="size-4" />
          Saved — view saved jobs
        </Link>
        <button
          type="button"
          onClick={async () => {
            try {
              await unsaveJob(jobId);
              setSaved(false);
              toast.success("Removed from saved jobs");
              router.refresh();
            } catch (error) {
              toast.warning("Could not remove", {
                description: error?.message ?? "Unknown error",
              });
            }
          }}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-default-200 bg-default-100 px-6 py-3 text-xs text-muted-foreground transition-colors hover:text-foreground lg:w-auto"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await saveJob({ jobId, title, companySlug, recruiterId });
          setSaved(true);
          toast.success("Saved to your list");
          router.refresh();
        } catch (error) {
          toast.warning("Could not save job", {
            description: error?.message ?? "Unknown error",
          });
        }
      }}
      className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-200 lg:w-auto ${className}`}
    >
      <Bookmark className="size-4" />
      Save job
    </button>
  );
}
