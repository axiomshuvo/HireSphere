"use client";

import { Avatar, Chip, Table } from "@heroui/react";
import Link from "next/link";
import { Ban, Check } from "@gravity-ui/icons";
import AdminUserActions from "./AdminUserActions";

function StatusChip({ status }) {
  if (status === "deactivated") {
    return (
      <Chip size="sm" variant="flat" color="danger">
        <span className="inline-flex items-center gap-1">
          <Ban className="w-3 h-3" /> Deactivated
        </span>
      </Chip>
    );
  }
  return (
    <Chip size="sm" variant="flat" color="success">
      <span className="inline-flex items-center gap-1">
        <Check className="w-3 h-3" /> Active
      </span>
    </Chip>
  );
}

export default function UsersTable({ users }) {
  return (
    <Table.Root className="w-full">
      <Table.Content aria-label="Users table">
        <Table.Header className="border-b border-default">
          <Table.Column
            isRowHeader
            className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            User
          </Table.Column>
          <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Role
          </Table.Column>
          <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Plan
          </Table.Column>
          <Table.Column className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </Table.Column>
          <Table.Column className="py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Actions
          </Table.Column>
        </Table.Header>
        <Table.Body>
          {users.map((u) => (
            <Table.Row
              key={String(u._id)}
              className="border-b border-default transition-colors last:border-b-0 hover:bg-white/[0.02]"
            >
              <Table.Cell className="py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name || u.email || "?"} size="sm" />
                  <div>
                    <p className="font-medium text-sm">
                      <Link className="hover:text-indigo-500 transition-colors" href={`/admin/users/${u._id}`}>
                        {u.name ?? "Unknown"}
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell className="py-4">
                <Chip size="sm" variant="flat" color={u.role === "recruiter" ? "secondary" : "primary"}>
                  {u.role}
                </Chip>
              </Table.Cell>
              <Table.Cell className="py-4">
                <span className="text-xs uppercase font-semibold text-muted-foreground">{u.plan || "Free"}</span>
              </Table.Cell>
              <Table.Cell className="py-4">
                <StatusChip status={u.status} />
              </Table.Cell>
              <Table.Cell className="py-4 text-right">
                <AdminUserActions id={String(u._id)} status={u.status ?? "active"} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Content>
    </Table.Root>
  );
}
