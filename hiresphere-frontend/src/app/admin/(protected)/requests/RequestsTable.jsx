"use client";

import { Table, Chip, Button, Tooltip } from "@heroui/react";
import AdminRequestButtons from "./AdminRequestButtons";

export default function RequestsTable({ requests }) {
  return (
    <Table.Root className="w-full bg-content1 overflow-hidden"><Table.Content aria-label="Subscription requests table">
      <Table.Header className="border-b border-default-200">
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">USER ID</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">REQUEST TYPE</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">TARGET PLAN</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">DATE</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4 text-right">ACTIONS</Table.Column>
      </Table.Header>
      <Table.Body>
        {requests.map((s) => {
          const type = s.pendingRequest?.type;
          return (
            <Table.Row className="border-b border-default-100 last:border-0 hover:bg-default-50 transition-colors" key={String(s._id)}>
              <Table.Cell className="py-4 px-4 align-middle">
                <p className="font-mono text-xs text-muted-foreground">{s.userId}</p>
              </Table.Cell>
              <Table.Cell className="py-4 px-4 align-middle">
                <Chip size="sm" variant="flat" color={type === "cancel" ? "danger" : "warning"}>
                  {type?.toUpperCase() ?? "UNKNOWN"}
                </Chip>
              </Table.Cell>
              <Table.Cell className="py-4 px-4 align-middle">
                <p className="text-sm font-medium">{s.pendingRequest?.targetPlan ?? "N/A"}</p>
              </Table.Cell>
              <Table.Cell className="py-4 px-4 align-middle">
                <p className="text-xs text-muted-foreground">
                  {s.pendingRequest?.requestedAt
                    ? new Date(s.pendingRequest.requestedAt).toLocaleDateString()
                    : "—"}
                </p>
              </Table.Cell>
              <Table.Cell className="py-4 px-4 align-middle">
                <div className="flex justify-end">
                  <AdminRequestButtons id={String(s._id)} />
                </div>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Content></Table.Root>
  );
}
