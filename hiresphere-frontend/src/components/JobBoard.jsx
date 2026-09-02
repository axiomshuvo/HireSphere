"use client";

import { ArrowRight, Briefcase, FileDollar, MapPin } from "@gravity-ui/icons";
import { Button, Card, Chip } from "@heroui/react";

const jobListings = Array(6).fill({
  title: "Frontend Developer",
  description:
    "Showcase your commitment to diversity and inclusion by highlighting initiatives",
  location: "New York, USA",
  type: "Hybrid",
  salary: "€25–€40/hour",
});

export default function JobBoard() {
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

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobListings.map((job, index) => (
            <Card
              key={index}
              shadow="none"
              className="bg-(color-surface-2) p-8 rounded-[20px] flex flex-col border border-(color-border)"
            >
              {/* Job Title & Description */}
              <div className="flex flex-col gap-3">
                <h3 className="text-(color-text) text-[24px] font-medium tracking-tight">
                  {job.title}
                </h3>
                <p className="text-(color-text-muted) text-[15px] leading-relaxed pr-2">
                  {job.description}
                </p>
              </div>

              {/* Tags / Badges */}
              <div className="flex flex-wrap gap-2.5 mt-6">
                <Chip className="bg-(color-surface) border-none h-[32px] px-1.5">
                  <MapPin
                    width={14}
                    height={14}
                    className="text-[#e879f9] ml-1"
                  />
                  <span className="text-(color-text) text-[13px] font-medium pr-1 pl-1">
                    {job.location}
                  </span>
                </Chip>

                <Chip className="bg-(color-surface) border-none h-[32px] px-1.5">
                  <Briefcase
                    width={14}
                    height={14}
                    className="text-[#e879f9] ml-1"
                  />
                  <span className="text-(color-text) text-[13px] font-medium pr-1 pl-1">
                    {job.type}
                  </span>
                </Chip>

                <Chip className="bg-(color-surface) border-none h-[32px] px-1.5">
                  <FileDollar
                    width={14}
                    height={14}
                    className="text-[#e879f9] ml-1"
                  />
                  <span className="text-(color-text) text-[13px] font-medium pr-1 pl-1">
                    {job.salary}
                  </span>
                </Chip>
              </div>

              {/* Action */}
              <div className="mt-10 flex">
                <Button
                  variant="light"
                  disableRipple
                  className="p-0 text-(color-text) font-medium text-[14.5px] hover:text-[#e879f9] transition-colors bg-transparent min-w-0 h-auto flex items-center gap-2 data-[hover=true]:bg-transparent"
                  endContent={
                    <ArrowRight
                      width={16}
                      height={16}
                      className="text-current"
                    />
                  }
                >
                  Apply Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* View All */}
        <div className="mt-14 flex justify-center">
          <Button
            variant="bordered"
            disableRipple
            radius="lg"
            className="border-(color-border) bg-(color-surface-2) text-(color-text) font-medium px-7 h-12 text-[14.5px] hover:bg-(color-accent)/10 transition-colors shadow-sm"
          >
            View all job open
          </Button>
        </div>
      </div>
    </section>
  );
}
