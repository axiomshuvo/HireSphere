"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Check } from "@gravity-ui/icons";
import { fetchSavedJobs, saveJob, unsaveJob } from "@/lib/actions/saved-jobs";
import { toast } from "@heroui/react";
import {
  migrateLegacyKeys,
  savedJobsKey,
} from "@/lib/storage-keys";

function getLsKey(userId) {
  return savedJobsKey(userId);
}

function readLocalSavedJobs(key) {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeLocalSavedJobs(key, set) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
    // Notify same-tab listeners (storage event doesn't fire for own writes).
    window.dispatchEvent(new Event("hiresphere:savedJobs-changed"));
  } catch {
    // ignore quota / disabled storage
  }
}

export default function SaveJobButton({ jobId, title, companySlug, className = "" }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const userId = session?.user?.id;
  const lsKey = getLsKey(userId);
  const isSeeker = session?.user?.role === "seeker";

  // Hydrate from localStorage IMMEDIATELY on mount (synchronous, no
  // waiting on useSession). Then reconcile with the server in the
  // background — but ADD server-confirmed entries to localStorage
  // rather than replacing, so any optimistic saves stay intact even
  // if multiple buttons mount at the same time.
  useEffect(() => {
    if (!isSeeker) {
      // Non-seekers (recruiters, admins) and unauthenticated users
      // never read or write the saved-jobs cache — there's no point.
      setHydrated(true);
      setSaved(false);
      return;
    }

    migrateLegacyKeys(userId);
    const local = readLocalSavedJobs(lsKey);
    if (local.has(jobId)) setSaved(true);
    setHydrated(true);

    if (!userId) return;
    let cancelled = false;
    fetchSavedJobs({ pageSize: 100 })
      .then((result) => {
        if (cancelled) return;
        const items = Array.isArray(result) ? result : result?.items ?? [];
        const serverSet = new Set(items.map((i) => i.jobId));
        // Read current localStorage again — it may have changed since
        // mount (user clicked save on another job in the meantime).
        // ADD server entries to current local; never remove.
        const current = readLocalSavedJobs(lsKey);
        let changed = false;
        for (const id of serverSet) {
          if (!current.has(id)) {
            current.add(id);
            changed = true;
          }
        }
        if (changed) writeLocalSavedJobs(lsKey, current);
        setSaved(current.has(jobId));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [jobId, userId, isSeeker, lsKey]);

  // Cross-component sync: if another button changed local state, re-read.
  useEffect(() => {
    if (!isSeeker || !lsKey) return undefined;
    function sync() {
      const local = readLocalSavedJobs(lsKey);
      setSaved(local.has(jobId));
    }
    window.addEventListener("hiresphere:savedJobs-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hiresphere:savedJobs-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [jobId, lsKey, isSeeker]);

  // Already saved — link to saved jobs list.
  if (hydrated && saved) {
    return (
      <Link
        href="/dashboard/saved-jobs"
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-500/60 lg:w-auto ${className}`}
      >
        <Check className="size-4" />
        Saved — view saved jobs
      </Link>
    );
  }

  // Only show "Loading…" if localStorage hasn't been read yet. Once
  // hydrated (always sync on mount), we know the saved state — even
  // if useSession is still resolving.
  if (!hydrated) {
    return (
      <button type="button" disabled
        className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-muted-foreground/60 lg:w-auto ${className}`}>
        <Bookmark className="size-4" /> Loading…
      </button>
    );
  }

  if (session?.user && session.user.role !== "seeker") {
    return (
      <button type="button" disabled
        title="Switch to a seeker account to save"
        className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-muted-foreground/60 lg:w-auto ${className}`}>
        <Bookmark className="size-4" /> Recruiter accounts can&apos;t save
      </button>
    );
  }

  const handleToggle = async () => {
    if (!session?.user) {
      const next = encodeURIComponent(window.location.pathname);
      router.push(`/auth/signin?next=${next}`);
      return;
    }
    if (!isSeeker) return; // recruiters/admins can't save
    const wasSaved = saved;
    // Optimistic local update — instant UI feedback.
    const local = readLocalSavedJobs(lsKey);
    if (wasSaved) local.delete(jobId);
    else local.add(jobId);
    writeLocalSavedJobs(lsKey, local);
    setSaved(!wasSaved);

    setSaving(true);
    try {
      if (wasSaved) {
        await unsaveJob(jobId);
      } else {
        await saveJob({ jobId, title, companySlug });
      }
      // Re-dispatch after server confirms so other components re-read.
      window.dispatchEvent(new Event("hiresphere:savedJobs-changed"));
      toast.success(wasSaved ? "Removed from saved jobs" : "Saved to your list");
    } catch (error) {
      // Roll back optimistic update on failure.
      const rolled = readLocalSavedJobs(lsKey);
      if (wasSaved) rolled.add(jobId);
      else rolled.delete(jobId);
      writeLocalSavedJobs(lsKey, rolled);
      setSaved(wasSaved);
      window.dispatchEvent(new Event("hiresphere:savedJobs-changed"));
      toast.warning("Could not update saved jobs", { description: error?.message ?? "Unknown error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <button type="button" onClick={handleToggle} disabled={saving}
      className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed lg:w-auto ${className}`}>
      <Bookmark className="size-4" />
      {saving ? "Saving…" : "Save job"}
    </button>
  );
}
