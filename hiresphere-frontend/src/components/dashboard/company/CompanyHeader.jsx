"use client";

import { ArrowUpRightFromSquare, CircleCheckFill, Globe, PersonPlus } from "@gravity-ui/icons";
import { Avatar, Button, Chip } from "@heroui/react";

export default function CompanyHeader({ company }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-default bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.35),transparent_40%),radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.25),transparent_45%)] p-6 lg:p-8">
      <Globe className="pointer-events-none absolute -right-10 -top-10 size-64 text-white/5" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar.Root className="size-16 shrink-0 rounded-2xl border border-default bg-amber-400 text-xl font-bold text-black">
            <Avatar.Fallback>{company.initials}</Avatar.Fallback>
          </Avatar.Root>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-white lg:text-3xl">
                {company.name}
              </h1>
              <Chip color="success" size="sm" variant="soft">
                <CircleCheckFill className="size-3" />
                APPROVED
              </Chip>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {company.tagline}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Button variant="secondary">
            <PersonPlus className="size-4" />
            Follow
          </Button>
          <Button variant="primary">
            <Globe className="size-4" />
            Visit Website
          </Button>
        </div>
      </div>
    </section>
  );
}
