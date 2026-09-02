function ApplicationCardSkeleton() {
  return (
    <div className="rounded-2xl border border-(color-border) bg-(color-surface) p-5 animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="h-4 w-3/4 rounded" />
          <div className="h-3 w-1/2 rounded mt-1" />
        </div>
        <div className="h-5 w-16 rounded bg-(color-surface-2)" />
      </div>
      <div className="mt-2 space-y-1">
        <div className="h-3 w-full rounded" />
        <div className="h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}

export default function ApplicationsLoading() {
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-(color-surface-2)" />
            <div className="h-4 w-72 rounded bg-(color-surface-2) mt-1" />
          </div>
          <div className="h-10 w-36 rounded-lg border border-(color-border) bg-(color-surface-2)" />
        </header>

        {/* Application Cards */}
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          <div className="h-8 w-20 rounded bg-(color-surface-2)" />
          <div className="h-4 w-16 rounded bg-(color-surface-2)" />
          <div className="h-8 w-16 rounded bg-(color-surface-2)" />
        </div>
      </div>
    </div>
  );
}
