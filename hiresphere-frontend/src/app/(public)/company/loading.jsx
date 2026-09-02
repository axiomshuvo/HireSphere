import CompanyCardSkeleton from "@/components/shared/CompanyCardSkeleton";
import SkeletonBlock from "@/components/shared/Skeleton";
import { OfficeBadge } from "@gravity-ui/icons";

export default function CompanyLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-(color-border) bg-[linear-gradient(180deg,var(--surface-tertiary),var(--surface-secondary))] p-6 pb-10 sm:p-10">
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-(color-border) bg-white/[0.03] px-4 py-1.5">
            <OfficeBadge className="size-3.5 text-(color-text-muted)" />
            <SkeletonBlock className="h-3 w-32 rounded" />
          </div>

          <SkeletonBlock className="h-10 w-64 rounded sm:h-12 sm:w-80 lg:h-14 lg:w-96" />
          <SkeletonBlock className="mt-2 h-4 w-48 rounded" />
        </div>

        {/* Stats row */}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <SkeletonBlock className="h-9 w-20 rounded-xl" />
          <SkeletonBlock className="h-9 w-24 rounded-xl" />
          <SkeletonBlock className="h-9 w-20 rounded-xl" />
        </div>
      </section>

      {/* Company cards grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CompanyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
