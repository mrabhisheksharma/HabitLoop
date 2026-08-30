import { Habit, TargetHistoryEntry } from "../types";

/**
 * Returns the effective target for a given date based on habit's target history.
 * If target history entries exist:
 *   - Matches the latest entry where effective_from <= dateStr
 *   - If dateStr is before all effective_from entries, returns the earliest entry's target_value
 * Fallback to habit.target_value if no history.
 */
export function getTargetForDate(
  habit: Habit | null | undefined,
  dateStr: string
): number | null {
  if (!habit) return null;

  if (!habit.target_history || habit.target_history.length === 0) {
    return habit.target_value ?? null;
  }

  // Sort history entries chronologically
  const sorted = [...habit.target_history].sort((a, b) =>
    a.effective_from.localeCompare(b.effective_from)
  );

  // If dateStr is before the first recorded effective date, return the earliest target
  let effectiveTarget: number | null = sorted[0].target_value ?? null;
  for (const entry of sorted) {
    if (entry.effective_from <= dateStr) {
      effectiveTarget = entry.target_value ?? null;
    } else {
      break;
    }
  }

  return effectiveTarget;
}

/**
 * Updates habit target history when target_value is modified.
 * Ensures earlier dates retain the old target (with an anchor from 2020-01-01 or habit creation),
 * and the new target takes effect starting from effectiveFrom (e.g. today).
 */
export function updateTargetHistory(
  existingHistory: TargetHistoryEntry[] | undefined,
  oldTarget: number | null,
  newTarget: number | null,
  effectiveFrom: string, // YYYY-MM-DD
  createdAt?: string
): TargetHistoryEntry[] {
  let history: TargetHistoryEntry[] = existingHistory
    ? existingHistory.map((h) => ({ ...h }))
    : [];

  // Check if we need an anchor for dates prior to effectiveFrom
  const hasPastAnchor = history.some((h) => h.effective_from < effectiveFrom);
  if (!hasPastAnchor && oldTarget !== null && oldTarget !== undefined) {
    const start =
      createdAt && createdAt.slice(0, 10) < effectiveFrom
        ? createdAt.slice(0, 10)
        : "2020-01-01";
    history.push({
      effective_from: start,
      target_value: oldTarget,
    });
  }

  const existingIdx = history.findIndex((h) => h.effective_from === effectiveFrom);
  if (existingIdx >= 0) {
    history[existingIdx].target_value = newTarget;
  } else {
    history.push({
      effective_from: effectiveFrom,
      target_value: newTarget,
    });
  }

  return history.sort((a, b) => a.effective_from.localeCompare(b.effective_from));
}
