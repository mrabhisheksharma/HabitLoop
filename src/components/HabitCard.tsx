import React, { useState } from "react";
import { Check, Flame, MoreVertical, Edit2, Archive, RotateCcw, Lock } from "lucide-react";
import { Habit } from "../types";
import { useHabits } from "../store/HabitStore";
import { ProgressRing } from "./ProgressRing";
import { currentStreak, isDayComplete, completionRatio } from "../utils/streaks";
import { formatValue, targetLabel, getUnitLabel, withCommas } from "../utils/format";
import { getTargetForDate } from "../utils/target";
import { categoryColor } from "../constants";
import { triggerConfetti } from "../utils/confetti";
import { useToast } from "./Toast";
import { todayStr, prettyDate, isDateEditable, isDateOlderThan7Days } from "../utils/date";

interface Props {
  habit: Habit;
  date?: string; // defaults to today
  onOpenDetail: (habitId: string) => void;
  onOpenEdit?: (habit: Habit) => void;
  compact?: boolean;
}

export const quickSteps = (habit: Habit): number[] => {
  if (habit.quick_increments && habit.quick_increments.length >= 3) {
    return habit.quick_increments.slice(0, 3);
  }
  if (habit.quick_increments && habit.quick_increments.length > 0) {
    const list = [...habit.quick_increments];
    while (list.length < 3) {
      list.push(list[list.length - 1] * 2);
    }
    return list.slice(0, 3);
  }
  const t = habit.target_value ?? 1;
  if (t >= 1000) return [250, 500, 1000];
  if (t >= 100) return [10, 25, 50];
  if (t >= 20) return [5, 10, 20];
  if (t >= 5) return [1, 2, 5];
  if (t > 1) return [1, Math.ceil(t / 2), t];
  return [1, 2, 3];
};

