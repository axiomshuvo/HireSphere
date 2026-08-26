"use client";

import ButtonLink from "@/components/shared/ButtonLink";
import { ArrowLeft, Magnifier } from "@gravity-ui/icons";
import { Card, Typography } from "@heroui/react";

export default function CompanyNotFound({ companyId }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md rounded-2xl border border-default bg-content1 p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-default bg-[#1b1c1e] text-muted-foreground">
          <Magnifier className="size-6" />
        </div>

        <Typography.Heading
          className="text-xl font-semibold text-white"
          level={2}
        >
          No company found
        </Typography.Heading>

        <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t find a company with the id{" "}
          <span className="font-mono text-white">{companyId}</span>. It may
          have been removed or the link is incorrect.
        </Typography.Paragraph>

        <ButtonLink
          href="/dashboard/mycompany"
          variant="primary"
          className="mx-auto mt-6"
        >
          <ArrowLeft className="size-4" />
          Back to My Companies
        </ButtonLink>
      </Card>
    </div>
  );
}
