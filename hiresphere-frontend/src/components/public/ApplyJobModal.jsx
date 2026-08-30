"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Ban,
  Briefcase,
  Check,
  Xmark,
} from "@gravity-ui/icons";
import { Button, Input, Textarea } from "@heroui/react";
import { applyToJob, fetchApplicationForJob } from "@/lib/actions/applications";
import { toast } from "@heroui/react";
import { appliedJobsKey, migrateLegacyKeys } from "@/lib/storage-keys";

function readLocalApplied(key) {
  if (typeof window === "undefined" || !key) return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeLocalApplied(key, set) {
  if (typeof window === "undefined" || !key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new Event("hiresphere:appliedJobs-changed"));
  } catch {
    // ignore
  }
}

const inputClass = (error) =>
  `w-full rounded-lg border bg-[#1b1c1e] px-3 py-2 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none ${
    error
      ? "border-red-500 focus:border-red-500"
      : "border-white/10 focus:border-indigo-500"
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

export default function ApplyJobModal({ jobId, jobTitle, companySlug, open, onClose, onApplied }) {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [existingApp, setExistingApp] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const userId = session?.user?.id;
  const lsKey = userId ? appliedJobsKey(userId) : null;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    coverLetter: "",
    expectedSalary: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Prefill name/email from session and check for an existing application
  // each time the modal opens.
  useEffect(() => {
    if (!open) return;
    if (session?.user) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.user.name || "",
        email: prev.email || session.user.email || "",
      }));
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    setError("");
    setFieldErrors({});
    // Instant localStorage check before server fetch.
    if (lsKey) migrateLegacyKeys(userId);
    const localApplied = lsKey ? readLocalApplied(lsKey) : new Set();
    if (localApplied.has(jobId)) {
      setExistingApp({ jobId, status: "submitted", appliedAt: new Date().toISOString(), _local: true });
      setLoadingStatus(false);
      return;
    }
    setLoadingStatus(true);
    if (session?.user) {
      fetchApplicationForJob(jobId)
        .then((application) => {
          setExistingApp(application);
        })
        .finally(() => setLoadingStatus(false));
    } else {
      setLoadingStatus(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobId, session?.user?.id]);

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
    setError("");

    // Optimistic local write — instant "Applied" state in the UI
    // and on the dashboard list, before the server confirms.
    if (lsKey) migrateLegacyKeys(userId);
    const localApplied = lsKey ? readLocalApplied(lsKey) : new Set();
    const wasApplied = localApplied.has(jobId);
    if (!wasApplied) {
      localApplied.add(jobId);
      if (lsKey) writeLocalApplied(lsKey, localApplied);
      setExistingApp({ jobId, status: "submitted", appliedAt: new Date().toISOString(), _local: true });
    }

    setSubmitting(true);
    try {
      const result = await applyToJob({
        jobId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        resumeUrl: form.resumeUrl.trim() || undefined,
        coverLetter: form.coverLetter.trim() || undefined,
        expectedSalary: form.expectedSalary
          ? Number(form.expectedSalary)
          : undefined,
      });
      const app = result?.application;
      if (app) {
        setExistingApp(app);
        onApplied?.(app);
      }
      toast.success("Application submitted!");
    } catch (err) {
      const message = err?.message ?? "Could not submit application";
      // Roll back optimistic local write on failure.
      if (!wasApplied && lsKey) {
        const rolled = readLocalApplied(lsKey);
        rolled.delete(jobId);
        writeLocalApplied(lsKey, rolled);
        setExistingApp(null);
      }
      setError(message);
      toast.warning("Could not submit application", {
        description: message,
      });
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
          className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-[#1b1c1e] text-muted-foreground transition-colors hover:border-indigo-500/50 hover:text-white"
        >
          <Xmark className="size-4" />
        </button>

        <header className="mb-5 pr-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Briefcase className="size-3.5" />
            {companySlug ? `${companySlug} • Apply` : "Apply"}
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            {jobTitle ?? "Apply to this role"}
          </h2>
        </header>

        {sessionLoading || loadingStatus ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading application status…
          </div>
        ) : !session?.user ? (
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
            <h3 className="text-lg font-semibold text-white">
              Recruiter accounts can&apos;t apply
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Applications are submitted through a seeker account.
              Sign in with a seeker account to apply to this role.
            </p>
            <Button variant="secondary" onPress={onClose}>
              Close
            </Button>
          </div>
        ) : existingApp ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <Check className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              You&apos;ve already applied
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Submitted on{" "}
              {new Date(existingApp.appliedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              . The recruiter will be in touch if you&apos;re a match.
            </p>
            <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
              <Button variant="secondary" onPress={onClose}>
                Close
              </Button>
              <a
                href="/dashboard/applications"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
              >
                View my applications
                <ArrowRight className="size-4" />
              </a>
            </div>
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
                className="h-10 rounded-lg border border-white/10 bg-[#1b1c1e] px-5 text-sm font-medium text-white transition-colors hover:border-indigo-500/50"
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
