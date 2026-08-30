import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  LayoutGrid,
  Table,
  Filter,
} from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { CalendarMonthGrid } from "../components/CalendarMonthGrid";
import { HabitMatrix } from "../components/HabitMatrix";
import { EmptyState } from "../components/EmptyState";
import { todayStr, isFuture, DATE_FMT } from "../utils/date";
import { isDayComplete } from "../utils/streaks";

interface Props {
  onOpenDetail: (habitId: string) => void;
  onOpenNewHabit: () => void;
}

export function CalendarView({ onOpenDetail, onOpenNewHabit }: Props) {
  const { activeHabits, getValue } = useHabits();

  const now = dayjs();
  const [currentYear, setCurrentYear] = useState(now.year());
  const [currentMonth, setCurrentMonth] = useState(now.month()); // 0-indexed
  const [viewMode, setViewMode] = useState<"calendar" | "matrix">("calendar");
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");

  const selectedHabit = useMemo(
    () => (selectedHabitId === "all" ? null : activeHabits.find((h) => h.id === selectedHabitId) || null),
    [selectedHabitId, activeHabits]
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const today = dayjs();
    setCurrentYear(today.year());
    setCurrentMonth(today.month());
  };

  // Monthly stats calculations
  const monthStats = useMemo(() => {
    const firstDay = dayjs().year(currentYear).month(currentMonth).date(1);
    const daysInMonth = firstDay.daysInMonth();
    let totalOpportunities = 0;
    let totalCompleted = 0;
    let perfectDays = 0;
    let activeDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = firstDay.date(d).format(DATE_FMT);
      if (isFuture(dateStr)) continue;

      const habitsToCheck = selectedHabit ? [selectedHabit] : activeHabits;
      if (habitsToCheck.length === 0) continue;

      let dayDoneCount = 0;
      let dayHasAnyActivity = false;

      habitsToCheck.forEach((h) => {
        const val = getValue(h.id, dateStr);
        if (val > 0) dayHasAnyActivity = true;
        if (isDayComplete(val, h.target_value)) {
          dayDoneCount++;
          totalCompleted++;
        }
        totalOpportunities++;
      });

      if (dayHasAnyActivity) activeDays++;
      if (dayDoneCount === habitsToCheck.length && habitsToCheck.length > 0) {
        perfectDays++;
      }
    }

    const rate = totalOpportunities > 0 ? (totalCompleted / totalOpportunities) * 100 : 0;

    return {
      rate: Math.round(rate),
      totalCompleted,
      perfectDays,
      activeDays,
    };
  }, [currentYear, currentMonth, activeHabits, selectedHabit, getValue]);

  if (activeHabits.length === 0) {
    return (
      <div className="space-y-6 pb-24 sm:pb-12">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] dark:text-[#F8FAFC]">
          Calendar
        </h2>
        <EmptyState
          title="No habits to display in Calendar"
          subtitle="Add your habits from the Habits page to track consistency across months."
          ctaLabel="Go to Habits page"
          onPressCta={onOpenNewHabit}
        />
      </div>
    );
  }

  const monthName = dayjs().year(currentYear).month(currentMonth).format("MMMM YYYY");
  const isCurrentMonthViewing =
    now.year() === currentYear && now.month() === currentMonth;

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black tracking-widest text-[#6366F1] uppercase flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            Monthly Overview
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
            Calendar
          </h2>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Habit Filter */}
          <div className="relative">
            <select
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="appearance-none bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold py-2.5 pl-8 pr-8 rounded-2xl focus:outline-none focus:border-[#6366F1] shadow-xs cursor-pointer"
            >
              <option value="all">All Habits ({activeHabits.length})</option>
              {activeHabits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.icon} {h.name}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs font-black"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all cursor-pointer ${
                viewMode === "matrix"
                  ? "bg-white dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs font-black"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Month Navigation & Metrics Bar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#0F172A] dark:text-[#F8FAFC]">
              {monthName}
            </h3>
            {!isCurrentMonthViewing && (
              <button
                onClick={handleToday}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4338CA] dark:bg-[#312E81] dark:text-[#C7D2FE] text-xs font-black transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Current Month
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-2.5 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-2.5 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Key Monthly Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/60 border border-[#E2E8F0] dark:border-[#334155]">
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
              Completion Rate
            </span>
            <div className="font-display font-black text-2xl text-[#6366F1] dark:text-[#818CF8] mt-0.5">
              {monthStats.rate}%
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/60 border border-[#E2E8F0] dark:border-[#334155]">
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
              Check-ins Logged
            </span>
            <div className="font-display font-black text-2xl text-[#0EA5E9] dark:text-[#38BDF8] mt-0.5">
              {monthStats.totalCompleted}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/60 border border-[#E2E8F0] dark:border-[#334155]">
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
              100% Perfect Days
            </span>
            <div className="font-display font-black text-2xl text-[#F59E0B] dark:text-[#FBBF24] mt-0.5">
              {monthStats.perfectDays}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/60 border border-[#E2E8F0] dark:border-[#334155]">
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
              Active Days
            </span>
            <div className="font-display font-black text-2xl text-[#8B5CF6] dark:text-[#A78BFA] mt-0.5">
              {monthStats.activeDays}
            </div>
          </div>
        </div>
      </div>

      {/* Main View Mode Area - Full width cleanly displayed */}
      {viewMode === "calendar" ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <span className="font-display font-black text-base text-[#0F172A] dark:text-[#F8FAFC]">
              {selectedHabit ? `Tracking: ${selectedHabit.name}` : "Monthly Habit Progress"}
            </span>
            <div className="flex items-center gap-3 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-[#6366F1]" /> 100% Complete
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-[#EEF2FF] border border-[#818CF8] dark:bg-[#312E81]" /> Partial Progress
              </span>
            </div>
          </div>

          <CalendarMonthGrid
            year={currentYear}
            month={currentMonth}
            filteredHabit={selectedHabit}
          />
        </div>
      ) : (
        /* Matrix Grid View (Everyday / Notion style) */
        <HabitMatrix
          year={currentYear}
          month={currentMonth}
          onOpenDetail={onOpenDetail}
        />
      )}
    </div>
  );
}
