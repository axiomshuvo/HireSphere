import SkeletonBlock from "@/components/shared/Skeleton";
import { Avatar, Card } from "@heroui/react";

export default function CompanyDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 lg:px-8">
      <SkeletonBlock className="h-4 w-32 rounded mb-4" />

      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-3xl border border-(color-border) bg-[linear-gradient(180deg,var(--surface-tertiary),var(--surface-secondary))] p-6 lg:p-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start">
          <Avatar.Root className="size-24 shrink-0 rounded-2xl">
            <Avatar.Fallback>
              <SkeletonBlock className="size-24 rounded-2xl" />
            </Avatar.Fallback>
          </Avatar.Root>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <SkeletonBlock className="h-5 w-12 rounded-full" />
              <SkeletonBlock className="h-5 w-16 rounded-full" />
            </div>

            <SkeletonBlock className="h-8 w-48 rounded sm:h-10 sm:w-64 lg:h-12 lg:w-80" />
            <SkeletonBlock className="mt-2 h-5 w-40 rounded" />

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              <SkeletonBlock className="h-4 w-20 rounded" />
              <SkeletonBlock className="h-4 w-24 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* About section */}
      <div className="mt-8">
        <SkeletonBlock className="h-4 w-12 rounded mb-2" />
        <SkeletonBlock className="h-4 w-full rounded mb-1" />
        <SkeletonBlock className="h-4 w-full rounded mb-1" />
        <SkeletonBlock className="h-4 w-3/4 rounded" />
      </div>

      {/* Open roles section */}
      <div className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <SkeletonBlock className="h-6 w-32 rounded" />
            <SkeletonBlock className="mt-1 h-4 w-24 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className="flex h-full flex-col gap-2 rounded-2xl border border-(color-border) bg-(color-surface) p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <SkeletonBlock className="h-5 w-3/4 rounded" />
                <SkeletonBlock className="h-4 w-10 rounded" />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <SkeletonBlock className="h-3 w-16 rounded" />
                <SkeletonBlock className="h-3 w-12 rounded" />
              </div>
              <div className="mt-auto pt-2">
                <SkeletonBlock className="h-5 w-20 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
