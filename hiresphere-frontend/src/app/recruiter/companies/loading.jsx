function CompanyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-(color-border) bg-(color-surface) p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(color-surface-2)">
          <div className="size-5 rounded-full bg-(color-surface-2)" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="h-4 w-3/4 rounded" />
          <div className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="h-3 w-full rounded" />
        <div className="h-3 w-2/3 rounded" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-3 w-16 rounded" />
        <div className="h-3 w-12 rounded" />
      </div>
    </div>
  );
}

export default function MyCompanyLoading() {
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-4 rounded bg-(color-surface-2)" />
              <div className="h-5 w-20 rounded bg-(color-surface-2)" />
            </div>
            <div className="h-8 w-48 rounded bg-(color-surface-2) mt-1" />
            <div className="h-4 w-72 rounded bg-(color-surface-2) mt-1" />
          </div>
          <div className="h-10 w-36 rounded-lg bg-(color-surface-2)" />
        </header>

        {/* Company Card Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>

        {/* Pagination strip */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-8 w-20 rounded bg-(color-surface-2)" />
          <div className="h-4 w-16 rounded bg-(color-surface-2)" />
          <div className="h-8 w-16 rounded bg-(color-surface-2)" />
        </div>
      </div>
    </div>
  );
}
