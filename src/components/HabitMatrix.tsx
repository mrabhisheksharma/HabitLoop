import React from "react";
import dayjs from "dayjs";
import { Check, Flame, ChevronRight, Edit3, Lock } from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { Habit } from "../types";
import { isDayComplete, currentStreak } from "../utils/streaks";
import { isToday, isFuture, DATE_FMT, isDateEditable, isDateOlderThan7Days } from "../utils/date";
import { categoryColor } from "../constants";
import { formatValue } from "../utils/format";

interface Props {
  year: number;
  month: number; // 0-11
  onOpenDetail: (habitId: string) => void;
  onOpenManual?: (habit: Habit, dateStr: string) => void;
}

export function HabitMatrix({ year, month, onOpenDetail }: Props) {
  const { activeHabits, getValue, logsForHabit } = useHabits();

  const firstDay = dayjs().year(year).month(month).date(1);
  const daysInMonth = firstDay.daysInMonth();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = firstDay.date(i + 1);
    const dateStr = d.format(DATE_FMT);
    const future = isFuture(dateStr);
    const older = isDateOlderThan7Days(dateStr);
    const editable = isDateEditable(dateStr);
    return {
      dayNum: i + 1,
      weekday: d.format("dd"),
      dateStr,
      isToday: isToday(dateStr),
      isFuture: future,
      isOlderThan7Days: older,
      isEditable: editable,
    };
  });

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 border border-[#E2E8F0] dark:border-[#334155] shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div>
          <h3 className="font-display font-black text-base sm:text-lg text-[#0F172A] dark:text-[#F8FAFC]">
            Habit Consistency Matrix
          </h3>
          <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            Overview of daily completion status across all active habits
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-md bg-[#6366F1]" /> Complete
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-md bg-[#EEF2FF] border border-[#818CF8] dark:bg-[#312E81]" /> Partial
          </span>
        </div>
      </div>

      {/* Scrollable Matrix Table */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {/* Habit Name Column Header */}
              <th className="sticky left-0 z-20 bg-white dark:bg-[#1E293B] pb-3 pr-4 text-left font-display font-black text-xs text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider min-w-[180px]">
                Habit
              </th>

              {/* Days Headers */}
              {days.map((d) => (
                <th
                  key={d.dateStr}
                  className={`pb-3 px-1 text-center min-w-[34px] ${
                    d.isToday
                      ? "text-[#6366F1] font-black"
                      : d.isOlderThan7Days
                      ? "text-[#94A3B8] dark:text-[#64748B]"
                      : "text-[#64748B] dark:text-[#94A3B8] font-bold"
                  }`}
                >
                  <div className="text-[10px] uppercase opacity-75">{d.weekday}</div>
                  <div
                    className={`text-xs font-display font-black inline-block px-1.5 py-0.5 rounded-md ${
                      d.isToday
                        ? "bg-[#EEF2FF] dark:bg-[#312E81] text-[#4F46E5] dark:text-[#A5B4FC]"
                        : d.isOlderThan7Days
                        ? "opacity-80"
                        : ""
                    }`}
                  >
                    {d.dayNum}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/60">
            {activeHabits.map((habit) => {
              const catCol = categoryColor(habit.category);
              const logs = logsForHabit(habit.id);
              const streak = currentStreak(logs, habit.target_value);

              return (
                <tr key={habit.id} className="group hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/40 transition-colors">
                  {/* Sticky left habit row title */}
                  <td className="sticky left-0 z-10 bg-white dark:bg-[#1E293B] group-hover:bg-[#F8FAFC] dark:group-hover:bg-[#0F172A]/40 py-3 pr-4">
                    <button
                      onClick={() => onOpenDetail(habit.id)}
                      className="flex items-center gap-2.5 text-left w-full hover:translate-x-0.5 transition-transform"
                    >
                      <span className="text-xl shrink-0">{habit.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-black text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate">
                          {habit.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: catCol }}
                          />
                          {streak > 0 && (
                            <span className="text-[#6366F1] font-extrabold flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 fill-current" /> {streak}d
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </td>

                  {/* Day Cells */}
                  {days.map((d) => {
                    const val = getValue(habit.id, d.dateStr);
                    const done = isDayComplete(val, habit.target_value);
                    const hasVal = val > 0;

                    let bg = "bg-[#F8FAFC] dark:bg-[#0F172A]/50 hover:bg-[#E2E8F0] dark:hover:bg-[#334155]";
                    let border = "border-[#E2E8F0] dark:border-[#334155]";

                    if (d.isFuture) {
                      bg = "bg-transparent opacity-30 cursor-not-allowed";
                    } else if (d.isOlderThan7Days) {
                      // History view
                      if (done) {
                        bg = "bg-[#6366F1]/80 text-white";
                        border = "border-[#6366F1]/80";
                      } else if (hasVal) {
                        bg = "bg-[#EEF2FF]/80 dark:bg-[#1E1B4B]/60 text-[#4338CA] dark:text-[#C7D2FE]";
                        border = "border-[#C7D2FE]/80 dark:border-[#312E81]/60";
                      } else {
                        bg = "bg-[#F8FAFC]/50 dark:bg-[#0F172A]/30 opacity-60";
                      }
                    } else if (done) {
                      bg = "bg-[#6366F1] text-white shadow-xs hover:bg-[#4F46E5]";
                      border = "border-[#6366F1]";
                    } else if (hasVal) {
                      bg = "bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#4338CA] dark:text-[#C7D2FE] hover:bg-[#C7D2FE]";
                      border = "border-[#C7D2FE] dark:border-[#312E81]";
                    }

                    return (
                      <td key={d.dateStr} className="p-1 text-center">
                        <div
                          title={`${habit.name} - ${d.dateStr}: ${formatValue(val, habit)}${
                            d.isOlderThan7Days ? " (History - Read only)" : ""
                          }`}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center mx-auto transition-all ${bg} ${border}`}
                        >
                          {done ? (
                            <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                          ) : hasVal ? (
                            <span className="text-[9px] font-black">{val}</span>
                          ) : null}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
