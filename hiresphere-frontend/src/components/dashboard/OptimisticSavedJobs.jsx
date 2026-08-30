"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@heroui/react";
import { TrashBin } from "@gravity-ui/icons";
import { unsaveJob } from "@/lib/actions/saved-jobs";
import { toast } from "@heroui/react";
import { useSession } from "@/lib/auth-client";
import {
  migrateLegacyKeys,
  savedJobsKey,
} from "@/lib/storage-keys";

function readLocal(key) {
  if (typeof window === "undefined" || !key) return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeLocal(key, set) {
  if (typeof window === "undefined" || !key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new Event("hiresphere:savedJobs-changed"));
  } catch {
    // ignore
  }
}

export default function OptimisticSavedJobs({ serverJobIds }) {
  const { data: session } = useSession();
  const [localIds, setLocalIds] = useState(() => new Set());
  const [hiddenIds, setHiddenIds] = useState(() => new Set());
  const [serverVersion, setServerVersion] = useState(0);

  const userId = session?.user?.id;
  const lsKey = userId ? savedJobsKey(userId) : null;

  // Read localStorage on mount + whenever the cross-component event fires.
  useEffect(() => {
    if (!lsKey) return undefined;
    migrateLegacyKeys(userId);
    function sync() {
      setLocalIds(readLocal(lsKey));
    }
    sync();
    window.addEventListener("hiresphere:savedJobs-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hiresphere:savedJobs-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [lsKey, userId]);

  // Re-compute when the parent's serverJobIds changes (after a server
  // revalidation brings in newly-synced entries). We track version, not
  // the Set itself, so we can re-evaluate even if Set reference is stable.
  useEffect(() => {
    setServerVersion((v) => v + 1);
  }, [serverJobIds]);

  // Optimistic = in localStorage but NOT yet on the server.
  const optimisticIds = useMemo(() => {
    const extras = new Set();
    for (const id of localIds) {
      if (!serverJobIds?.has(id)) extras.add(id);
    }
    return extras;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localIds, serverVersion]);

  async function handleRemove(jobId) {
    if (!lsKey) return;
    const local = readLocal(lsKey);
    local.delete(jobId);
    writeLocal(lsKey, local);
    setLocalIds(new Set(local));
    setHiddenIds((prev) => new Set(prev).add(jobId));
    try {
      await unsaveJob(jobId);
    } catch (error) {
      const rolled = readLocal(lsKey);
      rolled.add(jobId);
      writeLocal(lsKey, rolled);
      setLocalIds(new Set(rolled));
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      toast.warning("Could not remove", { description: error?.message ?? "Unknown error" });
    }
  }

  if (optimisticIds.size === 0) return null;
  const visible = Array.from(optimisticIds).filter((id) => !hiddenIds.has(id));
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((jobId) => (
        <OptimisticCard
          key={jobId}
          jobId={jobId}
          onRemove={() => handleRemove(jobId)}
        />
      ))}
    </>
  );
}

function OptimisticCard({ jobId, onRemove }) {
  return (
    <Card className="flex h-full flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/jobs/${jobId}`}
            className="block truncate text-lg font-semibold text-white transition-colors hover:text-indigo-300"
          >
            Syncing…
          </Link>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            Saving to your list
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
          New
        </span>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-default pt-3">
        <span className="text-xs text-muted-foreground">Just saved</span>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-red-500/50 hover:text-red-300"
        >
          <TrashBin className="size-3.5" />
          Remove
        </button>
      </div>
    </Card>
  );
}
