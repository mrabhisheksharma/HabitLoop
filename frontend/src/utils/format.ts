import { TrackingType } from "../types";

export const withCommas = (n: number): string =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatValue = (v: number, type: TrackingType): string =>
  type === "duration" ? `${withCommas(v)}m` : withCommas(v);

export const targetLabel = (
  t: number | null,
  type: TrackingType,
): string => {
  if (!t || t <= 0) return "No target";
  return type === "duration" ? `${withCommas(t)}m` : withCommas(t);
};

export const unitLabel = (type: TrackingType): string =>
  type === "duration" ? "min" : "reps";
