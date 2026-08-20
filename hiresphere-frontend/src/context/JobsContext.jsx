"use client";

import { INITIAL_JOBS, jobFromForm } from "@/lib/jobs";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const JobsContext = createContext(null);

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState(INITIAL_JOBS);

  const addJob = useCallback((formData) => {
    setJobs((prev) => [jobFromForm(formData), ...prev]);
  }, []);

  const updateJob = useCallback((id, formData) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? jobFromForm(formData, job) : job)),
    );
  }, []);

  const deleteJob = useCallback((id) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  }, []);

  const toggleStatus = useCallback((id) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, status: job.status === "active" ? "closed" : "active" }
          : job,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ jobs, addJob, updateJob, deleteJob, toggleStatus }),
    [jobs, addJob, updateJob, deleteJob, toggleStatus],
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
}
