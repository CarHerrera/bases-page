import type { ComponentChild } from "preact";
import type { BasesEntry } from "../../types";
import { formatValue, resolveEntryPropertyValue } from "./cell";

function toValueList(raw: unknown): unknown[] {
  return Array.isArray(raw) ? raw : [raw];
}

/** Distinct, sorted string values of `property` across `entries` (flattening list properties). */
export function getDistinctPropertyValues(entries: BasesEntry[], property: string): string[] {
  const seen = new Set<string>();
  for (const entry of entries) {
    for (const value of toValueList(resolveEntryPropertyValue(property, entry))) {
      if (value === undefined || value === null || value === "") continue;
      seen.add(formatValue(value));
    }
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

/** JSON-encoded list of an entry's values for `property`, for the client-side filter script. */
export function entryFilterValues(entry: BasesEntry, property: string): string {
  const values = toValueList(resolveEntryPropertyValue(property, entry))
    .filter((v) => v !== undefined && v !== null && v !== "")
    .map(formatValue);
  return JSON.stringify(values);
}

export function FilterChips({
  entries,
  property,
}: {
  entries: BasesEntry[];
  property: string;
}): ComponentChild {
  const values = getDistinctPropertyValues(entries, property);
  if (values.length === 0) return null;
  return (
    <div class="bases-filter-chips" data-filter-property={property}>
      {values.map((value) => (
        <button type="button" class="bases-filter-chip" data-value={value}>
          {value}
        </button>
      ))}
    </div>
  );
}
