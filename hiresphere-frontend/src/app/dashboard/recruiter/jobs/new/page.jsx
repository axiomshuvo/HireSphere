"use client";

import {
  CURRENCIES,
  JOB_CATEGORIES,
  JOB_TYPES,
  MOCK_COMPANY,
  getActiveCount,
  getPlanUsage,
  INITIAL_JOBS,
} from "@/lib/jobs";
import { CircleCheckFill, CircleInfo } from "@gravity-ui/icons";
import { toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass = (error) =>
  `w-full rounded-lg border bg-[#1b1c1e] px-3 py-2 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none ${
    error
      ? "border-red-500 focus:border-red-500"
      : "border-white/10 focus:border-indigo-500"
  }`;

const labelClass = "mb-1 block text-xs font-medium text-gray-400";

function Field({ label, error, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function NewJobPage() {
  const router = useRouter();
  const usage = getPlanUsage(getActiveCount(INITIAL_JOBS));

  const [formData, setFormData] = useState({
    title: "",
    category: "Technology",
    type: "Full-time",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    city: "",
    country: "",
    remote: false,
    deadline: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Job title is required.";
    if (!formData.salaryMin) newErrors.salaryMin = "Minimum salary is required.";
    if (!formData.salaryMax) newErrors.salaryMax = "Maximum salary is required.";
    if (!formData.remote && !formData.city.trim()) {
      newErrors.city = "City is required unless the job is remote.";
    }
    if (!formData.remote && !formData.country.trim()) {
      newErrors.country = "Country is required unless the job is remote.";
    }
    if (!formData.deadline) newErrors.deadline = "Deadline is required.";
    if (!formData.responsibilities.trim()) {
      newErrors.responsibilities = "Responsibilities are required.";
    }
    if (!formData.requirements.trim()) {
      newErrors.requirements = "Requirements are required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!usage.hasAvailableSlots) {
      toast.warning("Plan limit reached", {
        description: "Close an active job or upgrade your plan to post more.",
      });
      return;
    }

    toast.success("Job posted successfully", {
      description: `${formData.title} is now live on HireSphere.`,
    });
    router.push("/dashboard/recruiter/jobs");
  };

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Post a Job
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in the details below to publish a new job post.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-[#121316] p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Job Details</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {MOCK_COMPANY.name} ·{" "}
                <span className="inline-flex items-center gap-1 text-green-400">
                  <CircleCheckFill className="size-3" /> Approved
                </span>
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {usage.used}/{usage.limit} active posts
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Job Title" error={errors.title}>
                <input
                  name="title"
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass(errors.title)}
                />
              </Field>
            </div>

            <Field label="Category">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClass()}
              >
                {JOB_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Job Type">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={inputClass()}
              >
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Salary Min" error={errors.salaryMin}>
              <input
                name="salaryMin"
                type="number"
                placeholder="60000"
                value={formData.salaryMin}
                onChange={handleChange}
                className={inputClass(errors.salaryMin)}
              />
            </Field>

            <Field label="Salary Max" error={errors.salaryMax}>
              <input
                name="salaryMax"
                type="number"
                placeholder="90000"
                value={formData.salaryMax}
                onChange={handleChange}
                className={inputClass(errors.salaryMax)}
              />
            </Field>

            <Field label="Currency">
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className={inputClass()}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Deadline" error={errors.deadline}>
              <input
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className={inputClass(errors.deadline)}
              />
            </Field>

            <Field label="City" error={errors.city}>
              <input
                name="city"
                placeholder="San Francisco"
                value={formData.city}
                onChange={handleChange}
                disabled={formData.remote}
                className={`${inputClass(errors.city)} disabled:opacity-40`}
              />
            </Field>

            <Field label="Country" error={errors.country}>
              <input
                name="country"
                placeholder="USA"
                value={formData.country}
                onChange={handleChange}
                disabled={formData.remote}
                className={`${inputClass(errors.country)} disabled:opacity-40`}
              />
            </Field>

            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="remote"
                  checked={formData.remote}
                  onChange={handleChange}
                  className="size-4 accent-indigo-500"
                />
                <span className="text-sm text-gray-300">This job is fully remote</span>
              </label>
            </div>
          </div>

          <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
            <Field label="Responsibilities" error={errors.responsibilities}>
              <textarea
                name="responsibilities"
                placeholder="List the key responsibilities..."
                value={formData.responsibilities}
                onChange={handleChange}
                rows={3}
                className={`${inputClass(errors.responsibilities)} resize-y`}
              />
            </Field>

            <Field label="Requirements" error={errors.requirements}>
              <textarea
                name="requirements"
                placeholder="List the required skills and experience..."
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                className={`${inputClass(errors.requirements)} resize-y`}
              />
            </Field>

            <Field label="Benefits (optional)">
              <textarea
                name="benefits"
                placeholder="Share the perks and benefits..."
                value={formData.benefits}
                onChange={handleChange}
                rows={2}
                className={`${inputClass()} resize-y`}
              />
            </Field>
          </div>

          {!usage.hasAvailableSlots && (
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
              <CircleInfo className="size-4 shrink-0" />
              You&apos;ve reached your active job limit. Close a job or upgrade your plan.
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/recruiter/jobs")}
              className="h-10 rounded-lg bg-default px-5 text-sm font-medium text-white transition-colors hover:bg-default-foreground/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!usage.hasAvailableSlots}
              className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Post Job
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
