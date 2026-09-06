function ApplicantRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-(color-border) bg-(color-surface) p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 rounded-full bg-(color-surface-2)" />
          <div className="space-y-1">
            <div className="h-4 w-32 rounded" />
            <div className="h-3 w-48 rounded" />
          </div>
        </div>
        <div className="h-5 w-12 rounded bg-(color-surface-2)" />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="h-3 w-16 rounded" />
        <div className="h-3 w-20 rounded" />
        <div className="h-3 w-24 rounded" />
      </div>
    </div>
  );
}

export default function RecruiterApplicationsLoading() {
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded bg-(color-surface-2)" />
            <div className="h-7 w-20 rounded bg-(color-surface-2)" />
          </div>
          <div className="h-4 w-56 rounded bg-(color-surface-2)" />
        </header>

        {/* Filter form */}
        <div className="rounded-2xl border border-(color-border) bg-(color-surface) p-4 animate-pulse">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-3 w-12 rounded" />
            <div className="h-10 w-64 rounded-lg bg-(color-surface-2)" />
            <div className="h-8 w-16 rounded-lg bg-(color-surface-2)" />
          </div>
        </div>

        {/* Applicant list */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <ApplicantRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
