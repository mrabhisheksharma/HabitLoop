import React, { useState } from "react";
import dayjs from "dayjs";
import { Flame, Sparkles, Calendar, RotateCcw, CheckCheck } from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { HabitCard } from "../components/HabitCard";
import { WeekStrip } from "../components/WeekStrip";
import { EmptyState } from "../components/EmptyState";
import { todayStr, isToday, formatFullDate, isDateEditable } from "../utils/date";
import { isDayComplete } from "../utils/streaks";
import { triggerConfetti } from "../utils/confetti";
import { useToast } from "../components/Toast";

interface Props {
  onOpenDetail: (habitId: string) => void;
  onOpenNewHabit: () => void;
  onOpenEdit?: (habit: any) => void;
}

export function TodayView({ onOpenDetail, onOpenNewHabit, onOpenEdit }: Props) {
  const { activeHabits, getValue, setLog, loading } = useHabits();
  const { show } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());

  const isSelectedToday = isToday(selectedDate);
  const isEditable = isDateEditable(selectedDate);

  const doneCount = activeHabits.filter((h) =>
    isDayComplete(getValue(h.id, selectedDate), h.target_value),
  ).length;

  const allCompleted = activeHabits.length > 0 && doneCount === activeHabits.length;

  const handleMarkAllDone = () => {
    if (!isEditable) {
      show("Cannot edit past dates older than 7 days or future dates.", "warning");
      return;
    }
    activeHabits.forEach((h) => {
      const currentVal = getValue(h.id, selectedDate);
      if (!isDayComplete(currentVal, h.target_value)) {
        setLog(h.id, selectedDate, h.target_value ?? 1);
      }
    });
    triggerConfetti();
    show("All habits checked off for today! 🎉", "success");
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-1">
        <div>
          <span className="text-xs font-black tracking-widest text-[#6366F1] uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {isSelectedToday ? dayjs().format("dddd, MMMM D") : formatFullDate(selectedDate)}
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] dark:text-[#F8FAFC]">
              {isSelectedToday ? "Today" : dayjs(selectedDate).format("dddd")}
            </h2>
            {!isSelectedToday && (
              <button
                onClick={() => setSelectedDate(todayStr())}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4338CA] dark:bg-[#312E81] dark:text-[#C7D2FE] text-xs font-black transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Jump to Today
              </button>
            )}
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                <Sparkles className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
                All Done!
              </div>
            ) : isEditable ? (
              <button
                onClick={handleMarkAllDone}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-display font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Mark all remaining habits complete for this day"
              >
                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mark All Done</span>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Main Habits List for Logging (Fast, minimal scrolling) */}
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
              date={selectedDate}
              onOpenDetail={onOpenDetail}
              onOpenEdit={onOpenEdit}
            />
          ))}
        </div>
      )}

      {/* 7-Day History Strip - Placed BELOW habits to log */}
      {activeHabits.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Past 7 Days History
            </span>
            <span className="text-[11px] font-bold text-[#6366F1]">
              Tap any day to view or adjust
            </span>
          </div>
          <WeekStrip
            selectedDate={selectedDate}
            onSelectDate={(d) => setSelectedDate(d)}
          />
        </div>
      )}
    </div>
  );
}
