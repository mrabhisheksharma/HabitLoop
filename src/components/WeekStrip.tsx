import React from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Sparkles, RotateCcw } from "lucide-react";
import { weekDaysForDate, DATE_FMT, prettyDate, isToday, isFuture } from "../utils/date";
import { useHabits } from "../store/HabitStore";
import { isDayComplete } from "../utils/streaks";

interface Props {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export function WeekStrip({ selectedDate, onSelectDate }: Props) {
  const { activeHabits, getValue } = useHabits();
  const selectedDayjs = dayjs(selectedDate);
  const weekDays = weekDaysForDate(selectedDayjs);
  const isSelectedToday = isToday(selectedDate);

  const handlePrevWeek = () => {
    onSelectDate(selectedDayjs.subtract(1, "week").format(DATE_FMT));
  };

  const handleNextWeek = () => {
    const nextWeek = selectedDayjs.add(1, "week");
    onSelectDate(nextWeek.format(DATE_FMT));
  };

  const handleToday = () => {
    onSelectDate(dayjs().format(DATE_FMT));
  };

  // Calculate day completion status
  const getDayStats = (dateStr: string) => {
    if (activeHabits.length === 0) return { ratio: 0, completed: 0, total: 0, isPerfect: false };
    const completed = activeHabits.filter((h) =>
      isDayComplete(getValue(h.id, dateStr), h.target_value),
    ).length;
    const total = activeHabits.length;
    const ratio = total > 0 ? completed / total : 0;
    return {
      ratio,
      completed,
      total,
      isPerfect: total > 0 && completed === total,
    };
  };

  const monthLabel = dayjs(weekDays[0]).format("MMMM YYYY");
  const endMonthLabel = dayjs(weekDays[6]).format("MMMM YYYY");
  const headerDateRange =
    monthLabel === endMonthLabel ? monthLabel : `${dayjs(weekDays[0]).format("MMM")} – ${endMonthLabel}`;

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] dark:border-[#334155] shadow-xs transition-colors">
      {/* Top Header: Month Range + Nav */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-sm sm:text-base text-[#0F172A] dark:text-[#F8FAFC]">
            {headerDateRange}
          </span>
          {!isSelectedToday && (
            <button
              onClick={handleToday}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4338CA] dark:bg-[#312E81] dark:text-[#C7D2FE] text-xs font-black transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Back to Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevWeek}
            title="Previous Week"
            className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextWeek}
            title="Next Week"
            className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7 Days Row */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((dateStr) => {
          const d = dayjs(dateStr);
          const isSelected = dateStr === selectedDate;
          const isCurrentToday = isToday(dateStr);
          const future = isFuture(dateStr);
          const { ratio, isPerfect, completed, total } = getDayStats(dateStr);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`relative flex flex-col items-center py-2.5 sm:py-3 px-1 rounded-2xl transition-all select-none group ${
                isSelected
                  ? "bg-[#6366F1] text-white shadow-md scale-102"
                  : isCurrentToday
                  ? "bg-[#EEF2FF] dark:bg-[#312E81]/60 text-[#4338CA] dark:text-[#A5B4FC] border border-[#6366F1]/40"
                  : "bg-[#F8FAFC] dark:bg-[#0F172A]/70 text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]/60"
              }`}
            >
              {/* Day of Week */}
              <span
                className={`text-[10px] sm:text-xs font-bold tracking-wider uppercase ${
                  isSelected
                    ? "text-indigo-100"
                    : isCurrentToday
                    ? "text-[#4F46E5] dark:text-[#818CF8] font-black"
                    : "text-[#64748B] dark:text-[#94A3B8]"
                }`}
              >
                {d.format("ddd")}
              </span>

              {/* Day Number */}
              <span
                className={`text-base sm:text-lg font-display font-black my-0.5 ${
                  isSelected ? "text-white" : isCurrentToday ? "text-[#312E81] dark:text-[#F8FAFC]" : "text-[#0F172A] dark:text-[#F8FAFC]"
                }`}
              >
                {d.format("D")}
              </span>

              {/* Progress Indicator */}
              <div className="h-4 flex items-center justify-center mt-0.5">
                {future ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] dark:bg-[#475569]" />
                ) : isPerfect ? (
                  <span
                    className={`flex items-center justify-center w-3.5 h-3.5 rounded-full ${
                      isSelected
                        ? "bg-amber-300 text-amber-950"
                        : "bg-amber-400 text-amber-950"
                    } shadow-xs`}
                  >
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                  </span>
                ) : ratio > 0 ? (
                  <div
                    className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-indigo-900/60 text-white"
                        : "bg-[#6366F1]/20 text-[#4338CA] dark:text-[#818CF8]"
                    }`}
                  >
                    {completed}/{total}
                  </div>
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-indigo-300" : "bg-[#CBD5E1] dark:bg-[#475569]"
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
