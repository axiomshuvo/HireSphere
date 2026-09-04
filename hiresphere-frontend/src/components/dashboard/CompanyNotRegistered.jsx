"use client";

import { FileText, CirclePlus } from "@gravity-ui/icons";
import { Typography } from "@heroui/react";

export default function CompanyNotRegistered({ registerAction, faqAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-default bg-content1 px-6 py-20 text-center">
      <div className="relative mb-8">
        <div className="flex size-36 items-center justify-center rounded-2xl border border-default bg-default/60">
          <FileText className="size-16 text-muted-foreground" />
          <div className="absolute inset-x-5 top-9 h-3 rounded-full bg-default-foreground/10" />
          <div className="absolute inset-x-5 top-16 h-3 rounded-full bg-default-foreground/10" />
          <div className="absolute inset-x-8 top-23 h-3 rounded-full bg-default-foreground/10" />
        </div>
        <div className="absolute -right-2 -top-2 flex size-10 items-center justify-center rounded-full border border-default bg-content1 text-foreground shadow-lg">
          <CirclePlus className="size-5" />
        </div>
      </div>

      <Typography.Heading className="text-2xl font-semibold text-foreground" level={2}>
        Company not registered yet
      </Typography.Heading>
      <Typography.Paragraph className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Set up your business profile to start posting high-performance job listings
        and manage your talent loop.
      </Typography.Paragraph>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {registerAction}
        {faqAction}
      </div>

      <Typography.Paragraph className="mt-10 text-xs text-muted-foreground">
        Need specialized assistance? Contact our enterprise support team.
      </Typography.Paragraph>
    </div>
  );
}
