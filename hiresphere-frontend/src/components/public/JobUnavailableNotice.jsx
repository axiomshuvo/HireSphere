import Link from "next/link";
import { Card } from "@heroui/react";

export default function JobUnavailableNotice({ reason, title, description }) {
  const heading =
    title ??
    (reason === "company-renamed"
      ? "This position is no longer available"
      : "This role is no longer accepting public applications");
  const body =
    description ??
    (reason === "company-renamed"
      ? "The company updated its profile and this role was closed. Browse other open roles on HireSphere."
      : "The company has made this job private. Browse other open roles on HireSphere.");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 lg:px-8">
      <Link
        href="/jobs"
        className="text-sm text-muted-foreground transition-colors hover:text-white"
      >
        ← Back to jobs
      </Link>
      <Card className="mt-8 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-white">{heading}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/jobs"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
          >
            Browse open roles
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-white/30 hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
}
