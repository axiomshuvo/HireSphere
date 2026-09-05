"use client";

import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import { unsaveJob } from "@/lib/actions/saved-jobs";
import {
  Bookmark,
  Calendar,
  MapPin,
  TrashBin,
  Wallet,
} from "@gravity-ui/icons";
import { Card, toast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatLocation(job) {
  if (job?.remote) return "Remote";
  const parts = [job?.city, job?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function formatSalary(job) {
  if (!job?.salaryMin || !job?.salaryMax) return null;
  return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
}

function formatSavedDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SavedJobCard({ saved, job }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  const salary = job ? formatSalary(job) : null;
  const location = job ? formatLocation(job) : null;
  const savedDate = formatSavedDate(saved.savedAt);
  const displayTitle = job?.title ?? saved.title ?? "Untitled role";
  const displayCompany = job?.companySlug ?? saved.companySlug;

  async function handleRemove() {
    if (removing) return;
    setRemoving(true);
    try {
      await unsaveJob(saved.jobId);
      toast.success("Removed from saved jobs");
      router.refresh();
    } catch (error) {
      toast.warning("Could not remove", {
        description: error?.message ?? "Unknown error",
      });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-default bg-content1 transition-colors hover:border-amber-500/40">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-transparent" />
      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
            <Bookmark className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            {job ? (
              <Link
                href={`/jobs/${saved.jobId}`}
                className="block truncate text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-amber-600"
              >
                {displayTitle}
              </Link>
            ) : (
              <span className="block truncate text-lg font-semibold text-foreground">
                {displayTitle}
              </span>
            )}
            {displayCompany && (
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {displayCompany}
              </p>
            )}
          </div>
          <DeadlineCountdown deadline={job?.deadline} />
        </div>

        {job ? (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {job.type && (
              <span className="rounded-lg bg-default px-2.5 py-1.5">
                {job.type}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-default px-2.5 py-1.5">
                <MapPin className="size-3.5 text-amber-500" />
                {location}
              </span>
            )}
            {salary && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-default px-2.5 py-1.5">
                <Wallet className="size-3.5 text-amber-500" />
                {salary}
              </span>
            )}
            {job.deadline && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-amber-500" />
                Closes{" "}
                {new Date(job.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        ) : (
          <p className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-200">
            This role is no longer listed.
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4">
          <span className="text-xs text-muted-foreground">
            {savedDate ? `Saved ${savedDate}` : "Saved job"}
          </span>
          <div className="flex items-center gap-2">
            {job && (
              <Link
                href={`/jobs/${saved.jobId}`}
                className="inline-flex items-center rounded-lg border border-default bg-content1 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-amber-500/50"
              >
                View job
              </Link>
            )}
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-content1 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-red-500/50 hover:text-red-300 disabled:opacity-60"
            >
              <TrashBin className="size-3.5" />
              {removing ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
