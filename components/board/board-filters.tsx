"use client";

import {
  type BoardFilter,
  type FilterOption,
  type FilterOptions,
  isFilterActive,
} from "@/lib/view/board-filter";

function FilterSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <select
      aria-label={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className="h-8 rounded-lg border border-border bg-surface px-2 text-[13px] text-fg hover:border-border-strong focus:border-accent focus:outline-none"
      data-active={value !== null ? "" : undefined}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function BoardFilters({
  options,
  filter,
  onChange,
  shown,
  total,
}: {
  options: FilterOptions;
  filter: BoardFilter;
  onChange: (filter: BoardFilter) => void;
  shown: number;
  total: number;
}) {
  const active = isFilterActive(filter);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
      <FilterSelect
        placeholder="Assignee"
        options={options.assignees}
        value={filter.assignee}
        onChange={(assignee) => onChange({ ...filter, assignee })}
      />
      <FilterSelect
        placeholder="Label"
        options={options.labels}
        value={filter.label}
        onChange={(label) => onChange({ ...filter, label })}
      />
      <FilterSelect
        placeholder="Milestone"
        options={options.milestones}
        value={filter.milestone}
        onChange={(milestone) => onChange({ ...filter, milestone })}
      />
      {active && (
        <>
          <span className="text-[12px] text-fg-subtle">
            {shown} of {total} shown
          </span>
          <button
            type="button"
            onClick={() =>
              onChange({ assignee: null, label: null, milestone: null })
            }
            className="rounded-lg px-2 py-1 text-[12px] text-fg-muted hover:bg-hover"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}
