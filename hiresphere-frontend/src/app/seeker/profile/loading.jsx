function ProfileCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-(color-border) bg-(color-surface) overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-(color-surface-2) to-(color-surface-2)" />
      <div className="-mt-10 px-6 pb-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-20 shrink-0 rounded-full border-2 border-(color-bg) bg-(color-surface-2)" />
            <div className="space-y-2">
              <div className="h-7 w-40 rounded bg-(color-surface-2)" />
              <div className="h-3 w-32 rounded bg-(color-surface-2)" />
            </div>
          </div>
          <div className="h-6 w-16 rounded-full bg-(color-surface-2)" />
        </div>
        <div className="mt-4 space-y-1">
          <div className="h-5 w-32 rounded bg-(color-surface-2)" />
          <div className="h-3 w-40 rounded bg-(color-surface-2)" />
        </div>
      </div>
    </div>
  );
}

function SnapshotCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-(color-border) bg-(color-surface) p-6 sm:p-8">
      <div className="h-5 w-36 rounded bg-(color-surface-2)" />
      <div className="mt-5 flex flex-col divide-y divide-(color-border)">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 first:pt-0">
            <div className="size-4 shrink-0 rounded bg-(color-surface-2)" />
            <div className="min-w-0 space-y-1">
              <div className="h-2 w-12 rounded bg-(color-surface-2)" />
              <div className="h-3 w-24 rounded bg-(color-surface-2)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-(color-border) bg-(color-surface) p-6">
      <div className="h-5 w-28 rounded bg-(color-surface-2)" />
      <div className="mt-4 h-4 w-56 rounded bg-(color-surface-2)" />
      <div className="mt-2 h-4 w-40 rounded bg-(color-surface-2)" />
      <div className="mt-4 h-3 w-full rounded bg-(color-surface-2)" />
      <div className="mt-4 h-4 w-16 rounded bg-(color-surface-2)" />
    </div>
  );
}

function PersonalDetailsSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-(color-border) bg-(color-surface) p-6 sm:p-8">
      <div className="mb-6 border-b border-(color-border) pb-5">
        <div className="h-6 w-36 rounded bg-(color-surface-2)" />
        <div className="mt-1 h-3 w-56 rounded bg-(color-surface-2)" />
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="h-2 w-8 rounded bg-(color-surface-2)" />
          <div className="h-10 w-full rounded-lg bg-(color-surface-2)" />
        </div>
        <div className="space-y-1">
          <div className="h-2 w-10 rounded bg-(color-surface-2)" />
          <div className="h-10 w-full rounded-lg bg-(color-surface-2)" />
        </div>
      </div>
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Header */}
        <div className="mb-2">
          <div className="h-2 w-40 rounded bg-(color-surface-2)" />
          <div className="mt-2 h-8 w-44 rounded bg-(color-surface-2)" />
          <div className="mt-2 h-3 w-72 rounded bg-(color-surface-2)" />
        </div>

        <ProfileCardSkeleton />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <SnapshotCardSkeleton />
          <PlanCardSkeleton />
        </div>

        <PersonalDetailsSkeleton />
      </div>
    </div>
  );
}
