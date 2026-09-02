"use client";

import {
  ArrowRight, // Swapped from 'Pointer' to a 100% verified existing Gravity UI icon
  ArrowUpRight,
  Bookmark,
  ChartColumn,
  ChartLine,
  Cube,
  FileText,
  Magnifier,
} from "@gravity-ui/icons";

// Data mapping perfectly to the provided design using only verified exports
const featuresList = [
  {
    title: "Smart Search",
    description: "Find your ideal job with advanced filters.",
    icon: Magnifier,
  },
  {
    title: "Salary Insights",
    description: "Get real salary data to negotiate confidently.",
    icon: ChartLine,
  },
  {
    title: "Top Companies",
    description: "Apply to vetted companies that are hiring.",
    icon: ChartColumn,
  },
  {
    title: "Saved Jobs",
    description: "Manage apps & favorites on your dashboard.",
    icon: Bookmark,
  },
  {
    title: "One-Click Apply",
    description: "Simplify your job applications for an easier process!",
    icon: ArrowRight, // Guaranteed to build safely
  },
  {
    title: "Resume Builder",
    description: "Create professional resumes with modern templates.",
    icon: FileText,
  },
  {
    title: "Skill-Based Matching",
    description: "Discover jobs that match your skills and experience.",
    icon: Cube,
  },
  {
    title: "Career Growth Resources",
    description: "Boost your career with quick interview tips.",
    icon: ArrowUpRight,
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full bg-(color-surface) pt-24 pb-32 font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header and Markers */}
        <div className="flex flex-col items-center justify-center text-center mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-[5px] h-[5px] bg-[#6366F1]" />
            <span className="text-(color-text-muted) tracking-[0.15em] uppercase text-[13px] font-medium">
              Features Job
            </span>
            <div className="w-[5px] h-[5px] bg-[#6366F1]" />
          </div>

          <h2 className="text-[40px] md:text-[46px] font-semibold text-(color-text) tracking-tight leading-[1.15]">
            Everything you need <br /> to succeed
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {featuresList.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex gap-4 items-start group">
                {/* Icon Box */}
                <div className="w-14 h-14 rounded-xl bg-(color-surface-2) border border-(color-border) flex items-center justify-center shrink-0 group-hover:border-[#F3A8FF]/40 transition-colors duration-300">
                  <Icon width={22} height={22} className="text-[#F3A8FF]" />
                </div>

                {/* Text Content */}
                <div className="flex flex-col gap-1.5 mt-0.5">
                  <h3 className="text-(color-text) text-[15.5px] font-medium tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-(color-text-muted) text-[14px] leading-relaxed pr-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
