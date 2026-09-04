"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ArrowRight, Ban, Briefcase, Check, Xmark } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { applyToJob } from "@/lib/actions/applications";
import { toast } from "@heroui/react";

const inputClass = (error) =>
  `w-full rounded-lg border bg-default-100 px-3 py-2 text-sm text-foreground placeholder-gray-500 transition-colors focus:outline-none ${
    error ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-indigo-500"
  }`;

const labelClass = "mb-1 block text-xs font-medium text-gray-400";

function Field({ label, error, children, optional = false }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {optional && (
          <span className="ml-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            (optional)
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ApplyJobModal({
  jobId,
  jobTitle,
  companySlug,
  recruiterId,
  open,
  onClose,
  onApplied,
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    coverLetter: "",
    expectedSalary: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Prefill name/email from session when the modal opens.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!open) return;
    setError("");
    setFieldErrors({});
    setForm((prev) => ({
      ...prev,
      name: prev.name || session?.user?.name || "",
      email: prev.email || session?.user?.email || "",
    }));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, session]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (form.resumeUrl && !/^https?:\/\//i.test(form.resumeUrl))
      errs.resumeUrl = "Resume URL must start with http(s)://";
    if (form.expectedSalary && Number.isNaN(Number(form.expectedSalary)))
      errs.expectedSalary = "Expected salary must be a number";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError("");
    try {
      await applyToJob({
        jobId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        resumeUrl: form.resumeUrl.trim() || undefined,
        coverLetter: form.coverLetter.trim() || undefined,
        expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : undefined,
        recruiterId,
      });
      toast.success("Application submitted!");
      onApplied?.();
      router.refresh();
    } catch (err) {
      const message = err?.message ?? "Could not submit application";
      setError(message);
      toast.warning("Could not submit application", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = () => {
    onClose?.();
    router.push(`/auth/signin?next=/jobs/${jobId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-8 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-default bg-[#15171a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg border border-default-200 bg-default-100 text-muted-foreground transition-colors hover:border-indigo-500/50 hover:text-foreground"
        >
          <Xmark className="size-4" />
        </button>

        <header className="mb-5 pr-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Briefcase className="size-3.5" />
            {companySlug ? `${companySlug} • Apply` : "Apply"}
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {jobTitle ?? "Apply to this role"}
          </h2>
        </header>

        {!session?.user ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sign in to your HireSphere account to apply. We&apos;ll prefill your
              name and email.
            </p>
            <Button variant="primary" onPress={handleSignIn}>
              Sign in to apply
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : session.user.role !== "seeker" ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-default bg-[#1b1c1e] px-6 py-10 text-center">
            <Ban className="size-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">
              Recruiter accounts can&apos;t apply
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Applications are submitted through a seeker account. Sign in
              with a seeker account to apply to this role.
            </p>
            <Button variant="secondary" onPress={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" error={fieldErrors.name}>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  autoComplete="name"
                  className={inputClass(fieldErrors.name)}
                />
              </Field>
              <Field label="Email" error={fieldErrors.email}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass(fieldErrors.email)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone" optional>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 555 0100"
                  autoComplete="tel"
                  className={inputClass()}
                />
              </Field>
              <Field label="Expected salary (USD)" optional>
                <input
                  type="number"
                  name="expectedSalary"
                  value={form.expectedSalary}
                  onChange={handleChange}
                  placeholder="120000"
                  className={inputClass(fieldErrors.expectedSalary)}
                />
              </Field>
            </div>

            <Field label="Resume URL" optional error={fieldErrors.resumeUrl}>
              <input
                type="url"
                name="resumeUrl"
                value={form.resumeUrl}
                onChange={handleChange}
                placeholder="https://your-portfolio.com/resume.pdf"
                className={inputClass(fieldErrors.resumeUrl)}
              />
            </Field>

            <Field label="Cover letter" optional>
              <textarea
                name="coverLetter"
                value={form.coverLetter}
                onChange={handleChange}
                rows={5}
                placeholder="Tell the team why you're a fit for this role…"
                className={`${inputClass()} resize-y`}
              />
            </Field>

            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <div className="mt-2 flex flex-col-reverse items-stretch justify-end gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-lg border border-default-200 bg-default-100 px-5 text-sm font-medium text-foreground transition-colors hover:border-indigo-500/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}