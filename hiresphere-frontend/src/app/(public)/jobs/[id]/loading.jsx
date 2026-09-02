import SkeletonBlock from "@/components/shared/Skeleton";
import { Avatar, Card } from "@heroui/react";

function BadgeSkeleton() {
  return <SkeletonBlock className="h-5 w-10 rounded-full" />;
}

export default function JobDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-8">
      <SkeletonBlock className="h-4 w-36 rounded mb-4" />

      {/* Hero */}
      <section className="relative mt-4 rounded-3xl border border-(color-border) bg-[linear-gradient(180deg,var(--surface-tertiary),var(--surface-secondary))] p-6 lg:p-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <BadgeSkeleton />
              <BadgeSkeleton />
              <BadgeSkeleton />
            </div>

            <SkeletonBlock className="h-9 w-3/4 rounded sm:h-10 sm:w-4/5 lg:h-12 lg:w-2/3" />

            <div className="mt-2 flex items-center gap-2">
              <Avatar.Root className="size-5 shrink-0 rounded">
                <Avatar.Fallback>
                  <SkeletonBlock className="size-5 rounded" />
                </Avatar.Fallback>
              </Avatar.Root>
              <SkeletonBlock className="h-4 w-24 rounded" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              <SkeletonBlock className="h-4 w-20 rounded" />
              <SkeletonBlock className="h-4 w-16 rounded" />
              <SkeletonBlock className="h-4 w-28 rounded" />
            </div>

            <SkeletonBlock className="mt-4 h-5 w-32 rounded" />
          </div>

          <div className="flex shrink-0 flex-col gap-2 lg:items-end">
            <SkeletonBlock className="h-10 w-36 rounded-xl" />
            <SkeletonBlock className="h-10 w-36 rounded-xl" />
            <SkeletonBlock className="h-10 w-36 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Body grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border border-(color-border) bg-(color-surface) p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <SkeletonBlock className="size-8 shrink-0 rounded-lg" />
                <SkeletonBlock className="h-4 w-20 rounded" />
              </div>
              <SkeletonBlock className="h-4 w-full rounded mb-1" />
              <SkeletonBlock className="h-4 w-full rounded mb-1" />
              <SkeletonBlock className="h-4 w-3/4 rounded" />
            </Card>
          ))}
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-5">
            <SkeletonBlock className="h-4 w-24 rounded mb-3" />
            <div className="flex items-center gap-3 mb-3">
              <SkeletonBlock className="size-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-5 w-3/4 rounded mb-1" />
                <SkeletonBlock className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <SkeletonBlock className="h-4 w-40 rounded" />
          </Card>

          <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-5">
            <SkeletonBlock className="h-4 w-20 rounded mb-3" />
            <dl className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <SkeletonBlock className="h-4 w-16 rounded" />
                  <SkeletonBlock className="h-4 w-20 rounded text-right" />
                </div>
              ))}
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}
