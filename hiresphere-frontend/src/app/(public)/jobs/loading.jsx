import JobCardSkeleton from "@/components/shared/JobCardSkeleton";
import SkeletonBlock from "@/components/shared/Skeleton";
import { Card } from "@heroui/react";

export default function JobsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
      <header className="mb-6">
        <SkeletonBlock className="h-8 w-48 rounded" />
        <SkeletonBlock className="mt-2 h-4 w-64 rounded" />
      </header>

      {/* Filter bar skeleton */}
      <div className="mb-6">
        <Card className="rounded-2xl border border-(color-border) bg-(color-surface) p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SkeletonBlock className="h-11 w-full rounded-lg" />
            <SkeletonBlock className="h-11 w-full rounded-lg" />
            <SkeletonBlock className="h-11 w-full rounded-lg" />
            <SkeletonBlock className="h-11 w-full rounded-lg" />
            <SkeletonBlock className="h-11 w-full rounded-lg" />
          </div>
        </Card>
      </div>

      {/* Job cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
