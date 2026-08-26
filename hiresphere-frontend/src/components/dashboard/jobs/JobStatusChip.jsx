"use client";

import { Ban, FileText, Play } from "@gravity-ui/icons";
import { Chip } from "@heroui/react";

const statusConfig = {
  active: { label: "Active", icon: Ban, color: "success" },
  closed: { label: "Closed", icon: Play, color: "danger" },
  draft: { label: "Draft", icon: FileText, color: "warning" },
};

export default function JobStatusChip({ status }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  const Icon = config.icon;

  return (
    <Chip color={config.color} size="sm" variant="soft">
      <Icon className="size-3" />
      {config.label}
    </Chip>
  );
}
