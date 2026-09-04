"use client";

import SkeletonBlock from "@/components/shared/Skeleton";
import { Avatar, Card } from "@heroui/react";

export default function CompanyCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-3 rounded-2xl border border-default-200 bg-default-100 p-5">
      <div className="flex items-start gap-3">
        <Avatar.Root className="size-14 shrink-0 rounded-2xl">
          <Avatar.Fallback>
            <SkeletonBlock className="size-14 rounded-2xl" />
          </Avatar.Fallback>
        </Avatar.Root>
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-5 w-3/4 rounded" />
          <SkeletonBlock className="mt-1 h-4 w-1/3 rounded" />
        </div>
      </div>

      <SkeletonBlock className="mt-2 h-4 w-full rounded" />
      <SkeletonBlock className="mt-1 h-4 w-5/6 rounded" />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SkeletonBlock className="h-4 w-16 rounded" />
        <SkeletonBlock className="h-4 w-14 rounded" />
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-default-200">
        <SkeletonBlock className="h-4 w-20 rounded" />
        <SkeletonBlock className="h-4 w-8 rounded" />
      </div>
    </Card>
  );
}
