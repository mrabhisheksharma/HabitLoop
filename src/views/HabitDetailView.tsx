import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Edit2,
  Flame,
  Trophy,
  Archive,
  RotateCcw,
  Trash2,
  Calendar as CalendarIcon,
  Check,
  LayoutGrid,
  Grid,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { ProgressRing } from "../components/ProgressRing";
import { Heatmap } from "../components/Heatmap";
import { CalendarMonthGrid } from "../components/CalendarMonthGrid";
import { BarChart, BarDatum } from "../components/BarChart";
import { ManualLogModal } from "../components/ManualLogModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { BadgeShowcase } from "../components/BadgeShowcase";
import { useToast } from "../components/Toast";
import { quickSteps } from "../components/HabitCard";
import {
  todayStr,
  lastNDays,
  prettyDate,
  shortWeekday,
  dayNum,
  DATE_FMT,
  formatFullDate,
  isDateEditable,
  isDateOlderThan7Days,
} from "../utils/date";
import {
  currentStreak,
  longestStreak,
  valueMap,
  isDayComplete,
  completionRatio,
} from "../utils/streaks";
import { formatValue, targetLabel, unitLabel } from "../utils/format";
import { getTargetForDate } from "../utils/target";
import { categoryColor } from "../constants";
import { triggerConfetti } from "../utils/confetti";
import { computeHabitBadges } from "../utils/badges";
import { Habit } from "../types";

interface Props {
  habitId: string;
  onBack: () => void;
  onEditHabit: (habit: Habit) => void;
}

