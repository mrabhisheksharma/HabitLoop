import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Check, Sparkles } from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { Habit } from "../types";
import { isDayComplete, completionRatio } from "../utils/streaks";
import { isToday, isFuture, DATE_FMT } from "../utils/date";
import { formatValue } from "../utils/format";

interface Props {
  year: number;
  month: number; // 0-11
  filteredHabit?: Habit | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center">
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
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {daysGrid.map((cell) => {
          const { dateStr, dayNumber, isCurrentMonth } = cell;
          const today = isToday(dateStr);
          const future = isFuture(dateStr);

          // Calculate completion and x/y metrics for this date
          let isComplete = false;
          let completionPct = 0;
          let doneCount = 0;
          let totalCount = activeHabits.length;
          let progressLabel = "";

          if (!future && isCurrentMonth) {
            if (filteredHabit) {
              const val = getValue(filteredHabit.id, dateStr);
              isComplete = isDayComplete(val, filteredHabit.target_value);
              completionPct = completionRatio(val, filteredHabit.target_value);
              doneCount = isComplete ? 1 : 0;
              totalCount = 1;
              progressLabel = `${formatValue(val, filteredHabit)} / ${formatValue(filteredHabit.target_value ?? 1, filteredHabit)}`;
            } else if (activeHabits.length > 0) {
              activeHabits.forEach((h) => {
                const val = getValue(h.id, dateStr);
                if (isDayComplete(val, h.target_value)) {
                  doneCount++;
                }
              });
              isComplete = doneCount === totalCount && totalCount > 0;
              completionPct = totalCount > 0 ? doneCount / totalCount : 0;
              progressLabel = `${doneCount}/${totalCount}`;
            }
          }

          // Cell styling rules
          let bgClass = "bg-white dark:bg-[#1E293B]";
          let borderClass = "border-[#E2E8F0] dark:border-[#334155]";
          let textClass = "text-[#0F172A] dark:text-[#F8FAFC]";

          if (!isCurrentMonth) {
            bgClass = "bg-[#F8FAFC]/40 dark:bg-[#0B0F17]/30 opacity-30";
            borderClass = "border-transparent";
            textClass = "text-[#94A3B8] dark:text-[#64748B]";
          } else if (future) {
            bgClass = "bg-[#F8FAFC] dark:bg-[#0F172A]/40 opacity-60";
            borderClass = "border-[#E2E8F0] dark:border-[#334155]";
            textClass = "text-[#64748B] dark:text-[#94A3B8]";
          } else if (isComplete) {
            bgClass = "bg-[#6366F1] text-white shadow-xs";
            borderClass = "border-[#6366F1]";
            textClass = "text-white";
          } else if (completionPct >= 0.5) {
            bgClass = "bg-[#EEF2FF] dark:bg-[#312E81]/50";
            borderClass = "border-[#818CF8]/60 dark:border-[#4F46E5]/60";
            textClass = "text-[#0F172A] dark:text-[#F8FAFC]";
          } else if (doneCount > 0) {
            bgClass = "bg-[#F8FAFC] dark:bg-[#1E1B4B]/40";
            borderClass = "border-[#C7D2FE] dark:border-[#312E81]";
            textClass = "text-[#0F172A] dark:text-[#F8FAFC]";
          }

          if (today) {
            borderClass = isComplete
              ? "ring-2 ring-amber-400 border-[#6366F1]"
              : "ring-2 ring-[#6366F1] border-[#6366F1]";
          }

          const pctRounded = Math.round(completionPct * 100);

          return (
            <div
              key={dateStr}
              className={`relative min-h-[72px] sm:min-h-[86px] rounded-2xl p-2 border transition-all flex flex-col justify-between ${bgClass} ${borderClass}`}
            >
              {/* Day Number and Today indicator */}
              <div className="w-full flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-display font-black ${
                    today && !isComplete
                      ? "text-[#6366F1] dark:text-[#818CF8]"
                      : textClass
                  }`}
                >
                  {dayNumber}
                </span>

                {today && (
                  <span
                    className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                      isComplete
                        ? "bg-white/20 text-white"
                        : "bg-[#EEF2FF] dark:bg-[#312E81] text-[#4F46E5] dark:text-[#A5B4FC]"
                    }`}
                  >
                    Today
                  </span>
                )}
              </div>

              {/* Day Progress: X/Y & % Details directly on tile */}
              {isCurrentMonth && !future ? (
                <div className="w-full flex flex-col items-center justify-center my-auto pt-1 pb-0.5">
                  {isComplete ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 font-display font-black text-xs sm:text-sm text-white">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                        <span>100%</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/90">
                        {progressLabel} done
                      </span>
                    </div>
                  ) : totalCount > 0 ? (
                    <div className="w-full text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-display font-black text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                          {progressLabel}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            completionPct > 0
                              ? "text-[#6366F1] dark:text-[#A5B4FC]"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          ({pctRounded}%)
                        </span>
                      </div>

                      {/* Mini visual progress bar */}
                      <div className="w-full bg-[#E2E8F0] dark:bg-[#334155] h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-[#6366F1] h-full rounded-full transition-all duration-300"
                          style={{ width: `${pctRounded}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-[#94A3B8]">No habits</span>
                  )}
                </div>
              ) : isCurrentMonth && future ? (
                <div className="w-full flex items-center justify-center my-auto">
                  <span className="text-xs font-bold text-[#94A3B8] dark:text-[#64748B]">
                    —
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
