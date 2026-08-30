import { LogEntry } from "../types";
import dayjs from "dayjs";
import { DATE_FMT } from "./date";

export const isDayComplete = (
  value: number | undefined,
  target: number | null,
): boolean => {
  if (!value || value <= 0) return false;
  if (target && target > 0) return value >= target;
  return value > 0;
};

export const completionRatio = (
  value: number,
  target: number | null,
): number => {
  if (target && target > 0) return Math.min(1, value / target);
  return value > 0 ? 1 : 0;
};

// Map of date -> value for a single habit.
export const valueMap = (logs: LogEntry[]): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const l of logs) map[l.date] = l.value;
  return map;
};

// Set of completed date strings for a habit.
const completedSet = (logs: LogEntry[], target: number | null): Set<string> => {
  const s = new Set<string>();
  for (const l of logs) if (isDayComplete(l.value, target)) s.add(l.date);
  return s;
};

// Current streak: consecutive complete days ending today (or yesterday if
// today isn't done yet — so the streak is preserved until end of day).
export const currentStreak = (
  logs: LogEntry[],
  target: number | null,
): number => {
  const done = completedSet(logs, target);
  if (done.size === 0) return 0;
  let cursor = dayjs();
  if (!done.has(cursor.format(DATE_FMT))) {
    cursor = cursor.subtract(1, "day");
  }
  let count = 0;
  while (done.has(cursor.format(DATE_FMT))) {
    count += 1;
    cursor = cursor.subtract(1, "day");
  }
  return count;
};

export const longestStreak = (
  logs: LogEntry[],
  target: number | null,
): number => {
  const done = [...completedSet(logs, target)].sort();
  if (done.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < done.length; i++) {
    const prev = dayjs(done[i - 1]);
    const cur = dayjs(done[i]);
    if (cur.diff(prev, "day") === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
};
