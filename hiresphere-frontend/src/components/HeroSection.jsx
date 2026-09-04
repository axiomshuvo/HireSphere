"use client";

import { Magnifier } from "@gravity-ui/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

function buildJobSearchUrl(jobTitle, location) {
  const params = new URLSearchParams();
  if (jobTitle) params.set("search", jobTitle);
  if (location) params.set("location", location);
  const qs = params.toString();
  return qs ? `/jobs?${qs}` : "/jobs";
}

function buildTagUrl(tag) {
  return `/jobs?search=${encodeURIComponent(tag)}`;
}

export default function HeroSection() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  const popularTags = [
    "Product Designer",
    "AI Engineering",
    "Dev-ops Engineer",
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(buildJobSearchUrl(jobTitle, location));
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-24 flex flex-col items-center text-center">
      {/* Top Banner Badge */}
      <div className="relative w-full max-w-xl flex items-center justify-center mb-10">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-(color-border)" />
        </div>

        <div className="relative bg-(color-surface) border border-(color-border) rounded-full px-5 py-2.5 flex items-center gap-2.5 shadow-sm">
          <span className="text-xl" role="img" aria-label="Briefcase">
            💼
          </span>
          <span className="font-bold text-(color-text) text-base sm:text-lg tracking-tight">
            50,000+
          </span>
          <span className="text-(color-text-muted) font-mono text-xs sm:text-sm tracking-wider uppercase font-medium">
            NEW JOBS THIS MONTH
          </span>
        </div>
      </div>

      {/* Hero Headline & Subtitle */}
      <div className="max-w-3xl mx-auto mb-12 space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-(color-text) tracking-tight leading-tight">
          Find Your Next Dream Role in{" "}
          <span className="bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#FF6A00] bg-clip-text text-transparent">
            Tech & AI
          </span>
        </h1>
        <p className="text-(color-text-muted) text-base sm:text-lg max-w-2xl mx-auto font-normal">
          AI-powered career matching for developers, designers, and tech
          leaders. Built for professionals who take their growth seriously.
        </p>
      </div>

      {/* Search Bar Container */}
      <form
        onSubmit={handleSearch}
        role="search"
        aria-label="Job Search"
        className="w-full max-w-4xl bg-(color-surface) border border-(color-border) rounded-2xl md:rounded-full p-2 md:p-2.5 flex flex-col md:flex-row items-center gap-2 shadow-lg transition-all duration-300"
      >
        {/* Left Input: Job Title */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full">
          <Magnifier
            className="w-5 h-5 text-(color-text-muted) shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Job title, skill or company"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full bg-transparent text-(color-text) placeholder-(color-text-muted) text-sm sm:text-base focus:outline-none"
            aria-label="Job title, skill or company"
          />
        </div>

        {/* Vertical Separator */}
        <div
          className="hidden md:block h-8 w-[1px] bg-(color-border) my-auto"
          aria-hidden="true"
        />

        {/* Right Input: Location */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full">
          <Magnifier
            className="w-5 h-5 text-(color-text-muted) shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Location or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-(color-text) placeholder-(color-text-muted) text-sm sm:text-base focus:outline-none"
            aria-label="Location or Remote"
          />
        </div>

        {/* Submit Search Button */}
        <button
          type="submit"
          aria-label="Submit Job Search"
          className="w-full md:w-auto bg-[#4f46e5] hover:bg-[#4338ca] text-foreground p-3.5 md:p-4 rounded-xl md:rounded-full flex items-center justify-center shrink-0 shadow-md transition-all duration-200 cursor-pointer"
        >
          <Magnifier className="w-5 h-5" />
        </button>
      </form>

      {/* Popular Job Search Tags */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {popularTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => router.push(buildTagUrl(tag))}
            className="bg-(color-surface) hover:bg-(color-surface-2) border border-(color-border) text-(color-text) text-xs sm:text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
}
