import React, { useMemo, useState } from "react";
import { Plus, Edit2, Archive, RotateCcw, ChevronRight } from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { EmptyState } from "../components/EmptyState";
import { useToast } from "../components/Toast";
import { targetLabel } from "../utils/format";
import { categoryColor } from "../constants";
import { Habit } from "../types";

interface Props {
  onOpenDetail: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
  onOpenNewHabit: () => void;
}

export function HabitsView({ onOpenDetail, onEditHabit, onOpenNewHabit }: Props) {
  const { activeHabits, archivedHabits, archiveHabit, unarchiveHabit } = useHabits();
  const { show } = useToast();
  const [filter, setFilter] = useState("All");

  const categories = useMemo(() => {
    const set = new Set(activeHabits.map((h) => h.category));
    return ["All", ...Array.from(set)];
  }, [activeHabits]);

  const filtered =
    filter === "All"
      ? activeHabits
      : activeHabits.filter((h) => h.category === filter);

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <span className="text-xs font-black tracking-widest text-[#6366F1] uppercase">
            Habits Collection
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
            Manage Habits
          </h2>
        </div>
        <button
          onClick={onOpenNewHabit}
          data-testid="habits-add-btn"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-display font-black text-xs shadow-md transition-all transform active:scale-95 shadow-[#6366F1]/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Habit
        </button>
      </div>

      {/* Filter Chips */}
      {activeHabits.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((c) => {
            const isSelected = filter === c;
            const col = c === "All" ? "#6366F1" : categoryColor(c);
            return (
              <button
                key={c}
                data-testid={`filter-${c}`}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full font-display font-bold text-xs shrink-0 transition-all border ${
                  isSelected
                    ? "text-white shadow-xs font-black"
                    : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155] hover:border-current"
                }`}
                style={{
                  backgroundColor: isSelected ? col : undefined,
                  borderColor: isSelected ? col : undefined,
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* Main List */}
      {activeHabits.length === 0 && archivedHabits.length === 0 ? (
        <EmptyState
          testID="habits-empty"
          title="Your routine is a blank slate"
          subtitle="Create habits to track daily. Tap the button to add your first one."
          ctaLabel="Add a habit"
          onPressCta={onOpenNewHabit}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((habit) => (
              <div
                key={habit.id}
                data-testid={`manage-card-${habit.id}`}
                className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-[#E2E8F0] dark:border-[#334155] hover:border-[#6366F1]/50 transition-all flex flex-col justify-between shadow-xs"
              >
                {/* Header */}
                <div
                  onClick={() => onOpenDetail(habit.id)}
                  className="flex items-center gap-4 cursor-pointer group"
                >
                  <div className="w-13 h-13 rounded-2xl bg-[#EEF2FF] dark:bg-[#312E81]/50 flex items-center justify-center text-2xl shrink-0 border border-[#6366F1]/20 group-hover:scale-105 transition-transform">
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-base text-[#0F172A] dark:text-[#F8FAFC] truncate">
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: categoryColor(habit.category) }}
                      />
                      <span>{habit.category}</span>
                      <span>•</span>
                      <span>{targetLabel(habit.target_value, habit)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F1F5F9] dark:border-[#334155]">
                  <button
                    data-testid={`edit-${habit.id}`}
                    onClick={() => onEditHabit(habit)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-[#334155] dark:hover:bg-[#475569] text-[#0F172A] dark:text-[#F8FAFC] font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    data-testid={`archive-${habit.id}`}
                    onClick={() => {
                      archiveHabit(habit.id);
                      show(`${habit.name} archived`, "warning");
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F1F5F9] hover:bg-[#FEE2E2] dark:bg-[#334155] dark:hover:bg-[#7F1D1D] text-[#64748B] hover:text-[#EF4444] dark:text-[#94A3B8] dark:hover:text-[#FCA5A5] font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Archived Section */}
          {archivedHabits.length > 0 && (
            <div className="pt-8">
              <h3 className="font-display font-black text-xs tracking-wider text-[#64748B] dark:text-[#94A3B8] uppercase mb-3">
                Archived Habits ({archivedHabits.length})
              </h3>
              <div className="space-y-2">
                {archivedHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{habit.icon}</span>
                      <span className="font-display font-bold text-sm text-[#64748B] dark:text-[#94A3B8]">
                        {habit.name}
                      </span>
                    </div>
                    <button
                      data-testid={`unarchive-${habit.id}`}
                      onClick={() => {
                        unarchiveHabit(habit.id);
                        show(`${habit.name} restored`, "success");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#312E81] text-[#4338CA] dark:text-[#A5B4FC] font-display font-bold text-xs hover:bg-[#6366F1] hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
