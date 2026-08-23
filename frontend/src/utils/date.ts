import dayjs from "dayjs";

export const DATE_FMT = "YYYY-MM-DD";

export const todayStr = (): string => dayjs().format(DATE_FMT);

export const toDateStr = (d: dayjs.Dayjs | Date): string =>
  dayjs(d).format(DATE_FMT);

// Last `n` days ending today, oldest first. Returns YYYY-MM-DD strings.
export const lastNDays = (n: number): string[] => {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(dayjs().subtract(i, "day").format(DATE_FMT));
  }
  return out;
};

// Start of current week (Monday).
export const weekStart = (): dayjs.Dayjs => {
  const d = dayjs();
  const dow = d.day(); // 0 Sun ... 6 Sat
  const diff = dow === 0 ? 6 : dow - 1; // days since Monday
  return d.subtract(diff, "day").startOf("day");
};

// Mon..Sun date strings for the current week.
export const currentWeekDays = (): string[] => {
  const start = weekStart();
  return Array.from({ length: 7 }, (_, i) =>
    start.add(i, "day").format(DATE_FMT),
  );
};

export const isFuture = (dateStr: string): boolean =>
  dayjs(dateStr).isAfter(dayjs(), "day");

export const prettyDate = (dateStr: string): string => {
  const d = dayjs(dateStr);
  if (d.isSame(dayjs(), "day")) return "Today";
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return d.format("ddd, MMM D");
};

export const shortWeekday = (dateStr: string): string =>
  dayjs(dateStr).format("dd");

export const dayNum = (dateStr: string): string => dayjs(dateStr).format("D");
