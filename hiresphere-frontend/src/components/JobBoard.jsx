import { ArrowRight, Briefcase, FileDollar, MapPin } from "@gravity-ui/icons";
import { Card, Chip } from "@heroui/react";
import Link from "next/link";
import { fetchPublicJobs } from "@/lib/actions/jobs";
import { getJobId } from "@/lib/api/jobstruture";

function stripHtml(value) {
  if (!value) return "";
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSalary(job) {
  if (job?.salaryMin && job?.salaryMax) {
    return `${job.currency ?? "USD"} ${job.salaryMin} – ${job.salaryMax}`;
  }
  return "—";
}

function formatLocation(job) {
  if (job?.remote) return "Remote";
  const parts = [job?.city, job?.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function formatType(job) {
  return job?.workplaceType ?? job?.type ?? "—";
}

export default async function JobBoard() {
  let jobs = [];
  try {
    const result = await fetchPublicJobs({ pageSize: 6 });
    jobs = Array.isArray(result) ? result : (result?.items ?? []);
  } catch {
    jobs = [];
  }

  return (
    <section className="w-full bg-(color-surface) pt-24 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header Section */}
        <div className="relative mb-16 flex flex-col items-center justify-center text-center">
          {/* Grid-Aligned Decorative Dots */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 hidden lg:grid grid-cols-3 gap-6 w-full pointer-events-none">
            <div className="relative">
              <div className="absolute right-[-12px] top-0 w-[6px] h-[6px] bg-[#6366F1] translate-x-[50%]" />
            </div>
            <div className="relative">
              <div className="absolute right-[-12px] top-0 w-[6px] h-[6px] bg-[#6366F1] translate-x-[50%]" />
            </div>
            <div></div>
          </div>

          <div className="relative z-10 bg-(color-surface) px-8">
            <span className="block text-[#6366F1] font-semibold tracking-wider uppercase text-[13px] mb-3">
              Smart job open
            </span>
            <h2 className="text-[40px] md:text-[48px] font-bold text-(color-text) tracking-tight leading-tight">
              The roles you&apos;d never
            </h2>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-[20px] border border-(color-border) bg-(color-surface-2) p-10 text-center">
            <p className="text-(color-text) text-lg font-medium">
              No open roles right now
            </p>
            <p className="mt-2 text-(color-text-muted) text-sm">
              Check back soon or browse all listings.
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-(color-border) bg-(color-surface) px-6 h-12 text-[14.5px] font-medium text-(color-text) hover:bg-(color-accent)/10 transition-colors"
            >
              View all job open
              <ArrowRight width={16} height={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => {
                const id = getJobId(job);
                const description = stripHtml(job.description).slice(0, 140);
                return (
                  <Link
                    key={id ?? job.title}
                    href={id ? `/jobs/${id}` : "/jobs"}
                    className="block"
                  >
                    <Card
                      shadow="none"
                      className="group relative overflow-hidden bg-(color-surface-2) p-8 rounded-[20px] flex flex-col border border-(color-border) transition-colors hover:border-indigo-500/50 cursor-pointer h-full"
                    >
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-0">
                        <div className="absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />
                      </div>

                      {/* Job Title & Description */}
                      <div className="relative z-10 flex flex-col gap-3">
                        <h3 className="text-(color-text) text-[24px] font-medium tracking-tight">
                          {job.title ?? "Untitled role"}
                        </h3>
                        <p className="text-(color-text-muted) text-[15px] leading-relaxed pr-2">
                          {description || "—"}
                        </p>
                      </div>

                      {/* Tags / Badges */}
                      <div className="flex flex-wrap gap-2.5 mt-6">
                        <Chip className="bg-(color-surface) border-none h-[32px] px-1.5">
                          <MapPin
                            width={14}
                            height={14}
                            className="text-fuchsia-600 dark:text-fuchsia-300 ml-1"
                          />
                          <span className="text-(color-text) text-[13px] font-medium pr-1 pl-1">
                            {formatLocation(job)}
                          </span>
                        </Chip>

                        <Chip className="bg-(color-surface) border-none h-[32px] px-1.5">
                          <Briefcase
                            width={14}
                            height={14}
                            className="text-fuchsia-600 dark:text-fuchsia-300 ml-1"
                          />
                          <span className="text-(color-text) text-[13px] font-medium pr-1 pl-1">
                            {formatType(job)}
                          </span>
                        </Chip>

                        <Chip className="bg-(color-surface) border-none h-[32px] px-1.5">
                          <FileDollar
                            width={14}
                            height={14}
                            className="text-fuchsia-600 dark:text-fuchsia-300 ml-1"
                          />
                          <span className="text-(color-text) text-[13px] font-medium pr-1 pl-1">
                            {formatSalary(job)}
                          </span>
                        </Chip>
                      </div>

                      {/* Action */}
                      <div className="mt-10 flex">
                        <span className="p-0 text-(color-text) font-medium text-[14.5px] group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300 transition-colors bg-transparent min-w-0 h-auto flex items-center gap-2">
                          Apply Now
                          <ArrowRight
                            width={16}
                            height={16}
                            className="text-current"
                          />
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* View All */}
            <div className="mt-14 flex justify-center">
              <Link
                href="/jobs"
                className="border border-(color-border) rounded-xl bg-(color-surface-2) text-(color-text) font-medium px-7 h-12 text-[14.5px] hover:bg-(color-accent)/10 transition-colors shadow-sm inline-flex items-center"
              >
                View all job open
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
