// Per-user localStorage keys for client-side saved/applied job state.
// Each account gets its own set so that signing out and back in as a
// different user on the same browser doesn't leak the previous user's
// optimistic state.

const LEGACY_SAVED = "hiresphere:savedJobs";
const LEGACY_APPLIED = "hiresphere:appliedJobs";

function safeStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function savedJobsKey(userId) {
  return `hiresphere:savedJobs:${userId ?? "anon"}`;
}

export function appliedJobsKey(userId) {
  return `hiresphere:appliedJobs:${userId ?? "anon"}`;
}

// One-time migration from the old single-user keys into the new
// per-user keys. Idempotent — running it twice is a no-op.
export function migrateLegacyKeys(userId) {
  if (!userId) return;
  const storage = safeStorage();
  if (!storage) return;
  for (const [oldKey, newKey] of [
    [LEGACY_SAVED, savedJobsKey(userId)],
    [LEGACY_APPLIED, appliedJobsKey(userId)],
  ]) {
    const oldRaw = storage.getItem(oldKey);
    if (oldRaw == null) continue;
    if (storage.getItem(newKey) == null) {
      storage.setItem(newKey, oldRaw);
    }
    storage.removeItem(oldKey);
  }
}

// Clear every saved/applied entry for the current user (or everyone
// if no userId is given). Called on sign-out so the next user on the
// same browser starts with a clean slate.
export function clearUserJobState(userId) {
  const storage = safeStorage();
  if (!storage) return;
  const toRemove = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key) continue;
    if (key === LEGACY_SAVED || key === LEGACY_APPLIED) {
      toRemove.push(key);
      continue;
    }
    if (key.startsWith("hiresphere:savedJobs:") || key.startsWith("hiresphere:appliedJobs:")) {
      if (!userId || key.endsWith(`:${userId}`)) {
        toRemove.push(key);
      }
    }
  }
  for (const key of toRemove) storage.removeItem(key);
}
