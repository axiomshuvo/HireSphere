"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, Chip } from "@heroui/react";
import { Clock, FileText } from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";
import {
  appliedJobsKey,
  migrateLegacyKeys,
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

export default function OptimisticApplications({ serverJobIds }) {
  const { data: session } = useSession();
  const [localIds, setLocalIds] = useState(() => new Set());
  const [serverVersion, setServerVersion] = useState(0);

  const userId = session?.user?.id;
  const lsKey = userId ? appliedJobsKey(userId) : null;

  useEffect(() => {
    if (!lsKey) return undefined;
    migrateLegacyKeys(userId);
    function sync() {
      setLocalIds(readLocal(lsKey));
    }
    sync();
    window.addEventListener("hiresphere:appliedJobs-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hiresphere:appliedJobs-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [lsKey, userId]);

  useEffect(() => {
    setServerVersion((v) => v + 1);
  }, [serverJobIds]);

  const optimisticIds = useMemo(() => {
    const extras = new Set();
    for (const id of localIds) {
      if (!serverJobIds?.has(id)) extras.add(id);
    }
    return extras;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localIds, serverVersion]);

  if (optimisticIds.size === 0) return null;

  return (
    <>
      {Array.from(optimisticIds).map((jobId) => (
        <Card
          key={jobId}
          className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5"
        >
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/jobs/${jobId}`}
                  className="truncate text-lg font-semibold text-white transition-colors hover:text-indigo-300"
                >
                  Syncing…
                </Link>
                <Chip color="primary" size="sm" variant="soft">
                  <Clock className="size-3" />
                  Submitted
                </Chip>
                <Chip color="success" size="sm" variant="soft">
                  New
                </Chip>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Saving your application
              </p>
            </div>
            <Link
              href={`/jobs/${jobId}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-indigo-500/50 hover:text-white"
            >
              View job
            </Link>
          </div>
        </Card>
      ))}
    </>
  );
}
