"use client";

import { Briefcase, House, Persons, Star } from "@gravity-ui/icons";

export default function JobStats() {
  const statsData = [
    {
      stat: "50K",
      label: "Active Jobs",
      icon: <Briefcase className="w-6 h-6 text-(color-accent)" />,
    },
    {
      stat: "12K",
      label: "Companies",
      icon: <House className="w-6 h-6 text-(color-accent)" />,
    },
    {
      stat: "2M",
      label: "Job Seekers",
      icon: <Persons className="w-6 h-6 text-(color-accent)" />,
    },
    {
      stat: "97%",
      label: "Satisfaction Rate",
      icon: <Star className="w-6 h-6 text-(color-accent)" />,
    },
  ];

  return (
    <section
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-16 md:pb-32 flex flex-col items-center"
      aria-label="Platform Statistics"
    >
      {/* Section Heading */}
      <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-(color-text) tracking-tight leading-tight">
          Assisting over{" "}
          <span className="text-(color-text) font-bold underline decoration-indigo-500 underline-offset-8">
            15,000 job seekers
          </span>{" "}
          find their dream positions.
        </h2>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {statsData.map((item, index) => (
          <div
            key={index}
            className="bg-(color-surface-2) border border-(color-border) rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-48 hover:border-indigo-500 hover:shadow-2xl group transition-all duration-300"
          >
            {/* Top Gravity UI Icon Container */}
            <div className="p-2.5 rounded-xl bg-(color-surface-3) w-fit border border-(color-border) group-hover:bg-(color-surface-2) transition-colors">
              {item.icon}
            </div>

            {/* Stat Number & Label */}
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-(color-text) tracking-tight mb-1">
                {item.stat}
              </div>
              <p className="text-(color-text-muted) text-sm font-medium">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
