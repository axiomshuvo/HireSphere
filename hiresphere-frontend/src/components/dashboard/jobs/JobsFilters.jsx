"use client";

import { Magnifier, OfficeBadge, Xmark } from "@gravity-ui/icons";

const STATUS_OPTIONS = [
  { id: "all", label: "All", dot: "bg-muted-foreground/60" },
  { id: "active", label: "Active", dot: "bg-emerald-400" },
  { id: "draft", label: "Drafts", dot: "bg-amber-400" },
  { id: "closed", label: "Closed", dot: "bg-red-400" },
];

export default function JobsFilters({
  counts = {},
  companies = [],
  currentStatus = "all",
  currentCompanyId = "all",
  query = "",
  onChangeStatus,
  onChangeCompany,
  onChangeQuery,
  onReset,
}) {
  const hasFilter =
    currentStatus !== "all" || currentCompanyId !== "all" || query.length > 0;

  return (
    <aside className="rounded-2xl border border-default bg-content1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </h2>
        {hasFilter && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex cursor-pointer items-center gap-1 text-xs text-indigo-500 transition-colors hover:text-indigo-600"
          >
            <Xmark className="size-3" />
            Reset
          </button>
        )}
      </div>

      <div className="mb-5">
        <label
          htmlFor="jobs-search"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Search
        </label>
        <div className="relative flex items-center">
          <Magnifier className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <input
            id="jobs-search"
            type="search"
            value={query}
            onChange={(e) => onChangeQuery?.(e.target.value)}
            placeholder="Title, company, location…"
            className="w-full rounded-lg border border-default-200 bg-default-100 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Status</p>
        <ul className="flex flex-col gap-1">
          {STATUS_OPTIONS.map((opt) => {
            const active = currentStatus === opt.id;
            const count = counts?.[opt.id] ?? 0;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => onChangeStatus?.(opt.id)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-default text-foreground"
                      : "text-muted-foreground hover:bg-default hover:text-foreground"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={`size-2 rounded-full ${opt.dot}`} />
                    {opt.label}
                  </span>
                  <span
                    className={`text-xs ${
                      active ? "text-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <OfficeBadge className="size-3" />
          Company
        </p>
        <select
          value={currentCompanyId}
          onChange={(e) => onChangeCompany?.(e.target.value)}
          className="w-full rounded-lg border border-default-200 bg-default-100 px-3 py-2 text-sm text-foreground focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
