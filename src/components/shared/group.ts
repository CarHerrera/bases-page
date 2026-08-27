import type { BasesEntry } from "../../types";
import { formatValue, isEmptyValue, resolveEntryPropertyValue } from "./cell";

/**
 * Group entries by a property value, preserving first-seen group order.
 * Mirrors the grouping behavior already used by the table and board views
 * so every view type buckets entries the same way.
 */
export function groupEntries(
  entries: BasesEntry[],
  groupProperty: string | undefined,
  emptyLabel: string,
): Map<string, BasesEntry[]> | null {
  if (!groupProperty) return null;
  const groups = new Map<string, BasesEntry[]>();
  for (const entry of entries) {
    const rawValue = resolveEntryPropertyValue(groupProperty, entry);
    const label = isEmptyValue(rawValue) ? emptyLabel : formatValue(rawValue);
    const key = label || emptyLabel;
    const existing = groups.get(key);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(key, [entry]);
    }
  }
  return groups.size > 0 ? groups : null;
}
