function SavedJobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-(color-border) bg-(color-surface) p-5 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded" />
          <div className="h-3 w-1/2 rounded" />
        </div>
        <div className="h-5 w-5 rounded bg-(color-surface-2)" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="h-3 w-1/3 rounded" />
        <div className="h-3 w-1/4 rounded" />
      </div>
    </div>
  );
}

export default function SavedJobsLoading() {
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-8 w-40 rounded bg-(color-surface-2)" />
            <div className="h-4 w-64 rounded bg-(color-surface-2) mt-1" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-(color-border) bg-(color-surface-2) px-4 py-2">
            <div className="h-4 w-4 rounded" />
            <div className="h-4 w-20 rounded" />
          </div>
        </header>

        {/* Saved Job Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <SavedJobCardSkeleton key={i} />
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