export function HabitDetailView({ habitId, onBack, onEditHabit }: Props) {
  const {
    getHabit,
    logsForHabit,
    getValue,
    setLog,
    incrementLog,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
  } = useHabits();
  const { show } = useToast();

  const habit = getHabit(habitId);
  const now = dayjs();
  const [calYear, setCalYear] = useState(now.year());
  const [calMonth, setCalMonth] = useState(now.month());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [historyRange, setHistoryRange] = useState<7 | 30>(7);
  const [heatmapWeeks, setHeatmapWeeks] = useState<number>(52);
  const [activeVisualization, setActiveVisualization] = useState<"calendar" | "heatmap" | "trends">("calendar");
  const [showManual, setShowManual] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const logs = logsForHabit(habitId);
  const vMap = useMemo(() => valueMap(logs), [logs]);
  const cStreak = useMemo(
    () => (habit ? currentStreak(logs, habit) : 0),
    [logs, habit],
  );
  const lStreak = useMemo(
    () => (habit ? longestStreak(logs, habit) : 0),
    [logs, habit],
  );

  const habitBadges = useMemo(
    () => (habit ? computeHabitBadges(habit, logs) : []),
    [habit, logs],
  );

  // Fast date strip limited to the last 7 loggable days
  const dateStrip = useMemo(() => lastNDays(7), []);

  const historyData: BarDatum[] = useMemo(() => {
    const days = lastNDays(historyRange);
    return days.map((d) => ({
      label: historyRange === 7 ? dayjs(d).format("ddd") : dayjs(d).format("D"),
      value: vMap[d] ?? 0,
      full: habit ? isDayComplete(vMap[d] ?? 0, getTargetForDate(habit, d)) : false,
    }));
  }, [historyRange, vMap, habit]);

  if (!habit) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
          Habit not found.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-[#6366F1] text-white font-bold text-xs"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentValue = getValue(habit.id, selectedDate);
  const effectiveTarget = getTargetForDate(habit, selectedDate);
  const isDone = isDayComplete(currentValue, effectiveTarget);
  const ratio = completionRatio(currentValue, effectiveTarget);
  const steps = quickSteps(habit);
  const catCol = categoryColor(habit.category);

  const isEditable = isDateEditable(selectedDate);
  const isOlder = isDateOlderThan7Days(selectedDate);

  const handleQuickAdd = (delta: number) => {
    if (!isEditable) {
      show(
        isOlder
          ? "Dates older than 7 days are read-only history."
          : "Cannot log habits on future dates.",
        "warning",
      );
      return;
    }
    const before = currentValue;
    const after = before + delta;
    incrementLog(habit.id, selectedDate, delta);

    if (
      isDayComplete(after, effectiveTarget) &&
      !isDayComplete(before, effectiveTarget)
    ) {
      triggerConfetti();
      show(`${habit.name} goal reached for ${prettyDate(selectedDate)}! 🎉`, "success");
    }
  };

  const handleManualSave = (value: number) => {
    if (!isEditable) {
      show(
        isOlder
          ? "Dates older than 7 days are read-only history."
          : "Cannot log habits on future dates.",
        "warning",
      );
      setShowManual(false);
      return;
    }
    const before = currentValue;
    setLog(habit.id, selectedDate, value);

    if (
      isDayComplete(value, effectiveTarget) &&
      !isDayComplete(before, effectiveTarget)
    ) {
      triggerConfetti();
      show(`${habit.name} goal reached for ${prettyDate(selectedDate)}! 🎉`, "success");
    }
  };

  const handleClear = () => {
    if (!isEditable) {
      show("Dates older than 7 days cannot be modified.", "warning");
      return;
    }
    setLog(habit.id, selectedDate, 0);
    show(`Cleared log for ${prettyDate(selectedDate)}`, "info");
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    show(`${habit.name} deleted`, "error");
    onBack();
  };

  const handlePrevCalMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextCalMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-pop">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          data-testid="detail-back-btn"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] text-xs font-bold transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={() => onEditHabit(habit)}
          data-testid="detail-edit-btn"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-xs font-bold transition-colors shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Habit
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-[#EEF2FF] dark:bg-[#312E81]/50 flex items-center justify-center text-4xl shadow-inner border border-[#6366F1]/20">
            {habit.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: catCol }}
              >
                {habit.category}
              </span>
              {habit.archived && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#EF4444] dark:bg-[#7F1D1D] dark:text-[#FCA5A5]">
                  Archived
                </span>
              )}
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0F172A] dark:text-[#F8FAFC]">
              {habit.name}
            </h2>
            <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mt-1">
              Daily Target: <span className="text-[#0F172A] dark:text-[#F8FAFC] font-black">{targetLabel(habit.target_value, habit)}</span>
            </p>
          </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-2 sm:flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-[#EEF2FF] dark:bg-[#312E81]/60 border border-[#6366F1]/30 flex flex-col items-center min-w-[105px]">
            <div className="flex items-center gap-1 text-[#4338CA] dark:text-[#A5B4FC] mb-1">
              <Flame className="w-4 h-4 fill-current text-[#6366F1]" />
              <span className="text-[11px] font-black uppercase tracking-wider">Current</span>
            </div>
            <span className="font-display font-black text-2xl text-[#312E81] dark:text-[#C7D2FE]">
              {cStreak} <span className="text-xs font-normal">days</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex flex-col items-center min-w-[105px]">
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 mb-1">
              <Trophy className="w-4 h-4 fill-current text-amber-500" />
              <span className="text-[11px] font-black uppercase tracking-wider">Best</span>
            </div>
            <span className="font-display font-black text-2xl text-amber-900 dark:text-amber-300">
              {lStreak} <span className="text-xs font-normal">days</span>
            </span>
          </div>
        </div>
      </div>

      {/* 14-Day Quick Log Strip */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#6366F1]" />
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Select Date To Log
            </h3>
          </div>
          <span className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC]">
            {formatFullDate(selectedDate)}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {dateStrip.map((d) => {
            const isSelected = selectedDate === d;
            const done = isDayComplete(vMap[d] ?? 0, getTargetForDate(habit, d));
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center justify-center min-w-[48px] py-2.5 px-1.5 rounded-2xl transition-all border ${
                  isSelected
                    ? "bg-[#6366F1] text-white border-[#6366F1] shadow-md scale-105"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A]/70 text-[#0F172A] dark:text-[#F8FAFC] border-[#E2E8F0] dark:border-[#334155] hover:border-[#6366F1]/40"
                }`}
              >
                <span className="text-[10px] font-bold opacity-80 uppercase">
                  {shortWeekday(d)}
                </span>
                <span className="font-display font-black text-sm my-0.5">
                  {dayNum(d)}
                </span>
                <span
                  className={`w-2 h-2 rounded-full mt-0.5 ${
                    done
                      ? isSelected
                        ? "bg-white"
                        : "bg-[#6366F1]"
                      : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Logger for Selected Date */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col items-center text-center">
        <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-4">
          Logging progress for <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{prettyDate(selectedDate)}</strong>
        </span>

        <ProgressRing
          size={140}
          strokeWidth={14}
          progress={ratio}
          color="#6366F1"
          trackColor="#E2E8F0"
        >
          {isDone ? (
            <div className="flex flex-col items-center">
              <Check className="w-8 h-8 text-[#6366F1] stroke-[3]" />
              <span className="text-[10px] font-black text-[#4338CA] dark:text-[#A5B4FC] uppercase mt-0.5">Completed</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="font-display font-black text-3xl text-[#0F172A] dark:text-[#F8FAFC]">
                {Math.round(ratio * 100)}%
              </span>
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">Done</span>
            </div>
          )}
        </ProgressRing>

        <div className="mt-4">
          <div className="font-display font-black text-3xl text-[#0F172A] dark:text-[#F8FAFC]">
            {formatValue(currentValue, habit)}
            {effectiveTarget && (
              <span className="text-base font-bold text-[#64748B] dark:text-[#94A3B8]">
                {" "}
                / {targetLabel(effectiveTarget, habit)}
              </span>
            )}
          </div>
        </div>

        {/* Stepper buttons or read-only indicator */}
        {isEditable ? (
          <>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 w-full max-w-sm">
              {steps.map((s) => (
                <button
                  key={s}
                  onClick={() => handleQuickAdd(s)}
                  className="flex-1 min-w-[70px] py-3 rounded-2xl bg-[#EEF2FF] hover:bg-[#6366F1] text-[#4338CA] hover:text-white dark:bg-[#312E81]/50 dark:hover:bg-[#6366F1] dark:text-[#A5B4FC] dark:hover:text-white font-display font-black text-sm transition-all transform active:scale-95 shadow-xs"
                >
                  +{s} {unitLabel(habit)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setShowManual(true)}
                className="px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs hover:bg-[#E2E8F0] dark:hover:bg-[#475569] transition-colors"
              >
                Set exact value
              </button>
              {currentValue > 0 && (
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-xl bg-[#FEE2E2] dark:bg-[#7F1D1D]/40 text-[#EF4444] dark:text-[#FCA5A5] font-bold text-xs hover:bg-[#FECACA] transition-colors"
                >
                  Reset to 0
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="mt-6 flex items-center gap-2 p-3.5 rounded-2xl bg-[#F1F5F9] dark:bg-[#0F172A]/80 border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            <Lock className="w-4 h-4 text-[#94A3B8] shrink-0" />
            <span>
              {isOlder
                ? "This date is older than 7 days and is saved in your permanent history as read-only."
                : "Future dates cannot be logged."}
            </span>
          </div>
        )}
      </div>

      {/* Habit-specific Trophies & Milestones */}
      <BadgeShowcase
        badges={habitBadges}
        title={`${habit.name} Trophies`}
        subtitle={`Milestones and badges unlocked specifically with ${habit.name}`}
      />

      {/* Interactive Visualization Section with Switcher */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-black text-lg text-[#0F172A] dark:text-[#F8FAFC]">
              Progress History &amp; Calendar
            </h3>
            <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Review consistency across days, months, and the full year
            </p>
          </div>

          {/* Visualization Tab Switcher */}
          <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] p-1 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
            <button
              onClick={() => setActiveVisualization("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all ${
                activeVisualization === "calendar"
                  ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs font-black"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Month Calendar
            </button>
            <button
              onClick={() => setActiveVisualization("heatmap")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all ${
                activeVisualization === "heatmap"
                  ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs font-black"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Year Grid
            </button>
            <button
              onClick={() => setActiveVisualization("trends")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all ${
                activeVisualization === "trends"
                  ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs font-black"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Trends
            </button>
          </div>
        </div>

        {/* 1. Month Calendar Grid */}
        {activeVisualization === "calendar" && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="font-display font-black text-base text-[#0F172A] dark:text-[#F8FAFC]">
                {dayjs().year(calYear).month(calMonth).format("MMMM YYYY")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevCalMonth}
                  className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextCalMonth}
                  className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <CalendarMonthGrid
              year={calYear}
              month={calMonth}
              filteredHabit={habit}
            />
          </div>
        )}

        {/* 2. Consistency Heatmap */}
        {activeVisualization === "heatmap" && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                {heatmapWeeks === 52 ? "Full 1-Year History" : `${heatmapWeeks} Weeks View`}
              </span>
              <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setHeatmapWeeks(52)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    heatmapWeeks === 52
                      ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8]"
                  }`}
                >
                  1 Year
                </button>
                <button
                  type="button"
                  onClick={() => setHeatmapWeeks(18)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    heatmapWeeks === 18
                      ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8]"
                  }`}
                >
                  18 Wks
                </button>
              </div>
            </div>

            <Heatmap
              values={vMap}
              target={habit.target_value}
              weeks={heatmapWeeks}
              unit={unitLabel(habit)}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
            />
          </div>
        )}

        {/* 3. Trends Bar Chart */}
        {activeVisualization === "trends" && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                Daily logged values
              </span>
              <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] p-1 rounded-xl">
                <button
                  onClick={() => setHistoryRange(7)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    historyRange === 7
                      ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8]"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setHistoryRange(30)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    historyRange === 30
                      ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8]"
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            <BarChart data={historyData} color="#6366F1" height={130} />
          </div>
        )}
      </div>

      {/* Danger Zone / Archive / Delete */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
        {habit.archived ? (
          <button
            onClick={() => {
              unarchiveHabit(habit.id);
              show(`${habit.name} restored`, "success");
            }}
            className="flex-1 py-3.5 rounded-2xl bg-[#EEF2FF] dark:bg-[#312E81] text-[#4338CA] dark:text-[#A5B4FC] font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#6366F1] hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Habit
          </button>
        ) : (
          <button
            onClick={() => {
              archiveHabit(habit.id);
              show(`${habit.name} archived`, "warning");
              onBack();
            }}
            className="flex-1 py-3.5 rounded-2xl bg-[#F1F5F9] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E2E8F0] dark:hover:bg-[#475569] transition-colors"
          >
            <Archive className="w-4 h-4" />
            Archive Habit
          </button>
        )}

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1 py-3.5 rounded-2xl bg-[#FEE2E2] dark:bg-[#7F1D1D]/40 text-[#EF4444] dark:text-[#FCA5A5] font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#FECACA] transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Habit
        </button>
      </div>

      {/* Modals */}
      <ManualLogModal
        isOpen={showManual}
        title={`Log ${habit.name}`}
        initial={currentValue}
        type={habit.tracking_type}
        unit={habit.unit}
        onClose={() => setShowManual(false)}
        onSubmit={handleManualSave}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={`Delete "${habit.name}"?`}
        message="This will permanently delete this habit and all its logged history. This action cannot be undone."
        confirmLabel="Delete Forever"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
