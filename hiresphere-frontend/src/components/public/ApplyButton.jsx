"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ApplyJobModal from "./ApplyJobModal";
import { ArrowRight, Check } from "@gravity-ui/icons";
import { fetchApplicationForJob } from "@/lib/actions/applications";
import {
  appliedJobsKey,
  migrateLegacyKeys,
} from "@/lib/storage-keys";

function readLocalApplied(key) {
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

export default function ApplyButton({ jobId, jobTitle, companySlug, className = "" }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const userId = session?.user?.id;
  const lsKey = appliedJobsKey(userId);
  const isSeeker = session?.user?.role === "seeker";

  // Hydrate from localStorage IMMEDIATELY on mount (synchronous, no
  // waiting on useSession). Then reconcile with the server in the
  // background so the button never flashes a wrong state.
  useEffect(() => {
    if (!isSeeker) {
      setHydrated(true);
      setApplied(false);
      return;
    }

    migrateLegacyKeys(userId);
    const local = readLocalApplied(lsKey);
    if (local.has(jobId)) setApplied(true);
    setHydrated(true);

    if (isPending || !userId) return;
    let cancelled = false;
    fetchApplicationForJob(jobId)
      .then((app) => {
        if (cancelled) return;
        if (app?.status) setApplied(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [jobId, userId, isSeeker, isPending, lsKey]);

  // Cross-component sync: ApplyJobModal writes to localStorage on submit.
  useEffect(() => {
    if (!isSeeker || !lsKey) return undefined;
    function sync() {
      const local = readLocalApplied(lsKey);
      setApplied(local.has(jobId));
    }
    window.addEventListener("hiresphere:appliedJobs-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hiresphere:appliedJobs-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [jobId, lsKey, isSeeker]);

  if (hydrated && applied) {
    return (
      <Link href="/dashboard/applications"
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-500/60 lg:w-auto ${className}`}>
        <Check className="size-4" /> Applied — view applications
      </Link>
    );
  }

  // Only show "Loading…" if localStorage hasn't been read yet.
  if (!hydrated) {
    return (
      <button type="button" disabled
        className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-muted-foreground/60 lg:w-auto ${className}`}>
        Loading…
      </button>
    );
  }

  if (hydrated && session?.user && session.user.role !== "seeker") {
    return (
      <button type="button" disabled
        title="Switch to a seeker account to apply"
        className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-muted-foreground/60 lg:w-auto ${className}`}>
        Recruiter accounts can&apos;t apply
      </button>
    );
  }

  const handleClick = () => {
    if (!session?.user) {
      const next = encodeURIComponent(window.location.pathname);
      router.push(`/auth/signin?next=${next}`);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button type="button" onClick={handleClick}
        className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-200 lg:w-auto ${className}`}>
        Apply now <ArrowRight className="size-4" />
      </button>
      <ApplyJobModal jobId={jobId} jobTitle={jobTitle} companySlug={companySlug} open={open} onClose={() => setOpen(false)} onApplied={() => { setApplied(true); setOpen(false); }} />
    </>
  );
}
