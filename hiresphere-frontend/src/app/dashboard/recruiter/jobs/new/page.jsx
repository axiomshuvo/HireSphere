import JobForm from "@/components/dashboard/jobs/JobForm";

export default function NewJobPage() {
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

      <JobForm />
    </div>
  );
}
