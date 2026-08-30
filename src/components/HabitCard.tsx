import React, { useState } from "react";
import { Check, Flame, MoreVertical, Edit2, Archive, RotateCcw, Lock } from "lucide-react";
import { Habit } from "../types";
import { useHabits } from "../store/HabitStore";
import { ProgressRing } from "./ProgressRing";
import { currentStreak, isDayComplete, completionRatio } from "../utils/streaks";
import { formatValue, targetLabel, getUnitLabel } from "../utils/format";
import { categoryColor } from "../constants";
import { triggerConfetti } from "../utils/confetti";
import { useToast } from "./Toast";
import { todayStr, isToday, prettyDate, isDateEditable, isDateOlderThan7Days } from "../utils/date";

interface Props {
  habit: Habit;
  date?: string; // defaults to today
  onOpenDetail: (habitId: string) => void;
  onOpenEdit?: (habit: Habit) => void;
  compact?: boolean;
}

export const quickSteps = (habit: Habit): number[] => {
  if (habit.quick_increments && habit.quick_increments.length > 0) {
    return habit.quick_increments;
  }
  const t = habit.target_value ?? 1;
  if (t >= 1000) return [250, 500, 1000];
  if (t >= 100) return [10, 25, 50];
  if (t >= 20) return [2, 5, 10];
  if (t >= 5) return [1, 2, 5];
  return [1];
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
  const target = habit.target_value;
  const isDone = isDayComplete(value, target);
  const ratio = completionRatio(value, target);
  const logs = logsForHabit(habit.id);
  const streak = currentStreak(logs, target);

  const steps = quickSteps(habit);
  const catColor = categoryColor(habit.category);

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
      className={`group relative bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border transition-all duration-150 shadow-xs hover:shadow-md ${
        isDone
          ? "border-[#6366F1]/50 bg-[#EEF2FF]/30 dark:bg-[#312E81]/15"
          : "border-[#E2E8F0] dark:border-[#334155] hover:border-[#6366F1]/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left icon + Habit info */}
        <div
          onClick={() => onOpenDetail(habit.id)}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
        >
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0 transition-transform group-hover:scale-105 ${
              isDone
                ? "bg-[#6366F1]/10 dark:bg-[#6366F1]/20 border border-[#6366F1]/30"
                : "bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]"
            }`}
          >
            {habit.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-sm sm:text-base text-[#0F172A] dark:text-[#F8FAFC] truncate">
                {habit.name}
              </h3>
              {streak > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#EEF2FF] dark:bg-[#312E81]/60 text-[#4338CA] dark:text-[#A5B4FC] text-[10px] font-black shrink-0">
                  <Flame className="w-2.5 h-2.5 fill-current text-[#6366F1]" />
                  {streak}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: catColor }}
              />
              <span className="text-[11px] truncate">{formatValue(value, habit)}</span>
              {target && (
                <>
                  <span className="text-[11px] text-[#94A3B8]">/</span>
                  <span className="text-[11px] truncate">{targetLabel(target, habit)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Quick Log Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Stepper increments for multi-step habits */}
          {isEditable && target && target > 1 && (
            <div className="flex items-center gap-1">
              {steps.slice(0, 2).map((s) => (
                <button
                  key={s}
                  onClick={(e) => handleQuickAdd(e, s)}
                  title={`Add +${s} ${getUnitLabel(habit)}`}
                  className="px-2 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#6366F1] text-[#0F172A] hover:text-white dark:bg-[#334155] dark:hover:bg-[#6366F1] dark:text-[#F8FAFC] font-display font-black text-[11px] transition-all active:scale-90"
                >
                  +{s}
                </button>
              ))}
            </div>
          )}

          {/* Direct 1-Tap Toggle Done button with Progress Ring */}
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
              size={44}
              strokeWidth={4.5}
              progress={ratio}
              color="#6366F1"
              trackColor="#E2E8F0"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
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
                  <Lock className="w-3 h-3 text-[#94A3B8]" />
                ) : (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
              </div>
            </ProgressRing>
          </button>

          {/* Quick 3-dot menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-xl text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-30 w-36 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-[#E2E8F0] dark:border-[#334155] p-1 animate-pop">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenDetail(habit.id);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] flex items-center gap-2"
                >
                  View History
                </button>
                {onOpenEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenEdit(habit);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (habit.archived) {
                      unarchiveHabit(habit.id);
                      show(`${habit.name} unarchived`, "success");
                    } else {
                      archiveHabit(habit.id);
                      show(`${habit.name} archived`, "warning");
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] flex items-center gap-2"
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
      </div>
    </div>
  );
}
