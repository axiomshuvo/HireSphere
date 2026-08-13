"use client";

import { ArrowRight } from "@gravity-ui/icons";
import { Button, Card, Table, Typography } from "@heroui/react";

const columnClassName =
  "py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground";

export default function DataTable({ title, columns, rows, viewAllLabel = "View all" }) {
  return (
    <Card className="rounded-2xl border border-default bg-content1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <Typography.Heading className="text-lg font-semibold text-white" level={2}>
          {title}
        </Typography.Heading>
        <Button className="text-sm text-muted-foreground" variant="light">
          {viewAllLabel}
          <ArrowRight className="size-4" />
        </Button>
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
                className="border-b border-default last:border-b-0"
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
