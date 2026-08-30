"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@heroui/react";
import { Briefcase, Calendar, MapPin, TrashBin, Wallet } from "@gravity-ui/icons";
import DeadlineCountdown from "@/components/shared/DeadlineCountdown";
import { unsaveJob } from "@/lib/actions/saved-jobs";
import { toast } from "@heroui/react";

const LS_KEY = "hiresphere:savedJobs";

function readLocal() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeLocal(set) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new Event("hiresphere:savedJobs-changed"));
  } catch {
    // ignore
  }
}

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
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SavedJobCard({ saved, job }) {
  const [hidden, setHidden] = useState(false);
  const [removing, setRemoving] = useState(false);

  const salary = job ? formatSalary(job) : null;
  const location = job ? formatLocation(job) : null;
  const savedDate = formatSavedDate(saved.savedAt);
  const displayTitle = job?.title ?? saved.title ?? "Untitled role";
  const displayCompany = job?.companySlug ?? saved.companySlug;

  async function handleRemove() {
    if (removing) return;
    setRemoving(true);

    // Optimistic: remove from localStorage + hide the card immediately.
    const local = readLocal();
    local.delete(saved.jobId);
    writeLocal(local);
    setHidden(true);
    window.dispatchEvent(new Event("hiresphere:savedJobs-changed"));

    try {
      await unsaveJob(saved.jobId);
      window.dispatchEvent(new Event("hiresphere:savedJobs-changed"));
      toast.success("Removed from saved jobs");
    } catch (error) {
      // Roll back on failure.
      const rolled = readLocal();
      rolled.add(saved.jobId);
      writeLocal(rolled);
      setHidden(false);
      window.dispatchEvent(new Event("hiresphere:savedJobs-changed"));
      toast.warning("Could not remove", { description: error?.message ?? "Unknown error" });
    } finally {
      setRemoving(false);
    }
  }

  if (hidden) return null;

  return (
    <Card
      className="flex h-full flex-col gap-3 rounded-2xl border border-default bg-content1 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {job ? (
            <Link
              href={`/jobs/${saved.jobId}`}
              className="block truncate text-lg font-semibold text-white transition-colors hover:text-indigo-300"
            >
              {displayTitle}
            </Link>
          ) : (
            <span className="block truncate text-lg font-semibold text-white">
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {job.type && <span>{job.type}</span>}
          {location && <span>• {location}</span>}
          {salary && <span>• {salary}</span>}
          {job.deadline && (
            <span className="inline-flex items-center gap-1.5">
              • <Calendar className="size-3" />
              Closes{" "}
              {new Date(job.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          This role is no longer listed.
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-default pt-3">
        {savedDate && (
          <span className="text-xs text-muted-foreground">
            Saved {savedDate}
          </span>
        )}
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-red-500/50 hover:text-red-300 disabled:opacity-60"
        >
          <TrashBin className="size-3.5" />
          {removing ? "Removing…" : "Remove"}
        </button>
      </div>
    </Card>
  );
}
