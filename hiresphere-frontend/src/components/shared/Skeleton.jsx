"use client";

import { Skeleton } from "@heroui/react";

export default function SkeletonBlock({ className, children, ...props }) {
  return (
    <Skeleton animationType="pulse" className={className} {...props}>
      {children}
    </Skeleton>
  );
}
