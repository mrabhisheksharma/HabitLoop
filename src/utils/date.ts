import dayjs from "dayjs";

export const DATE_FMT = "YYYY-MM-DD";

export const todayStr = (): string => dayjs().format(DATE_FMT);

export const toDateStr = (d: dayjs.Dayjs | Date | string): string =>
  dayjs(d).format(DATE_FMT);

// Last `n` days ending today, oldest first. Returns YYYY-MM-DD strings.
export const lastNDays = (n: number): string[] => {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(dayjs().subtract(i, "day").format(DATE_FMT));
  }
  return out;
};

// Start of week (Monday) for a given date.
export const weekStart = (d: dayjs.Dayjs | string = dayjs()): dayjs.Dayjs => {
  const current = typeof d === "string" ? dayjs(d) : d;
  const dow = current.day(); // 0 Sun ... 6 Sat
  const diff = dow === 0 ? 6 : dow - 1; // days since Monday
  return current.subtract(diff, "day").startOf("day");
};

// Mon..Sun date strings for the week containing `d`.
export const weekDaysForDate = (d: dayjs.Dayjs | string = dayjs()): string[] => {
  const start = weekStart(d);
  return Array.from({ length: 7 }, (_, i) =>
    start.add(i, "day").format(DATE_FMT),
  );
};

// Mon..Sun date strings for the current week.
export const currentWeekDays = (): string[] => weekDaysForDate(dayjs());

export const isFuture = (dateStr: string): boolean =>
  dayjs(dateStr).isAfter(dayjs(), "day");

export const isToday = (dateStr: string): boolean =>
  dayjs(dateStr).isSame(dayjs(), "day");

export const isDateOlderThan7Days = (dateStr: string): boolean => {
  const diff = dayjs().startOf("day").diff(dayjs(dateStr).startOf("day"), "day");
  return diff > 7;
};

// Logging is restricted to dates within the last 7 days (and not in the future)
export const isDateEditable = (dateStr: string): boolean => {
  if (isFuture(dateStr)) return false;
  return !isDateOlderThan7Days(dateStr);
};

export const isSameDay = (d1: string, d2: string): boolean =>
  dayjs(d1).isSame(dayjs(d2), "day");

export const prettyDate = (dateStr: string): string => {
  const d = dayjs(dateStr);
  if (d.isSame(dayjs(), "day")) return "Today";
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return d.format("ddd, MMM D");
};

export const formatFullDate = (dateStr: string): string =>
  dayjs(dateStr).format("dddd, MMMM D, YYYY");

export const shortWeekday = (dateStr: string): string =>
  dayjs(dateStr).format("dd");

export const dayNum = (dateStr: string): string => dayjs(dateStr).format("D");

// Returns all days in a month along with leading/trailing padding days for standard 7-col grid (Monday start)
export interface MonthGridDay {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export const getMonthGrid = (year: number, monthZeroIndexed: number): MonthGridDay[] => {
  const firstOfMonth = dayjs().year(year).month(monthZeroIndexed).date(1).startOf("day");
  const lastOfMonth = firstOfMonth.endOf("month");
  
  const startDayOfWeek = firstOfMonth.day(); // 0 Sun ... 6 Sat
  const leadingDaysCount = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Mon=0 .. Sun=6
  
  const grid: MonthGridDay[] = [];
  const today = dayjs().format(DATE_FMT);
  const now = dayjs();

  // Leading days from previous month
  for (let i = leadingDaysCount; i > 0; i--) {
    const d = firstOfMonth.subtract(i, "day");
    const dStr = d.format(DATE_FMT);
    grid.push({
      dateStr: dStr,
      dayNumber: d.date(),
      isCurrentMonth: false,
      isToday: dStr === today,
      isFuture: d.isAfter(now, "day"),
    });
  }

  // Current month days
  const daysInMonth = lastOfMonth.date();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = firstOfMonth.date(i);
    const dStr = d.format(DATE_FMT);
    grid.push({
      dateStr: dStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dStr === today,
      isFuture: d.isAfter(now, "day"),
    });
  }

  // Trailing days to complete the week rows (multiples of 7)
  const remaining = (7 - (grid.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = lastOfMonth.add(i, "day");
    const dStr = d.format(DATE_FMT);
    grid.push({
      dateStr: dStr,
      dayNumber: d.date(),
      isCurrentMonth: false,
      isToday: dStr === today,
      isFuture: d.isAfter(now, "day"),
    });
  }

  return grid;
};

