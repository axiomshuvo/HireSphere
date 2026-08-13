"use client";

import { ArrowUpRightFromSquare, MapPin } from "@gravity-ui/icons";
import { Avatar, Button, Card, Typography } from "@heroui/react";

export default function ActiveRoleCard({ role }) {
  return (
    <li className="rounded-xl border border-default p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Typography.Paragraph className="font-medium text-white">
            {role.title}
          </Typography.Paragraph>
          <ArrowUpRightFromSquare className="size-4 text-muted-foreground" />
        </div>
        <Button size="sm" variant="secondary">
          Quick Apply
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3" />
          {role.location}
        </span>
        <span className="text-default-foreground/60">{role.salary}</span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {role.avatars.map((initials, index) => (
            <Avatar.Root
              key={initials}
              className={`size-7 shrink-0 rounded-full border border-content1 bg-default text-[10px] font-semibold text-default-foreground ${
                index > 0 ? "z-10" : ""
              }`}
            >
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            </Avatar.Root>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">+{role.extraApplicants}</span>
      </div>
    </li>
  );
}
