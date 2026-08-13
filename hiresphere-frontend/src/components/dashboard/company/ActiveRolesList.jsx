"use client";

import { ArrowRight } from "@gravity-ui/icons";
import { Button, Card, Chip, Typography } from "@heroui/react";
import ActiveRoleCard from "./ActiveRoleCard";

export default function ActiveRolesList({
  title = "Active Roles",
  count = 14,
  roles = [],
  seeAllLabel = "See all openings",
}) {
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography.Heading className="text-lg font-semibold text-white" level={2}>
            {title}
          </Typography.Heading>
          <Chip color="default" size="sm" variant="soft">
            {count}
          </Chip>
        </div>
      </div>

      <ul className="space-y-3">
        {roles.map((role) => (
          <ActiveRoleCard key={role.title} role={role} />
        ))}
      </ul>

      <Button className="mt-5 w-full" variant="secondary">
        {seeAllLabel} {count}
        <ArrowRight className="size-4" />
      </Button>
    </Card>
  );
}
