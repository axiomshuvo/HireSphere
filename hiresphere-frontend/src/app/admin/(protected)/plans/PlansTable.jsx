"use client";

import { Table, Chip, Button, Tooltip } from "@heroui/react";
import Link from "next/link";
import { Pencil, TrashBin, Check, Ban } from "@gravity-ui/icons";
import AdminPlanDelete from "./AdminPlanDelete";

export default function PlansTable({ plans }) {
  return (
    <Table.Root className="w-full bg-content1 overflow-hidden"><Table.Content aria-label="Subscription plans table">
      <Table.Header className="border-b border-default-200">
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">PLAN DETAILS</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">LIMITS</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4">STATUS</Table.Column>
        <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground px-4 text-right">ACTIONS</Table.Column>
      </Table.Header>
      <Table.Body>
        {plans.map((p) => (
          <Table.Row className="border-b border-default-100 last:border-0 hover:bg-default-50 transition-colors" key={String(p._id)}>
            <Table.Cell className="py-4 px-4 align-middle">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{p.name}</p>
                  <Chip size="sm" variant="flat" color={p.role === "recruiter" ? "secondary" : "primary"}>
                    {p.role}
                  </Chip>
                </div>
                <p className="text-xs font-mono text-muted-foreground">{p.planId}</p>
                <p className="text-xs font-medium text-success-500">
                  ${p.pricing?.amount ?? 0} {p.pricing?.cadence ? `per ${p.pricing.cadence}` : ""}
                </p>
              </div>
            </Table.Cell>
            <Table.Cell className="py-4 px-4 align-middle">
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">Jobs:</span> {p.limits?.activeJobPosts === -1 ? "Unlimited" : (p.limits?.activeJobPosts ?? 0)}</p>
                <p><span className="font-medium text-foreground">Apps:</span> {p.limits?.applicationsPerMonth === -1 ? "Unlimited" : (p.limits?.applicationsPerMonth ?? 0)}</p>
                <p><span className="font-medium text-foreground">Saved:</span> {p.limits?.savedJobs === -1 ? "Unlimited" : (p.limits?.savedJobs ?? 0)}</p>
              </div>
            </Table.Cell>
            <Table.Cell className="py-4 px-4 align-middle">
              {p.isActive === false ? (
                <Chip size="sm" variant="flat" color="danger" startContent={<Ban className="w-3 h-3" />}>Hidden</Chip>
              ) : (
                <Chip size="sm" variant="flat" color="success" startContent={<Check className="w-3 h-3" />}>Visible</Chip>
              )}
            </Table.Cell>
            <Table.Cell className="py-4 px-4 align-middle">
              <div className="flex gap-2 justify-end">
                <Tooltip content="Edit Plan">
                  <Button
                    as={Link}
                    href={`/admin/plans/${p._id}/edit`}
                    size="sm"
                    color="primary"
                    variant="flat"
                    isIconOnly
                  >
                    <Pencil className="size-4" />
                  </Button>
                </Tooltip>
                <AdminPlanDelete id={String(p._id)} />
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Content></Table.Root>
  );
}
