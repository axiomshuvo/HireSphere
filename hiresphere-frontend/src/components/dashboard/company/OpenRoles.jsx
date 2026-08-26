"use client";

import { MapPin } from "@gravity-ui/icons";
import { Avatar, Card, Typography } from "@heroui/react";

function RoleCard({ role }) {
  const avatars = role.avatars?.slice(0, 2) ?? [];

  return (
    <div className="rounded-xl border border-default bg-[#1b1c1e] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{role.title}</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {role.location}
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-white/10 bg-[#121316] px-2 py-1 text-xs text-white">
          {role.salary}
        </span>
      </div>

      {avatars.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            {avatars.map((initial, index) => (
              <Avatar.Root
                key={`${initial}-${index}`}
                className="size-7 rounded-full border-2 border-[#1b1c1e] bg-default text-[10px] font-semibold text-default-foreground"
              >
                <Avatar.Fallback>{initial}</Avatar.Fallback>
              </Avatar.Root>
            ))}
          </div>
          {role.extraApplicants > 0 && (
            <span className="text-xs text-muted-foreground">
              +{role.extraApplicants} applicants
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function OpenRoles({ roles }) {
  if (!Array.isArray(roles) || roles.length === 0) return null;

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Typography.Heading
          className="text-lg font-semibold text-white"
          level={2}
        >
          Open Roles
        </Typography.Heading>
        <span className="text-xs text-muted-foreground">
          {roles.length} {roles.length === 1 ? "role" : "roles"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {roles.map((role, index) => (
          <RoleCard key={`${role.title}-${index}`} role={role} />
        ))}
      </div>
    </Card>
  );
}
