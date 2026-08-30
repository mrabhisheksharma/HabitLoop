import { Habit, TrackingType } from "../types";

export const withCommas = (n: number): string => {
  if (!Number.isFinite(n)) return "0";
  if (n % 1 !== 0) {
    return (Math.round(n * 10) / 10).toString();
  }
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const defaultUnitForType = (type: TrackingType): string => {
  switch (type) {
    case "duration":
      return "min";
    case "volume":
      return "ml";
    case "distance":
      return "km";
    case "steps":
      return "steps";
    case "pages":
      return "pages";
    case "calories":
      return "kcal";
    case "reps":
    default:
      return "reps";
  }
};

export const getUnitLabel = (
  typeOrHabit: TrackingType | Habit | { tracking_type: TrackingType; unit?: string },
  customUnit?: string,
): string => {
  if (typeof typeOrHabit === "object" && typeOrHabit !== null) {
    if (typeOrHabit.unit && typeOrHabit.unit.trim()) {
      return typeOrHabit.unit.trim();
    }
    return defaultUnitForType(typeOrHabit.tracking_type);
  }
  if (customUnit && customUnit.trim()) {
    return customUnit.trim();
  }
  return defaultUnitForType(typeOrHabit);
};

export const formatValue = (
  v: number,
  typeOrHabit: TrackingType | Habit | { tracking_type: TrackingType; unit?: string },
  customUnit?: string,
): string => {
  const unit = getUnitLabel(typeOrHabit, customUnit);
  const formatted = withCommas(v);
  if (unit === "reps" || unit === "count") {
    return formatted;
  }
  return `${formatted} ${unit}`;
};

export const targetLabel = (
  t: number | null,
  typeOrHabit: TrackingType | Habit | { tracking_type: TrackingType; unit?: string },
  customUnit?: string,
): string => {
  if (!t || t <= 0) return "No target";
  const unit = getUnitLabel(typeOrHabit, customUnit);
  const formatted = withCommas(t);
  if (unit === "reps" || unit === "count") {
    return `${formatted} reps`;
  }
  return `${formatted} ${unit}`;
};

export const unitLabel = (
  typeOrHabit: TrackingType | Habit | { tracking_type: TrackingType; unit?: string },
  customUnit?: string,
): string => getUnitLabel(typeOrHabit, customUnit);
