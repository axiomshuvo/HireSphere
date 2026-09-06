"use client";

import { Chip, Table } from "@heroui/react";
import AdminJobButtons from "./AdminJobButtons";
import { Check, Ban, Pause } from "@gravity-ui/icons";

function StatusChip({ status }) {
  const iconClass = "w-3 h-3";
  if (status === "paused") {
    return (
      <Chip size="sm" variant="flat" color="warning">
        <span className="inline-flex items-center gap-1">
          <Pause className={iconClass} /> Paused
        </span>
      </Chip>
    );
  }
  if (status === "closed") {
    return (
      <Chip size="sm" variant="flat" color="danger">
        <span className="inline-flex items-center gap-1">
          <Ban className={iconClass} /> Closed
        </span>
      </Chip>
    );
  }
  return (
    <Chip size="sm" variant="flat" color="success">
      <span className="inline-flex items-center gap-1">
        <Check className={iconClass} /> Active
      </span>
    </Chip>
  );
}

export default function JobsTable({ jobs }) {
  return (
    <Table.Root className="w-full">
      <Table.Content aria-label="Jobs table">
        <Table.Header className="border-b border-default">
          <Table.Column
            isRowHeader
            className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Job title
          </Table.Column>
          <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Company / Applicants
          </Table.Column>
          <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </Table.Column>
          <Table.Column className="py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Actions
          </Table.Column>
        </Table.Header>
        <Table.Body>
          {jobs.map((j) => (
            <Table.Row
              key={String(j._id)}
              className="border-b border-default transition-colors last:border-b-0 hover:bg-white/[0.02]"
            >
              <Table.Cell className="py-4">
                <p className="font-medium text-sm">{j.title}</p>
                <p className="text-xs text-muted-foreground font-mono">{j.jobId ?? String(j._id)}</p>
              </Table.Cell>
              <Table.Cell className="py-4">
                <p className="text-sm">{j.companySlug ?? j.companyId}</p>
                <p className="text-xs text-muted-foreground">{j.applicants ?? 0} applicants</p>
              </Table.Cell>
              <Table.Cell className="py-4">
                <StatusChip status={j.status} />
              </Table.Cell>
              <Table.Cell className="py-4 text-right">
                <AdminJobButtons id={j.jobId ?? j.slug ?? String(j._id)} status={j.status} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Content>
    </Table.Root>
  );
}
