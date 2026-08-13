"use client";

import { ArrowRight, Picture } from "@gravity-ui/icons";
import { Button, Card, Typography } from "@heroui/react";

const placeholderTones = [
  "from-indigo-500/30 to-blue-500/20",
  "from-purple-500/30 to-pink-500/20",
  "from-cyan-500/30 to-emerald-500/20",
];

export default function LifeAtCompany({ title = "Life at LuminaTech", viewAllLabel = "View Gallery" }) {
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <Typography.Heading className="text-lg font-semibold text-white" level={2}>
          {title}
        </Typography.Heading>
        <Button className="text-sm text-muted-foreground" variant="light">
          {viewAllLabel}
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {placeholderTones.map((tone, index) => (
          <div
            key={tone}
            className={`flex h-40 items-center justify-center rounded-xl border border-default bg-gradient-to-br ${tone}`}
          >
            <Picture className="size-8 text-white/40" />
          </div>
        ))}
      </div>
    </Card>
  );
}
