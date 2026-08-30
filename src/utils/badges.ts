import { Habit, LogEntry } from "../types";
import { longestStreak, currentStreak } from "./streaks";

export type BadgeTier = "bronze" | "silver" | "gold" | "diamond";

export interface Badge {
  id: string;
  title: string;
  category: "streak" | "consistency" | "mastery";
  description: string;
  targetStreak: number;
  tier: BadgeTier;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 1
  currentStreakAchieved: number;
  qualifyingHabits: string[];
}

export const BADGE_DEFINITIONS: Omit<Badge, "unlocked" | "progress" | "currentStreakAchieved" | "qualifyingHabits">[] = [
  {
    id: "streak-3",
    title: "Spark Ignition",
    category: "streak",
    description: "Maintain a 3-day continuous habit streak.",
    targetStreak: 3,
    tier: "bronze",
    icon: "🔥",
  },
  {
    id: "streak-7",
    title: "7-Day Bronze Master",
    category: "streak",
    description: "Achieve and hold a 7-day unbroken streak.",
    targetStreak: 7,
    tier: "bronze",
    icon: "🥉",
  },
  {
    id: "streak-14",
    title: "Two-Week Triumph",
    category: "streak",
    description: "Conquer a 14-day consecutive habit streak.",
    targetStreak: 14,
    tier: "bronze",
    icon: "⚡",
  },
  {
    id: "streak-30",
    title: "30-Day Silver Momentum",
    category: "streak",
    description: "Forge unbreakable discipline with a 30-day streak.",
    targetStreak: 30,
    tier: "silver",
    icon: "🥈",
  },
  {
    id: "streak-60",
    title: "60-Day Iron Will",
    category: "streak",
    description: "Sustain consistency for 60 consecutive days.",
    targetStreak: 60,
    tier: "silver",
    icon: "🛡️",
  },
  {
    id: "streak-100",
    title: "100-Day Centurion Trophy",
    category: "streak",
    description: "Achieve the legendary 100-day century milestone.",
    targetStreak: 100,
    tier: "gold",
    icon: "👑",
  },
  {
    id: "streak-365",
    title: "365-Day Grand Master",
    category: "streak",
    description: "The ultimate pinnacle of consistency: a full 365-day year.",
    targetStreak: 365,
    tier: "diamond",
    icon: "🏆",
  },
];

export const getHabitStreaks = (
  habit: Habit,
  logs: LogEntry[],
): { current: number; longest: number } => {
  const habitLogs = logs.filter((l) => l.habit_id === habit.id);
  return {
    current: currentStreak(habitLogs, habit.target_value),
    longest: longestStreak(habitLogs, habit.target_value),
  };
};

export const computeBadges = (habits: Habit[], logs: LogEntry[]): Badge[] => {
  // Find highest streak per habit
  const habitStreakMap = habits.map((h) => {
    const habitLogs = logs.filter((l) => l.habit_id === h.id);
    const best = longestStreak(habitLogs, h.target_value);
    const curr = currentStreak(habitLogs, h.target_value);
    return {
      habit: h,
      best: Math.max(best, curr),
    };
  });

  const overallMaxStreak = habitStreakMap.reduce(
    (max, item) => Math.max(max, item.best),
    0,
  );

  return BADGE_DEFINITIONS.map((def) => {
    const qualifying = habitStreakMap
      .filter((item) => item.best >= def.targetStreak)
      .map((item) => item.habit.name);

    const unlocked = qualifying.length > 0 || overallMaxStreak >= def.targetStreak;
    const progress = Math.min(1, overallMaxStreak / def.targetStreak);

    return {
      ...def,
      unlocked,
      progress,
      currentStreakAchieved: overallMaxStreak,
      qualifyingHabits: qualifying,
    };
  });
};

export const computeHabitBadges = (habit: Habit, logs: LogEntry[]): Badge[] => {
  const habitLogs = logs.filter((l) => l.habit_id === habit.id);
  const best = Math.max(
    longestStreak(habitLogs, habit.target_value),
    currentStreak(habitLogs, habit.target_value),
  );

  return BADGE_DEFINITIONS.map((def) => {
    const unlocked = best >= def.targetStreak;
    const progress = Math.min(1, best / def.targetStreak);

    return {
      ...def,
      unlocked,
      progress,
      currentStreakAchieved: best,
      qualifyingHabits: unlocked ? [habit.name] : [],
    };
  });
};
