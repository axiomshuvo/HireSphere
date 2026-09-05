"use client";

import { createRecruiterJob, updateRecruiterJob } from "@/lib/actions/jobs";
import { getCompanyName, getCompanySlug } from "@/lib/api/companies";
import {
  CURRENCIES,
  EMPTY_JOB_FORM,
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  JOB_TYPES,
  WORKPLACE_TYPES,
  getJobId,
  getPlanUsage,
  jobToFormValues,
} from "@/lib/api/jobstruture";
import { CircleCheckFill, CircleInfo } from "@gravity-ui/icons";
import { ListBox, ListBoxItem, Select, toast } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass = (error) =>
  `h-11 w-full rounded-xl border bg-[#17191d] px-3 text-sm text-foreground placeholder-gray-500 shadow-inner shadow-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
    error
      ? "border-red-500 focus:border-red-500"
      : "border-white/10 focus:border-indigo-500"
  }`;

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {required && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
            * Required
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function JobForm({
  job,
  activeJobCount = 0,
  userPlan = "free",
  isEditing = false,
  companies = [],
  onSubmit,
}) {
  const router = useRouter();
  const usage = getPlanUsage(activeJobCount, userPlan);

  const [formData, setFormData] = useState(() =>
    job ? jobToFormValues(job) : { ...EMPTY_JOB_FORM },
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !formData.skills.includes(val)) {
        setFormData((prev) => ({ ...prev, skills: [...prev.skills, val] }));
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const selectedCompany = companies.find(
    (c) => getCompanySlug(c) === formData.companySlug,
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCompanyChange = (key) => {
    setFormData((prev) => ({ ...prev, companySlug: key ?? "" }));
    if (errors.companySlug) {
      setErrors((prev) => ({ ...prev, companySlug: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const newErrors = {};

    if (!formData.companySlug)
      newErrors.companySlug = "Please select a company.";
    if (!formData.title.trim()) newErrors.title = "Job title is required.";
    if (!formData.description?.trim())
      newErrors.description = "Role description is required.";
    if (!formData.salaryMin)
      newErrors.salaryMin = "Minimum salary is required.";
    if (!formData.salaryMax)
      newErrors.salaryMax = "Maximum salary is required.";

    // Remote logic: if workplaceType is not Remote, require city and country
    const isRemote = formData.workplaceType === "Remote" || formData.remote;
    if (!isRemote && !formData.city.trim()) {
      newErrors.city = "City is required unless the job is remote.";
    }
    if (!isRemote && !formData.country.trim()) {
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

    const payload = {
      ...formData,
      title: formData.title.trim(),
      _id: undefined,
      id: undefined,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        const jobId = getJobId(job);
        await updateRecruiterJob(jobId, payload);
        toast.success("Job updated", {
          description: `${formData.title} is saved.`,
        });
      } else {
        await createRecruiterJob(payload);
        toast.success("Job posted successfully", {
          description: `${formData.title} is saved.`,
        });
      }
      router.push("/dashboard/recruiter/jobs");
    } catch (error) {
      console.error("[JobForm] Error submitting job form:", error);
      toast.warning("An error occurred while saving the job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-default bg-content1 p-6 shadow-2xl shadow-black/10 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? "Edit Job" : "Job Details"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {selectedCompany ? (
                <>
                  {getCompanyName(selectedCompany)} ·{" "}
                  <span className="inline-flex items-center gap-1 text-green-400">
                    <CircleCheckFill className="size-3" /> Approved
                  </span>
                </>
              ) : (
                "Pick the company this job belongs to."
              )}
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {usage.used}/{usage.limit} active posts
          </span>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.04] px-4 py-3">
          <div className="size-2 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.8)]" />
          <p className="text-xs font-medium text-indigo-100">
            Required details are marked by validation when you submit.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Company" required error={errors.companySlug}>
              {companies.length === 0 ? (
                <p className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
                  You don&apos;t have any companies yet.{" "}
                  <Link
                    href="/dashboard/mycompany/new"
                    className="font-medium text-yellow-100 underline"
                  >
                    Add a company
                  </Link>{" "}
                  before posting a job.
                </p>
              ) : (
                <Select
                  selectedKey={formData.companySlug || null}
                  onSelectionChange={handleCompanyChange}
                  isInvalid={Boolean(errors.companySlug)}
                  aria-label="Company"
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select a company" />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {companies.map((company) => {
                        const id = getCompanySlug(company);
                        return (
                          <ListBoxItem
                            key={id}
                            id={id}
                            textValue={getCompanyName(company)}
                          >
                            {getCompanyName(company)}
                          </ListBoxItem>
                        );
                      })}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Job Title" required error={errors.title}>
              <input
                name="title"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={handleChange}
                className={inputClass(errors.title)}
              />
            </Field>
          </div>

          <Field label="Category" required>
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

          <Field label="Job Type" required>
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

          <Field label="Experience Level" required>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className={inputClass()}
            >
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Workplace Type" required>
            <select
              name="workplaceType"
              value={formData.workplaceType}
              onChange={handleChange}
              className={inputClass()}
            >
              {WORKPLACE_TYPES.map((wpt) => (
                <option key={wpt} value={wpt}>
                  {wpt}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Required Skills" error={errors.skills}>
              <div
                className={`flex flex-col gap-2 rounded-xl border bg-[#17191d] p-2 transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-emerald-500/20 ${
                  errors.skills ? "border-red-500" : "border-white/10"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-md bg-indigo-500/20 px-2 py-1 text-xs text-indigo-500"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-indigo-500 hover:text-indigo-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    name="skills"
                    placeholder={
                      formData.skills.length === 0
                        ? "Type a skill and press Enter or Comma..."
                        : ""
                    }
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="flex-1 bg-transparent px-1 text-sm text-foreground placeholder-gray-500 focus:outline-none min-w-[120px]"
                  />
                </div>
              </div>
            </Field>
          </div>

          <Field label="Salary Min" required error={errors.salaryMin}>
            <input
              name="salaryMin"
              type="number"
              placeholder="60000"
              value={formData.salaryMin}
              onChange={handleChange}
              className={inputClass(errors.salaryMin)}
            />
          </Field>

          <Field label="Salary Max" required error={errors.salaryMax}>
            <input
              name="salaryMax"
              type="number"
              placeholder="90000"
              value={formData.salaryMax}
              onChange={handleChange}
              className={inputClass(errors.salaryMax)}
            />
          </Field>

          <Field label="Currency" required>
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

          <Field label="Deadline" required error={errors.deadline}>
            <input
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              className={inputClass(errors.deadline)}
            />
          </Field>

          <Field
            label="City"
            required={formData.workplaceType !== "Remote" && !formData.remote}
            error={errors.city}
          >
            <input
              name="city"
              placeholder="San Francisco"
              value={formData.city}
              onChange={handleChange}
              disabled={formData.workplaceType === "Remote" || formData.remote}
              className={`${inputClass(errors.city)} disabled:opacity-40`}
            />
          </Field>

          <Field
            label="Country"
            required={formData.workplaceType !== "Remote" && !formData.remote}
            error={errors.country}
          >
            <input
              name="country"
              placeholder="USA"
              value={formData.country}
              onChange={handleChange}
              disabled={formData.workplaceType === "Remote" || formData.remote}
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
              <span className="text-sm text-gray-300">
                This job is fully remote
              </span>
            </label>
            <label className="mt-2 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="isPublicVisible"
                checked={formData.isPublicVisible}
                onChange={handleChange}
                className="size-4 accent-indigo-500"
              />
              <span className="text-sm text-gray-300">
                Show this job publicly on the careers page
              </span>
            </label>
          </div>
        </div>

        <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
          <Field
            label="Role Description / Mission"
            required
            error={errors.description}
          >
            <textarea
              name="description"
              placeholder="Provide a general overview of the role and its mission..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`${inputClass(errors.description)} resize-y`}
            />
          </Field>

          <Field
            label="Responsibilities"
            required
            error={errors.responsibilities}
          >
            <textarea
              name="responsibilities"
              placeholder="List the key responsibilities..."
              value={formData.responsibilities}
              onChange={handleChange}
              rows={3}
              className={`${inputClass(errors.responsibilities)} resize-y`}
            />
          </Field>

          <Field label="Requirements" required error={errors.requirements}>
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

        {!usage.hasAvailableSlots && !isEditing && (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
            <CircleInfo className="size-4 shrink-0" />
            You&apos;ve reached your active job limit. Close a job or upgrade
            your plan.
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/recruiter/jobs")}
            className="h-11 rounded-xl border border-default-200 bg-default px-5 text-sm font-medium text-foreground transition-colors hover:border-indigo-500/40 hover:bg-default-foreground/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!isEditing && !usage.hasAvailableSlots)}
            className="h-11 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 text-sm font-semibold text-foreground shadow-lg shadow-indigo-500/20 transition-colors hover:from-indigo-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? isEditing
                ? "Saving…"
                : "Posting…"
              : isEditing
                ? "Save Changes"
                : "Post Job"}
          </button>
        </div>
      </div>
    </form>
  );
}
