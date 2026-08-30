import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Check } from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { Habit } from "../types";
import { isDayComplete, completionRatio } from "../utils/streaks";
import { isToday, isFuture, DATE_FMT, prettyDate } from "../utils/date";
import { formatValue, targetLabel } from "../utils/format";
import { getTargetForDate } from "../utils/target";

interface Props {
  year: number;
  month: number; // 0-11
  filteredHabit?: Habit | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Returns GitHub-style heatmap styling classes based on completion percentage (0 to 1)
 */
export function getGithubHeatmapStyle(
  ratio: number,
  isCurrentMonth: boolean,
  isFutureDate: boolean,
  isTodayDate: boolean
): {
  bg: string;
  border: string;
  text: string;
  level: number; // 0 to 5
} {
  if (!isCurrentMonth) {
    return {
      bg: "bg-[#F8FAFC]/40 dark:bg-[#0B0F17]/20 opacity-30",
      border: "border-transparent",
      text: "text-[#94A3B8] dark:text-[#64748B]",
      level: 0,
    };
  }

  if (isFutureDate) {
    return {
      bg: "bg-[#F8FAFC]/50 dark:bg-[#0F172A]/30",
      border: "border-dashed border-[#E2E8F0] dark:border-[#334155]",
      text: "text-[#94A3B8] dark:text-[#64748B]",
      level: 0,
    };
  }

  if (ratio <= 0) {
    // Level 0: 0% / no completions
    return {
      bg: isTodayDate
        ? "bg-[#EEF2FF]/70 dark:bg-[#312E81]/30"
        : "bg-[#F8FAFC] dark:bg-[#1E293B]/70",
      border: isTodayDate
        ? "border-2 border-[#6366F1] dark:border-[#818CF8]"
        : "border border-[#E2E8F0] dark:border-[#334155]",
      text: isTodayDate
        ? "text-[#4F46E5] dark:text-[#A5B4FC]"
        : "text-[#64748B] dark:text-[#94A3B8]",
      level: 0,
    };
  }

  if (ratio < 0.26) {
    // Level 1: 1% - 25% (Lightest green tint)
    return {
      bg: "bg-[#DCFCE7] dark:bg-[#064E3B]/60",
      border: isTodayDate
        ? "border-2 border-[#6366F1] dark:border-[#818CF8]"
        : "border border-[#BBF7D0] dark:border-[#047857]",
      text: "text-[#166534] dark:text-[#86EFAC]",
      level: 1,
    };
  }

  if (ratio < 0.51) {
    // Level 2: 26% - 50% (Light-medium green)
    return {
      bg: "bg-[#86EFAC] dark:bg-[#047857]/80",
      border: isTodayDate
        ? "border-2 border-[#6366F1] dark:border-[#818CF8]"
        : "border border-[#4ADE80] dark:border-[#059669]",
      text: "text-[#14532D] dark:text-[#ECFDF5]",
      level: 2,
    };
  }

  if (ratio < 0.76) {
    // Level 3: 51% - 75% (Medium vibrant green)
    return {
      bg: "bg-[#22C55E] dark:bg-[#10B981]",
      border: isTodayDate
        ? "border-2 border-[#4338CA] dark:border-[#C7D2FE]"
        : "border border-[#16A34A] dark:border-[#059669]",
      text: "text-white",
      level: 3,
    };
  }

  if (ratio < 1) {
    // Level 4: 76% - 99% (Rich deep green)
    return {
      bg: "bg-[#16A34A] dark:bg-[#059669]",
      border: isTodayDate
        ? "border-2 border-[#4338CA] dark:border-[#C7D2FE]"
        : "border border-[#15803D] dark:border-[#047857]",
      text: "text-white",
      level: 4,
    };
  }

  // Level 5: 100% Complete (Deepest solid green)
  return {
    bg: "bg-[#15803D] dark:bg-[#047857]",
    border: isTodayDate
      ? "border-2 border-[#4338CA] dark:border-[#C7D2FE]"
      : "border border-[#14532D] dark:border-[#34D399]",
    text: "text-white",
    level: 5,
  };
}

export function CalendarMonthGrid({
  year,
  month,
  filteredHabit,
}: Props) {
  const { activeHabits, getValue } = useHabits();

  const daysGrid = useMemo(() => {
    const firstDay = dayjs().year(year).month(month).date(1);
    const daysInMonth = firstDay.daysInMonth();
    const startWeekday = firstDay.day(); // 0 = Sun

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
    }[] = [];

    // Leading days from previous month
    for (let i = startWeekday - 1; i >= 0; i--) {
      const prevDate = firstDay.subtract(i + 1, "day");
      cells.push({
        dateStr: prevDate.format(DATE_FMT),
        dayNumber: prevDate.date(),
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = firstDay.date(d);
      cells.push({
        dateStr: curDate.format(DATE_FMT),
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Trailing days to round up to full weeks (multiples of 7)
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      const lastDay = firstDay.date(daysInMonth);
      for (let i = 1; i <= remaining; i++) {
        const nextDate = lastDay.add(i, "day");
        cells.push({
          dateStr: nextDate.format(DATE_FMT),
          dayNumber: nextDate.date(),
          isCurrentMonth: false,
        });
      }
    }

    return cells;
  }, [year, month]);

  return (
    <div className="w-full select-none">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-[11px] font-black uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {daysGrid.map((cell) => {
          const { dateStr, dayNumber, isCurrentMonth } = cell;
          const today = isToday(dateStr);
          const future = isFuture(dateStr);

          // Calculate completion ratio and details
          let completionPct = 0;
          let doneCount = 0;
          let totalCount = activeHabits.length;
          let tooltipInfo = "";

          if (!future && isCurrentMonth) {
            if (filteredHabit) {
              const target = getTargetForDate(filteredHabit, dateStr);
              const val = getValue(filteredHabit.id, dateStr);
              const done = isDayComplete(val, target);
              completionPct = completionRatio(val, target);
              doneCount = done ? 1 : 0;
              totalCount = 1;
              tooltipInfo = `${prettyDate(dateStr)}: ${filteredHabit.name} — ${formatValue(val, filteredHabit)} / ${targetLabel(target, filteredHabit)} (${Math.round(completionPct * 100)}%)`;
            } else if (activeHabits.length > 0) {
              activeHabits.forEach((h) => {
                const target = getTargetForDate(h, dateStr);
                const val = getValue(h.id, dateStr);
                if (isDayComplete(val, target)) {
                  doneCount++;
                }
              });
              completionPct = totalCount > 0 ? doneCount / totalCount : 0;
              tooltipInfo = `${prettyDate(dateStr)}: ${doneCount} of ${totalCount} habits completed (${Math.round(completionPct * 100)}%)`;
            }
          } else if (future) {
            tooltipInfo = `${prettyDate(dateStr)} (Upcoming)`;
          }

          const style = getGithubHeatmapStyle(
            completionPct,
            isCurrentMonth,
            future,
            today
          );

          return (
            <div
              key={dateStr}
              title={tooltipInfo}
              className={`relative aspect-square min-h-[46px] sm:min-h-[58px] rounded-xl p-1 sm:p-1.5 transition-colors flex flex-col justify-between overflow-hidden shadow-2xs ${style.bg} ${style.border}`}
            >
              {/* Day Number and Today Indicator */}
              <div className="w-full flex items-center justify-between pointer-events-none">
                {today ? (
                  <div className="flex items-center gap-1">
                    <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-[11px] sm:text-xs font-display font-black shadow-xs">
                      {dayNumber}
                    </span>
                    <span className="hidden sm:inline text-[9px] font-black text-[#6366F1] dark:text-[#A5B4FC] uppercase tracking-tight">
                      Today
                    </span>
                  </div>
                ) : (
                  <span
                    className={`text-xs sm:text-sm font-display font-black leading-none pl-0.5 pt-0.5 ${style.text}`}
                  >
                    {dayNumber}
                  </span>
                )}
              </div>

              {/* Center / Bottom Activity Visual */}
              <div className="w-full flex items-center justify-center pb-0.5 pointer-events-none">
                {isCurrentMonth && !future ? (
                  style.level === 5 ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/25 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 stroke-[3] text-white" />
                    </div>
                  ) : style.level > 0 ? (
                    <div
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        style.level >= 3
                          ? "bg-white/80"
                          : "bg-[#166534]/60 dark:bg-[#86EFAC]/70"
                      }`}
                    />
                  ) : null
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
