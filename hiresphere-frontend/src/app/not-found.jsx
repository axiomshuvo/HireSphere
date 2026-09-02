import { House, Magnifier } from "@gravity-ui/icons";
import Link from "next/link";

export const metadata = {
  title: "Page not found | HireSphere",
};

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#0f1013,#16181c)] px-4">
      <div
        aria-hidden
        className="absolute -right-20 -top-24 size-80 rounded-full bg-indigo-500/6 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 size-96 rounded-full bg-cyan-500/4 blur-3xl"
      />

      <div className="relative z-10 max-w-md text-center">
        {/* 404 */}
        <div className="mb-2 text-[10rem] font-extrabold tracking-tight text-white sm:text-[12rem] md:text-[14rem]">
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            4
          </span>
          <span className="bg-gradient-to-r from-cyan-300 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
            0
          </span>
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            4
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-semibold text-white">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-(color-text-muted)">
          The page you&apos;re looking for doesn&apos;t exist, was moved, or
          never existed. Double-check the URL or navigate back.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/20 transition-all duration-200 hover:bg-indigo-400 hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <House className="size-4" />
            Go to home
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-(color-surface-2) px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-indigo-500/40 hover:bg-white/[0.06]"
          >
            <Magnifier className="size-4 text-indigo-300" />
            Browse jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