export function HabitCard({
  habit,
  date,
  onOpenDetail,
  onOpenEdit,
  compact = false,
}: Props) {
  const d = date || todayStr();
  const {
    getValue,
    incrementLog,
    setLog,
    logsForHabit,
    archiveHabit,
    unarchiveHabit,
  } = useHabits();
  const { show } = useToast();
  const [showMenu, setShowMenu] = useState(false);

  const value = getValue(habit.id, d);
  const target = getTargetForDate(habit, d);
  const isDone = isDayComplete(value, target);
  const ratio = completionRatio(value, target);
  const logs = logsForHabit(habit.id);
  const streak = currentStreak(logs, habit);

  const steps = quickSteps(habit);
  const catColor = categoryColor(habit.category);
  const unitStr = getUnitLabel(habit);

  const isEditable = isDateEditable(d);
  const isOlder = isDateOlderThan7Days(d);

  const handleQuickAdd = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    if (!isEditable) {
      show(
        isOlder
          ? "Past dates older than 7 days are read-only."
          : "Future dates cannot be logged.",
        "warning",
      );
      return;
    }
    const before = value;
    const after = before + delta;
    incrementLog(habit.id, d, delta);

    if (isDayComplete(after, target) && !isDayComplete(before, target)) {
      triggerConfetti();
      show(`${habit.name} goal reached for ${prettyDate(d)}! 🎉`, "success");
    }
  };

  const handleToggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditable) {
      show(
        isOlder
          ? "Past dates older than 7 days are read-only."
          : "Future dates cannot be logged.",
        "warning",
      );
      return;
    }
    if (isDone) {
      setLog(habit.id, d, 0);
      show(`Reset ${habit.name}`, "info");
    } else {
      const needed = target ?? 1;
      setLog(habit.id, d, needed);
      triggerConfetti();
      show(`${habit.name} completed! 🎉`, "success");
    }
  };

  return (
    <div
      data-testid={`habit-card-${habit.id}`}
      className={`group relative bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-150 shadow-xs hover:shadow-md flex flex-col justify-between ${
        isDone
          ? "border-[#6366F1]/50 bg-[#EEF2FF]/30 dark:bg-[#312E81]/15"
          : "border-[#E2E8F0] dark:border-[#334155] hover:border-[#6366F1]/40"
      }`}
    >
      {/* Top Section: Badges & Menu */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-2xs"
            style={{ backgroundColor: catColor }}
          >
            {habit.category}
          </span>

          {streak > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEF2FF] dark:bg-[#312E81]/60 text-[#4338CA] dark:text-[#A5B4FC] text-[11px] font-black">
              <Flame className="w-3 h-3 fill-current text-[#6366F1]" />
              {streak} {streak === 1 ? "day" : "days"} streak
            </span>
          )}
        </div>

        {/* 3-dot dropdown menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-xl text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors cursor-pointer"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 z-30 w-36 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-[#E2E8F0] dark:border-[#334155] p-1 animate-pop">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onOpenDetail(habit.id);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] flex items-center gap-2 cursor-pointer"
              >
                View History
              </button>
              {onOpenEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onOpenEdit(habit);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  if (habit.archived) {
                    unarchiveHabit(habit.id);
                    show(`${habit.name} unarchived`, "success");
                  } else {
                    archiveHabit(habit.id);
                    show(`${habit.name} archived`, "warning");
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] flex items-center gap-2 cursor-pointer"
              >
                {habit.archived ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Habit Header Info: Icon, Full Name (No truncation), Progress & Check Button */}
      <div className="flex items-start justify-between gap-3">
        {/* Clickable Habit title and icon to open details */}
        <div
          onClick={() => onOpenDetail(habit.id)}
          className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105 ${
              isDone
                ? "bg-[#6366F1]/15 dark:bg-[#6366F1]/25 border border-[#6366F1]/30"
                : "bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]"
            }`}
          >
            {habit.icon}
          </div>

          <div className="min-w-0 flex-1">
            {/* Full Habit Name - No truncation */}
            <h3 className="font-display font-black text-base sm:text-lg text-[#0F172A] dark:text-[#F8FAFC] leading-snug break-words">
              {habit.name}
            </h3>

            {/* Current value vs Target */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mt-1 flex-wrap">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {formatValue(value, habit)}
              </span>
              {target && (
                <>
                  <span className="text-[#94A3B8]">/</span>
                  <span>{targetLabel(target, habit)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 1-Tap Toggle Complete Button with Progress Ring */}
        <button
          onClick={handleToggleDone}
          data-testid={`habit-complete-btn-${habit.id}`}
          title={
            !isEditable
              ? isOlder
                ? "Historical record (>7 days old) - Read only"
                : "Future date - Cannot log"
              : isDone
              ? "Mark incomplete"
              : "Mark complete"
          }
          className={`shrink-0 transition-transform ${
            isEditable ? "active:scale-90 cursor-pointer" : "opacity-80 cursor-not-allowed"
          }`}
        >
          <ProgressRing
            size={48}
            strokeWidth={5}
            progress={ratio}
            color="#6366F1"
            trackColor="#E2E8F0"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isDone
                  ? "bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30 scale-100"
                  : isOlder
                  ? "bg-transparent text-[#94A3B8]"
                  : "bg-transparent text-transparent hover:text-[#64748B]"
              }`}
            >
              {isDone ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : isOlder ? (
                <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
            </div>
          </ProgressRing>
        </button>
      </div>

      {/* 3 Easy Logging Options below the name in the same tile */}
      {!compact && (
        <div className="mt-3.5 pt-3 border-t border-[#E2E8F0]/70 dark:border-[#334155]/70">
          {isEditable ? (
            <div className="grid grid-cols-3 gap-2">
              {steps.map((s, idx) => (
                <button
                  key={`${s}-${idx}`}
                  onClick={(e) => handleQuickAdd(e, s)}
                  title={`Add +${withCommas(s)} ${unitStr}`}
                  className="flex items-center justify-center py-2 px-1 rounded-xl bg-[#F8FAFC] hover:bg-[#6366F1] text-[#0F172A] hover:text-white dark:bg-[#0F172A]/70 dark:hover:bg-[#6366F1] dark:text-[#F8FAFC] dark:hover:text-white border border-[#E2E8F0] dark:border-[#334155] hover:border-[#6366F1] font-display font-black text-xs transition-all active:scale-95 shadow-2xs cursor-pointer text-center"
                >
                  +{withCommas(s)} {unitStr}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A]/70 text-[#64748B] dark:text-[#94A3B8] text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>
                {isOlder
                  ? "Historical record (>7 days) • Read-only"
                  : "Future date • Cannot log"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
