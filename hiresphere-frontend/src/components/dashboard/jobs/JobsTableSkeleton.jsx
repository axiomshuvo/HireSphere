"use client";

import SkeletonBlock from "@/components/shared/Skeleton";

export default function JobsTableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 rounded-2xl border border-default-200 bg-content1 p-5 animate-pulse">
      <div className="mb-4 flex items-center justify-between">
        <SkeletonBlock className="h-6 w-12 rounded" />
        <SkeletonBlock className="h-4 w-32 rounded" />
      </div>

      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border border-default-200 bg-default-100 p-4"
        >
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-3/4 rounded" />
            <SkeletonBlock className="h-3 w-1/2 rounded" />
          </div>
          <SkeletonBlock className="h-8 w-24 rounded" />
        </div>
      ))}
    </div>
  );
}

export function RecruiterJobsSkeleton() {
  return (
    <div className="flex-1 px-4 py-8 lg:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-40 rounded" />
          <SkeletonBlock className="h-4 w-64 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-8 w-24 rounded" />
          <SkeletonBlock className="h-8 w-32 rounded-lg" />
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonBlock className="h-20 rounded-2xl" />
        <SkeletonBlock className="h-20 rounded-2xl" />
        <SkeletonBlock className="h-20 rounded-2xl" />
        <SkeletonBlock className="h-20 rounded-2xl" />
      </div>

      {/* Jobs Filters + Table */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <SkeletonBlock className="h-80 rounded-2xl" />
        <JobsTableSkeleton rows={5} />
      </div>
    </div>
  );
}
