"use client";

import { Avatar, Chip, Table } from "@heroui/react";
import AdminCompanyButtons from "./AdminCompanyButtons";
import { Check, Clock, Ban } from "@gravity-ui/icons";

function StatusChip({ status }) {
  const iconClass = "w-3 h-3";
  if (status === "pending") {
    return (
      <Chip size="sm" variant="flat" color="warning">
        <span className="inline-flex items-center gap-1">
          <Clock className={iconClass} /> Pending
        </span>
      </Chip>
    );
  }
  if (status === "deactivated") {
    return (
      <Chip size="sm" variant="flat" color="danger">
        <span className="inline-flex items-center gap-1">
          <Ban className={iconClass} /> Deactivated
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

export default function CompaniesTable({ companies }) {
  return (
    <Table.Root className="w-full">
      <Table.Content aria-label="Companies table">
        <Table.Header className="border-b border-default">
          <Table.Column
            isRowHeader
            className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Company
          </Table.Column>
          <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Owner ID
          </Table.Column>
          <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </Table.Column>
          <Table.Column className="py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Actions
          </Table.Column>
        </Table.Header>
        <Table.Body>
          {companies.map((c) => (
            <Table.Row
              key={String(c._id)}
              className="border-b border-default transition-colors last:border-b-0 hover:bg-white/[0.02]"
            >
              <Table.Cell className="py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name ?? c.companySlug ?? "?"} size="sm" />
                  <div>
                    <p className="font-medium text-sm">
                      {c.name ?? c.companySlug ?? String(c._id)}
                    </p>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell className="py-4">
                <span className="text-xs font-mono text-muted-foreground">{c.recruiterId}</span>
              </Table.Cell>
              <Table.Cell className="py-4">
                <StatusChip status={c.status} />
              </Table.Cell>
              <Table.Cell className="py-4 text-right">
                <AdminCompanyButtons id={c.companySlug ?? c.companyId ?? String(c._id)} status={c.status} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Content>
    </Table.Root>
  );
}
