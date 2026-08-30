import React from "react";
import dayjs from "dayjs";
import { Flame, Sparkles, Calendar, CheckCheck } from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { HabitCard } from "../components/HabitCard";
import { EmptyState } from "../components/EmptyState";
import { todayStr } from "../utils/date";
import { isDayComplete } from "../utils/streaks";
import { getTargetForDate } from "../utils/target";
import { triggerConfetti } from "../utils/confetti";
import { useToast } from "../components/Toast";
import { Habit } from "../types";

interface Props {
  onOpenDetail: (habitId: string) => void;
  onOpenNewHabit: () => void;
  onOpenEdit?: (habit: Habit) => void;
}

export function TodayView({ onOpenDetail, onOpenNewHabit, onOpenEdit }: Props) {
  const { activeHabits, getValue, setLog, loading } = useHabits();
  const { show } = useToast();
  const today = todayStr();

  const doneCount = activeHabits.filter((h) => {
    const target = getTargetForDate(h, today);
    return isDayComplete(getValue(h.id, today), target);
  }).length;

  const allCompleted = activeHabits.length > 0 && doneCount === activeHabits.length;

  const handleMarkAllDone = () => {
    activeHabits.forEach((h) => {
      const target = getTargetForDate(h, today);
      const currentVal = getValue(h.id, today);
      if (!isDayComplete(currentVal, target)) {
        setLog(h.id, today, target ?? 1);
      }
    });
    triggerConfetti();
    show("All habits checked off for today! 🎉", "success");
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* Header Banner for Today */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-1">
        <div>
          <span className="text-xs font-black tracking-widest text-[#6366F1] uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {dayjs().format("dddd, MMMM D, YYYY")}
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] dark:text-[#F8FAFC]">
              Today
            </h2>
          </div>
        </div>

        {activeHabits.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#312E81]/60 border border-[#6366F1]/30 text-[#4338CA] dark:text-[#A5B4FC]">
              <Flame className="w-4 h-4 fill-current text-[#6366F1]" />
              <span className="font-display font-black text-xs">
                {doneCount} of {activeHabits.length} done
              </span>
            </div>

            {allCompleted ? (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                <Sparkles className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
                All Done!
              </div>
            ) : (
              <button
                onClick={handleMarkAllDone}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-display font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Mark all remaining habits complete for today"
              >
                <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Mark All Done</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Habits Grid for Today's Logging */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeHabits.length === 0 ? (
        <EmptyState
          testID="today-empty"
          title="No habits yet!"
          subtitle="Add your habits from the Habits tab to begin building your consistency."
          ctaLabel="Go to Habits page"
          onPressCta={onOpenNewHabit}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              date={today}
              onOpenDetail={onOpenDetail}
              onOpenEdit={onOpenEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
