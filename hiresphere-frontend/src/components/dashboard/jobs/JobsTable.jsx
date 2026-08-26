"use client";

import { formatJobDate, getJobCreatedAt, getJobId } from "@/lib/jobstruture";
import { Ban, Eye, Pencil, Play } from "@gravity-ui/icons";
import { Button, Card, Table, Typography } from "@heroui/react";
import { useRouter } from "next/navigation";
import DeleteJobDialog from "./DeleteJobDialog";
import JobStatusChip from "./JobStatusChip";

const columnClassName =
  "py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground";

export default function JobsTable({
  jobs,
  companyNameById = {},
  onToggleStatus,
  onDelete,
}) {
  const router = useRouter();

  const handleEdit = (job) => {
    const id = getJobId(job);
    if (!id) return;
    router.push(`/dashboard/recruiter/jobs/${id}/edit`);
  };

  const handleView = (job) => {
    const id = getJobId(job);
    if (!id) return;
    router.push(`/dashboard/recruiter/jobs/${id}`);
  };

  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography.Heading className="text-lg font-semibold text-white" level={2}>
            Manage Jobs
          </Typography.Heading>
          <Typography.Paragraph className="text-sm text-muted-foreground">
            {jobs.length} total
          </Typography.Paragraph>
        </div>
      </div>

      <Table.Root className="w-full">
        <Table.Content aria-label="Recruiter job posts">
          <Table.Header className="border-b border-default">
            <Table.Column className={columnClassName} isRowHeader>
              Job Title
            </Table.Column>
            <Table.Column className={columnClassName}>Company</Table.Column>
            <Table.Column className={columnClassName}>Status</Table.Column>
            <Table.Column className={columnClassName}>Applicants</Table.Column>
            <Table.Column className={columnClassName}>Date Posted</Table.Column>
            <Table.Column className={`${columnClassName} text-right`}>
              Actions
            </Table.Column>
          </Table.Header>
          <Table.Body>
            {jobs.map((job) => {
              const jobId = getJobId(job) ?? job.id ?? job._id;
              const companyName = job.companyId
                ? companyNameById[job.companyId] ?? "Unknown"
                : "—";

              return (
                <Table.Row
                  key={jobId}
                  className="border-b border-default last:border-b-0"
                >
                  <Table.Cell className="py-4 font-medium text-white">
                    {job.title}
                  </Table.Cell>
                  <Table.Cell className="py-4 text-foreground">
                    {companyName}
                  </Table.Cell>
                  <Table.Cell className="py-4">
                    <JobStatusChip status={job.status} />
                  </Table.Cell>
                  <Table.Cell className="py-4 text-foreground">
                    {job.applicants}
                  </Table.Cell>
                  <Table.Cell className="py-4 text-muted-foreground">
                    {formatJobDate(getJobCreatedAt(job))}
                  </Table.Cell>
                  <Table.Cell className="py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        aria-label={`Edit ${job.title}`}
                        onPress={() => handleEdit(job)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        aria-label={`View ${job.title}`}
                        onPress={() => handleView(job)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        aria-label={
                          job.status === "active"
                            ? `Close ${job.title}`
                            : `Reopen ${job.title}`
                        }
                        onPress={() => onToggleStatus(job)}
                      >
                        {job.status === "active" ? (
                          <Ban className="size-4" />
                        ) : (
                          <Play className="size-4" />
                        )}
                      </Button>
                      <DeleteJobDialog job={job} onConfirm={onDelete} />
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Content>
      </Table.Root>
    </Card>
  );
}
