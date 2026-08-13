"use client";

import { MapPin } from "@gravity-ui/icons";
import { Avatar, Typography } from "@heroui/react";

export default function CompanyListItem({
  name,
  field,
  location,
  activeJobs,
  initials,
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-default p-3">
      <Avatar.Root className="size-10 shrink-0 rounded-lg bg-default text-sm font-semibold text-default-foreground">
        <Avatar.Fallback>{initials}</Avatar.Fallback>
      </Avatar.Root>
      <div className="min-w-0 flex-1">
        <Typography.Paragraph className="truncate font-medium text-white">
          {name}
        </Typography.Paragraph>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{field}</span>
          <span>•</span>
          <MapPin className="size-3" />
          <span>{location}</span>
        </div>
      </div>
      <div className="text-right">
        <Typography.Paragraph className="text-sm font-semibold text-white">
          {activeJobs}
        </Typography.Paragraph>
        <Typography.Paragraph className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Active Jobs
        </Typography.Paragraph>
      </div>
    </li>
  );
}
