import { Habit, TrackingType } from "./types";

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
  Fitness: "#3B82F6", // Electric Blue
  Learning: "#8B5CF6", // Royal Violet
  Health: "#EC4899", // Rose Magenta
  Mindfulness: "#06B6D4", // Ocean Cyan
  Custom: "#F59E0B", // Amber Gold
};

export const categoryColor = (category: string): string =>
  CATEGORY_COLORS[category] ?? "#6366F1";

export interface UnitPreset {
  id: string;
  label: string;
  unit: string;
  tracking_type: TrackingType;
  defaultTarget: number;
  quickSteps: number[];
}

export const UNIT_PRESETS: UnitPreset[] = [
  {
    id: "ml",
    label: "Milliliters (ml)",
    unit: "ml",
    tracking_type: "volume",
    defaultTarget: 2500,
    quickSteps: [250, 500, 1000],
  },
  {
    id: "min",
    label: "Minutes (min)",
    unit: "min",
    tracking_type: "duration",
    defaultTarget: 30,
    quickSteps: [10, 15, 30],
  },
  {
    id: "hours",
    label: "Hours (h)",
    unit: "hours",
    tracking_type: "duration",
    defaultTarget: 8,
    quickSteps: [1, 2, 4],
  },
  {
    id: "steps",
    label: "Steps (walk)",
    unit: "steps",
    tracking_type: "steps",
    defaultTarget: 10000,
    quickSteps: [500, 1000, 2500],
  },
  {
    id: "reps",
    label: "Reps / Count",
    unit: "reps",
    tracking_type: "reps",
    defaultTarget: 50,
    quickSteps: [10, 25, 50],
  },
  {
    id: "km",
    label: "Kilometers (km)",
    unit: "km",
    tracking_type: "distance",
    defaultTarget: 5,
    quickSteps: [1, 2, 5],
  },
  {
    id: "miles",
    label: "Miles (mi)",
    unit: "miles",
    tracking_type: "distance",
    defaultTarget: 3,
    quickSteps: [1, 2, 3],
  },
  {
    id: "pages",
    label: "Pages (reading)",
    unit: "pages",
    tracking_type: "pages",
    defaultTarget: 20,
    quickSteps: [5, 10, 20],
  },
  {
    id: "cups",
    label: "Cups / Glasses",
    unit: "cups",
    tracking_type: "reps",
    defaultTarget: 8,
    quickSteps: [1, 2, 4],
  },
  {
    id: "kcal",
    label: "Calories (kcal)",
    unit: "kcal",
    tracking_type: "calories",
    defaultTarget: 2000,
    quickSteps: [200, 500, 1000],
  },
  {
    id: "times",
    label: "Times / Day",
    unit: "times",
    tracking_type: "reps",
    defaultTarget: 2,
    quickSteps: [1, 2],
  },
];

