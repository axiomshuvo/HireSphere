"use client";

import { Card, Typography } from "@heroui/react";

export default function CompanyAbout({ company }) {
  const first = company.aboutFirstParagraph;
  const second = company.aboutSecondParagraph;
  const description = company.description;

  if (!first && !second && !description) return null;

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5 sm:p-6">
      <Typography.Heading
        className="mb-4 text-lg font-semibold text-foreground"
        level={2}
      >
        About
      </Typography.Heading>

      {first || second ? (
        <div className="grid grid-cols-1 gap-4 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
          {first && <p>{first}</p>}
          {second && <p>{second}</p>}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </Card>
  );
}
