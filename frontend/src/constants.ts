import { Habit } from "./types";

export const EMOJI_CHOICES = [
  "💪", "🏃", "🚶", "🧘", "📚", "✍️", "💧", "🥗",
  "😴", "🧠", "🎯", "🎸", "🎨", "🧹", "💰", "☀️",
  "🏋️", "🚴", "🏊", "⚽", "🍎", "☕", "🌱", "🙏",
  "📝", "💻", "🎧", "🛏️", "🚭", "🧴", "🦷", "❤️",
];

export const CATEGORY_PRESETS = [
  "Fitness",
  "Learning",
  "Health",
  "Mindfulness",
  "Custom",
];

export const CATEGORY_COLORS: Record<string, string> = {
  Fitness: "#00D084",
  Learning: "#00C2FF",
  Health: "#FF9E57",
  Mindfulness: "#B692FF",
  Custom: "#FFB320",
};

export const categoryColor = (category: string): string =>
  CATEGORY_COLORS[category] ?? "#00C2FF";

const nowIso = () => new Date().toISOString();

// 4 pre-seeded habits so the app is never empty on first launch.
export const seedHabits = (): Habit[] => [
  {
    id: "seed-pushups",
    name: "Pushups",
    icon: "💪",
    category: "Fitness",
    tracking_type: "reps",
    target_value: 50,
    color: CATEGORY_COLORS.Fitness,
    created_at: nowIso(),
    archived: false,
  },
  {
    id: "seed-reading",
    name: "Reading",
    icon: "📚",
    category: "Learning",
    tracking_type: "duration",
    target_value: 30,
    color: CATEGORY_COLORS.Learning,
    created_at: nowIso(),
    archived: false,
  },
  {
    id: "seed-steps",
    name: "Walking / Steps",
    icon: "🚶",
    category: "Health",
    tracking_type: "reps",
    target_value: 10000,
    color: CATEGORY_COLORS.Health,
    created_at: nowIso(),
    archived: false,
  },
  {
    id: "seed-water",
    name: "Water Intake",
    icon: "💧",
    category: "Health",
    tracking_type: "reps",
    target_value: 8,
    color: CATEGORY_COLORS.Health,
    created_at: nowIso(),
    archived: false,
  },
];