export interface HabitTemplate {
  name: string;
  icon: string;
  category: string;
  tracking_type: TrackingType;
  unit: string;
  target_value: number;
  quick_increments: number[];
  tagline: string;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    name: "Water Intake",
    icon: "💧",
    category: "Health",
    tracking_type: "volume",
    unit: "ml",
    target_value: 2500,
    quick_increments: [250, 500, 1000],
    tagline: "Stay hydrated daily (2.5L / 2500ml)",
  },
  {
    name: "Daily Steps",
    icon: "🚶",
    category: "Fitness",
    tracking_type: "steps",
    unit: "steps",
    target_value: 10000,
    quick_increments: [500, 1000, 2500],
    tagline: "Walk 10,000 steps everyday",
  },
  {
    name: "Morning Run",
    icon: "🏃",
    category: "Fitness",
    tracking_type: "distance",
    unit: "km",
    target_value: 5,
    quick_increments: [1, 2, 5],
    tagline: "Cardio endurance & fresh air",
  },
  {
    name: "Book Reading",
    icon: "📚",
    category: "Learning",
    tracking_type: "pages",
    unit: "pages",
    target_value: 20,
    quick_increments: [5, 10, 20],
    tagline: "Read 20 pages to learn every day",
  },
  {
    name: "Meditation & Breath",
    icon: "🧘",
    category: "Mindfulness",
    tracking_type: "duration",
    unit: "min",
    target_value: 15,
    quick_increments: [5, 10, 15],
    tagline: "Calm mind & reduce stress",
  },
  {
    name: "Push-ups",
    icon: "💪",
    category: "Fitness",
    tracking_type: "reps",
    unit: "reps",
    target_value: 50,
    quick_increments: [10, 25, 50],
    tagline: "Upper body strength and endurance",
  },
  {
    name: "Night Sleep",
    icon: "😴",
    category: "Health",
    tracking_type: "duration",
    unit: "hours",
    target_value: 8,
    quick_increments: [1, 2, 4],
    tagline: "Restore energy and immune system",
  },
  {
    name: "Strength Workout",
    icon: "🏋️",
    category: "Fitness",
    tracking_type: "duration",
    unit: "min",
    target_value: 45,
    quick_increments: [15, 30, 45],
    tagline: "Weight training or bodyweight circuit",
  },
  {
    name: "Healthy Nutrition",
    icon: "🥗",
    category: "Health",
    tracking_type: "calories",
    unit: "kcal",
    target_value: 2000,
    quick_increments: [250, 500, 1000],
    tagline: "Track calories or balanced meal targets",
  },
  {
    name: "Daily Journaling",
    icon: "✍️",
    category: "Mindfulness",
    tracking_type: "duration",
    unit: "min",
    target_value: 15,
    quick_increments: [5, 10, 15],
    tagline: "Reflect on thoughts and gratitude",
  },
  {
    name: "Deep Focus Work",
    icon: "💻",
    category: "Learning",
    tracking_type: "duration",
    unit: "min",
    target_value: 60,
    quick_increments: [15, 30, 60],
    tagline: "Uninterrupted coding or studying",
  },
  {
    name: "Cycling Ride",
    icon: "🚴",
    category: "Fitness",
    tracking_type: "distance",
    unit: "km",
    target_value: 15,
    quick_increments: [2, 5, 10],
    tagline: "Outdoor or stationary bike session",
  },
  {
    name: "Floss Teeth",
    icon: "🦷",
    category: "Health",
    tracking_type: "reps",
    unit: "times",
    target_value: 2,
    quick_increments: [1, 2],
    tagline: "Maintain perfect dental hygiene",
  },
  {
    name: "Limit Caffeine",
    icon: "☕",
    category: "Health",
    tracking_type: "reps",
    unit: "cups",
    target_value: 2,
    quick_increments: [1, 2],
    tagline: "Mindful coffee / energy drink limit",
  },
];

const nowIso = () => new Date().toISOString();

// Pre-seeded habits with accurate measurements so the app is immediately useful.
export const seedHabits = (): Habit[] => [
  {
    id: "seed-water",
    name: "Water Intake",
    icon: "💧",
    category: "Health",
    tracking_type: "volume",
    unit: "ml",
    target_value: 2500,
    quick_increments: [250, 500, 1000],
    color: CATEGORY_COLORS.Health,
    created_at: nowIso(),
    archived: false,
  },
  {
    id: "seed-steps",
    name: "Daily Steps",
    icon: "🚶",
    category: "Fitness",
    tracking_type: "steps",
    unit: "steps",
    target_value: 10000,
    quick_increments: [500, 1000, 2500],
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
    unit: "min",
    target_value: 30,
    quick_increments: [10, 15, 30],
    color: CATEGORY_COLORS.Learning,
    created_at: nowIso(),
    archived: false,
  },
  {
    id: "seed-pushups",
    name: "Pushups",
    icon: "💪",
    category: "Fitness",
    tracking_type: "reps",
    unit: "reps",
    target_value: 50,
    quick_increments: [10, 25, 50],
    color: CATEGORY_COLORS.Fitness,
    created_at: nowIso(),
    archived: false,
  },
];
