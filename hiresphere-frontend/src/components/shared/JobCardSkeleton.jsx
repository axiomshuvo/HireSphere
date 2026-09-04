"use client";

import SkeletonBlock from "@/components/shared/Skeleton";
import { Card } from "@heroui/react";

export default function JobCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-3 rounded-2xl border border-default-200 bg-content1 p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <SkeletonBlock className="h-5 w-12 rounded-full" />
        <SkeletonBlock className="h-5 w-10 rounded-full" />
        <SkeletonBlock className="h-5 w-14 rounded-full" />
      </div>

      <SkeletonBlock className="mt-2 h-6 w-3/4 rounded" />
      <SkeletonBlock className="mt-1 h-5 w-1/2 rounded" />

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <SkeletonBlock className="h-4 w-20 rounded" />
        <SkeletonBlock className="h-4 w-16 rounded" />
      </div>

      <div className="mt-auto pt-2">
        <SkeletonBlock className="h-5 w-24 rounded" />
      </div>
    </Card>
  );
}
