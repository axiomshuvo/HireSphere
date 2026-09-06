"use client";

import { Table, Chip, Button, Tooltip } from "@heroui/react";

export default function RevenueTable({ subscriptions }) {
  return (
    <Table.Root className="w-full bg-content1 overflow-hidden"><Table.Content aria-label="Recent subscriptions table">
      <Table.Header className="border-b border-default-200">
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">USER ID</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">PLAN</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">STATUS</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4 text-right">DATE</Table.Column>
      </Table.Header>
      <Table.Body>
        {subscriptions.map((s) => (
          <Table.Row className="border-b border-default-100 last:border-0 hover:bg-default-50 transition-colors" key={String(s._id)}>
            <Table.Cell className="py-4 px-4 align-middle">
              <p className="font-mono text-xs text-muted-foreground">{s.userId}</p>
            </Table.Cell>
            <Table.Cell className="py-4 px-4 align-middle">
              <p className="text-sm font-medium">{s.planId}</p>
            </Table.Cell>
            <Table.Cell className="py-4 px-4 align-middle">
              <Chip 
                size="sm" 
                variant="flat" 
                color={s.status === "active" ? "success" : s.status === "canceled" ? "danger" : "default"}
              >
                {s.status?.toUpperCase() ?? "UNKNOWN"}
              </Chip>
            </Table.Cell>
            <Table.Cell className="py-4 px-4 align-middle">
              <div className="flex justify-end">
                <p className="text-xs text-muted-foreground">
                  {new Date(s.updatedAt || s.createdAt).toLocaleString()}
                </p>
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Content></Table.Root>
  );
}
