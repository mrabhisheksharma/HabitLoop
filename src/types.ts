export type TrackingType =
  | "duration"
  | "reps"
  | "volume"
  | "distance"
  | "steps"
  | "pages"
  | "calories"
  | "custom";

export interface TargetHistoryEntry {
  effective_from: string; // YYYY-MM-DD
  target_value: number | null;
}

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji
  category: string;
  tracking_type: TrackingType;
  unit?: string; // e.g. "ml", "min", "steps", "km", "pages", "reps", "kcal", "cups"
  target_value: number | null;
  target_history?: TargetHistoryEntry[]; // Historical target changes
  color: string; // accent hex used for card highlights
  created_at: string; // ISO
  archived: boolean;
  quick_increments?: number[]; // custom or auto quick steps
}

export interface LogEntry {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  value: number;
  created_at: string; // ISO
}

export type TabType = "today" | "calendar" | "habits" | "stats";
