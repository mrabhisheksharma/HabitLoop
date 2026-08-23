export type TrackingType = "duration" | "reps";

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji
  category: string;
  tracking_type: TrackingType;
  target_value: number | null;
  color: string; // accent hex used for card highlights
  created_at: string; // ISO
  archived: boolean;
}

export interface LogEntry {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  value: number;
  created_at: string; // ISO
}
