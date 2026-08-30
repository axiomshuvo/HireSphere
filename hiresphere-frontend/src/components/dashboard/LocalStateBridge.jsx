"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { saveJob } from "@/lib/actions/saved-jobs";
import { applyToJob } from "@/lib/actions/applications";
import {
  appliedJobsKey,
  migrateLegacyKeys,
  savedJobsKey,
} from "@/lib/storage-keys";

function readSet(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeSet(key, set) {
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

/**
 * Mounts on dashboard pages. Pushes any localStorage-only entries
 * to the backend via server actions (which carry proper auth), then
 * clears them from localStorage once the server confirms. Server
 * actions are idempotent: a duplicate save returns `alreadySaved`.
 */
export default function LocalStateBridge() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    migrateLegacyKeys(userId);
    const savedKey = savedJobsKey(userId);
    const appliedKey = appliedJobsKey(userId);

    (async () => {
      const local = readSet(savedKey);
      if (local.size === 0) return;
      let synced = 0;
      for (const jobId of local) {
        try {
          await saveJob({ jobId, title: null, companySlug: null });
          local.delete(jobId);
          synced += 1;
        } catch {
          // keep in local so we retry next time
        }
      }
      writeSet(savedKey, local);
      window.dispatchEvent(new Event("hiresphere:savedJobs-changed"));
      if (synced > 0) router.refresh();
    })();

    (async () => {
      const local = readSet(appliedKey);
      if (local.size === 0) return;
      let synced = 0;
      for (const jobId of local) {
        try {
          await applyToJob({
            jobId,
            name: session.user.name || "Applicant",
            email: session.user.email || "",
          });
          local.delete(jobId);
          synced += 1;
        } catch {
          // keep for retry
        }
      }
      writeSet(appliedKey, local);
      window.dispatchEvent(new Event("hiresphere:appliedJobs-changed"));
      if (synced > 0) router.refresh();
    })();
  }, [session?.user?.id, router]);

  return null;
}
