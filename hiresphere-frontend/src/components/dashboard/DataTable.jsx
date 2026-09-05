"use client";

import { ArrowRight } from "@gravity-ui/icons";
import { Button, Card, Table, Typography } from "@heroui/react";

import Link from "next/link";

const columnClassName =
  "py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground";

export default function DataTable({
  title,
  columns,
  rows,
  viewAllLabel = "View all",
  viewAllHref,
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border border-default bg-content1 p-5">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-indigo-500/0"
      />
      <div className="mb-4 flex items-center justify-between">
        <Typography.Heading
          className="text-lg font-semibold text-foreground"
          level={2}
        >
          {title}
        </Typography.Heading>
        {viewAllHref && (
          <Button
            as={Link}
            href={viewAllHref}
            className="text-sm text-indigo-500 hover:text-indigo-600"
            variant="light"
            endContent={<ArrowRight className="size-4" />}
          >
            {viewAllLabel}
          </Button>
        )}
      </div>

      <Table.Root className="w-full">
        <Table.Content aria-label={title}>
          <Table.Header className="border-b border-default">
            {columns.map((column, index) => (
              <Table.Column
                key={column.key}
                className={columnClassName}
                isRowHeader={index === 0}
              >
                {column.label}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {rows.map((row, rowIndex) => (
              <Table.Row
                key={row.id ?? rowIndex}
                className="border-b border-default transition-colors last:border-b-0 hover:bg-white/[0.02]"
              >
                {columns.map((column) => (
                  <Table.Cell
                    key={column.key}
                    className={column.cellClassName ?? "py-4 text-foreground"}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.Root>
    </Card>
  );
}
