"use client";

import SkeletonBlock from "@/components/shared/Skeleton";

export default function DashboardLoadingSkeleton({ role = "seeker" }) {
  const isRecruiter = role === "recruiter";
  return (
    <div className="flex-1 px-4 py-8 lg:px-8 animate-pulse">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <SkeletonBlock className="h-9 w-64 rounded" />
            <SkeletonBlock className="h-4 w-80 rounded" />
          </div>
          <SkeletonBlock className="h-10 w-36 rounded-lg" />
        </header>

        {/* Stat Cards Row */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <SkeletonBlock className="h-24 rounded-2xl" />
          <SkeletonBlock className="h-24 rounded-2xl" />
          <SkeletonBlock className="h-24 rounded-2xl" />
          <SkeletonBlock className="h-24 rounded-2xl" />
        </section>

        {isRecruiter ? (
          <>
            {/* Companies section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-6 w-40 rounded" />
                <SkeletonBlock className="h-6 w-20 rounded" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <SkeletonBlock className="h-32 rounded-2xl" />
                <SkeletonBlock className="h-32 rounded-2xl" />
                <SkeletonBlock className="h-32 rounded-2xl" />
                <SkeletonBlock className="h-32 rounded-2xl" />
                <SkeletonBlock className="h-32 rounded-2xl" />
                <SkeletonBlock className="h-32 rounded-2xl" />
              </div>
            </section>

            {/* Recent jobs table */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <SkeletonBlock className="h-6 w-32 rounded" />
                <SkeletonBlock className="h-6 w-16 rounded" />
              </div>
              <div className="space-y-3 rounded-2xl border border-default-200 bg-content1 p-5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-default-200 bg-default-100 p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <SkeletonBlock className="h-4 w-3/4 rounded" />
                      <SkeletonBlock className="h-3 w-1/2 rounded" />
                    </div>
                    <SkeletonBlock className="h-8 w-20 rounded" />
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Seeker: Recommended + Applications + Saved sections */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-default-200 bg-content1 p-5 lg:col-span-1">
                <div className="mb-3 flex items-center justify-between">
                  <SkeletonBlock className="h-6 w-40 rounded" />
                  <SkeletonBlock className="h-6 w-16 rounded" />
                </div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-default-200 bg-content1 p-5 lg:col-span-1">
                <div className="mb-3 flex items-center justify-between">
                  <SkeletonBlock className="h-6 w-44 rounded" />
                  <SkeletonBlock className="h-6 w-16 rounded" />
                </div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-default-200 bg-content1 p-5 lg:col-span-1">
                <div className="mb-3 flex items-center justify-between">
                  <SkeletonBlock className="h-6 w-32 rounded" />
                  <SkeletonBlock className="h-6 w-16 rounded" />
                </div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
