"use client";

import { Avatar, Button, Card, Typography } from "@heroui/react";

export default function HiringTeamCard({
  title = "HIRING TEAM",
  member = {
    name: "Sarah Chen",
    title: "Head of Talent Acquisition",
    initials: "SC",
  },
  actionLabel = "Message Team",
}) {
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <Typography.Paragraph className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </Typography.Paragraph>

      <div className="flex items-center gap-3">
        <Avatar.Root className="size-12 shrink-0 rounded-full bg-default text-sm font-semibold text-default-foreground">
          <Avatar.Fallback>{member.initials}</Avatar.Fallback>
        </Avatar.Root>
        <div>
          <Typography.Paragraph className="font-medium text-white">
            {member.name}
          </Typography.Paragraph>
          <Typography.Paragraph className="text-sm text-muted-foreground">
            {member.title}
          </Typography.Paragraph>
        </div>
      </div>

      <Button className="mt-5 w-full" variant="secondary">
        {actionLabel}
      </Button>
    </Card>
  );
}
