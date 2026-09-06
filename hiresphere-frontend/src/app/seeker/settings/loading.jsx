function SettingsCardSkeleton({ rows = 3 }) {
  return (
    <div className="animate-pulse rounded-2xl border border-(color-border) bg-(color-surface) p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(color-surface-2)" />
        <div className="min-w-0 space-y-1 flex-1">
          <div className="h-5 w-28 rounded bg-(color-surface-2)" />
          <div className="h-3 w-48 rounded bg-(color-surface-2)" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4 first:pt-0">
            <div className="space-y-1">
              <div className="h-3 w-24 rounded bg-(color-surface-2)" />
              <div className="h-2 w-40 rounded bg-(color-surface-2)" />
            </div>
            <div className="h-5 w-16 rounded bg-(color-surface-2)" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl animate-pulse">
        {/* Header */}
        <header className="mb-8">
          <div className="h-2 w-40 rounded bg-(color-surface-2)" />
          <div className="mt-2 h-7 w-24 rounded bg-(color-surface-2)" />
          <div className="mt-2 h-3 w-80 rounded bg-(color-surface-2)" />
        </header>

        {/* Account card + Settings card */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
          <SettingsCardSkeleton rows={1} />
          <SettingsCardSkeleton rows={2} />
        </div>

        {/* Full-screen settings sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SettingsCardSkeleton rows={2} />
          <SettingsCardSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}
