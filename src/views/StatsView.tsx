import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Trophy, Flame, Award, Sparkles } from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { ProgressRing } from "../components/ProgressRing";
import { BarChart, BarDatum } from "../components/BarChart";
import { EmptyState } from "../components/EmptyState";
import { BadgeShowcase } from "../components/BadgeShowcase";
import { currentWeekDays, isFuture } from "../utils/date";
import { isDayComplete, currentStreak, longestStreak } from "../utils/streaks";
import { categoryColor } from "../constants";
import { computeBadges } from "../utils/badges";
import { getTargetForDate } from "../utils/target";

export function StatsView() {
  const { activeHabits, getValue, logs } = useHabits();

  const weekDays = currentWeekDays();
  const elapsedDays = weekDays.filter((d) => !isFuture(d));

  const badges = useMemo(
    () => computeBadges(activeHabits, logs),
    [activeHabits, logs],
  );

  const { rate, perDay, perHabit, maxStreak, activeStreaksCount } = useMemo(() => {
    let completed = 0;
    const total = activeHabits.length * Math.max(1, elapsedDays.length);

    let maxGlobalStreak = 0;
    let activeStreaks = 0;

    const perDay: BarDatum[] = weekDays.map((d) => {
      const future = isFuture(d);
      const count = future
        ? 0
        : activeHabits.filter((h) => {
            const target = getTargetForDate(h, d);
            return isDayComplete(getValue(h.id, d), target);
          }).length;
      return { label: dayjs(d).format("ddd"), value: count };
    });

    const perHabit = activeHabits
      .map((h) => {
        const habitLogs = logs.filter((l) => l.habit_id === h.id);
        const cur = currentStreak(habitLogs, h);
        const long = longestStreak(habitLogs, h);
        if (cur > 0) activeStreaks++;
        maxGlobalStreak = Math.max(maxGlobalStreak, long, cur);

        const done = elapsedDays.filter((d) => {
          const target = getTargetForDate(h, d);
          return isDayComplete(getValue(h.id, d), target);
        }).length;
        completed += done;
        return {
          habit: h,
          done,
          total: elapsedDays.length,
          ratio: elapsedDays.length ? done / elapsedDays.length : 0,
          currentStreak: cur,
          longestStreak: long,
        };
      })
      .sort((a, b) => b.ratio - a.ratio);

    return {
      rate: total ? completed / total : 0,
      perDay,
      perHabit,
      maxStreak: maxGlobalStreak,
      activeStreaksCount: activeStreaks,
    };
  }, [activeHabits, elapsedDays, weekDays, getValue, logs]);

  const statusFor = (ratio: number) => {
    if (ratio >= 0.7)
      return {
        label: "On track",
        colorClass: "bg-[#EEF2FF] text-[#4338CA] dark:bg-[#312E81] dark:text-[#C7D2FE]",
      };
    if (ratio >= 0.4)
      return {
        label: "Keeping up",
        colorClass: "bg-[#E0F2FE] text-[#0369A1] dark:bg-[#082F49] dark:text-[#38BDF8]",
      };
    return {
      label: "Needs focus",
      colorClass: "bg-[#F1F5F9] text-[#64748B] dark:bg-[#334155] dark:text-[#94A3B8]",
    };
  };

  if (activeHabits.length === 0) {
    return (
      <div className="space-y-6 pb-24 sm:pb-12">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] dark:text-[#F8FAFC]">
          Stats
        </h2>
        <EmptyState
          testID="stats-empty"
          title="Log data to see your habit analytics"
          subtitle="Add habits and start logging. Your weekly streaks and trends will appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-black tracking-widest text-[#6366F1] uppercase">
          Consistency Analytics
        </span>
        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
          Performance &amp; Stats
        </h2>
        <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mt-1">
          This week&apos;s progress &amp; consistency breakdown
        </p>
      </div>

      {/* Consistency & Streaks Highlight Banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col items-center text-center">
          <div className="flex items-center gap-1 text-[#6366F1] dark:text-[#818CF8] text-[11px] font-black uppercase mb-1">
            <Flame className="w-3.5 h-3.5 fill-current" />
            Active Streaks
          </div>
          <span className="font-display font-black text-2xl sm:text-3xl text-[#0F172A] dark:text-[#F8FAFC]">
            {activeStreaksCount}
          </span>
          <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            habits in progress
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col items-center text-center">
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[11px] font-black uppercase mb-1">
            <Trophy className="w-3.5 h-3.5 fill-current" />
            Best Streak
          </div>
          <span className="font-display font-black text-2xl sm:text-3xl text-amber-700 dark:text-amber-300">
            {maxStreak} <span className="text-xs font-normal">days</span>
          </span>
          <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            all-time high
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col items-center text-center">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase mb-1">
            <Award className="w-3.5 h-3.5" />
            Trophies
          </div>
          <span className="font-display font-black text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-400">
            {badges.filter((b) => b.unlocked).length} / {badges.length}
          </span>
          <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            milestones unlocked
          </span>
        </div>
      </div>

      {/* Trophies & Badges Showcase */}
      <BadgeShowcase
        badges={badges}
        title="Streak Trophies &amp; Milestones"
        subtitle="Earn exclusive badges by keeping streaks alive for 7, 30, and 100 days"
      />

      {/* Grid of Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Completion Rate */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-6 shadow-xs">
          <ProgressRing
            size={110}
            strokeWidth={12}
            progress={rate}
            color="#6366F1"
            trackColor="#E2E8F0"
          >
            <div className="flex flex-col items-center">
              <span className="font-display font-black text-2xl text-[#0F172A] dark:text-[#F8FAFC]">
                {Math.round(rate * 100)}%
              </span>
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                Done
              </span>
            </div>
          </ProgressRing>

          <div>
            <h3 className="font-display font-black text-lg text-[#0F172A] dark:text-[#F8FAFC]">
              Weekly Completion
            </h3>
            <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
              Across <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{activeHabits.length}</strong> habit{activeHabits.length > 1 ? "s" : ""} over{" "}
              <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{elapsedDays.length}</strong> day{elapsedDays.length > 1 ? "s" : ""} this week.
            </p>
          </div>
        </div>

        {/* Daily Completion Chart */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-black text-base text-[#0F172A] dark:text-[#F8FAFC]">
              Habits Done Per Day
            </h3>
            <span className="text-xs font-bold text-[#6366F1] bg-[#EEF2FF] dark:bg-[#312E81] px-2.5 py-1 rounded-full">
              Mon – Sun
            </span>
          </div>
          <BarChart data={perDay} color="#6366F1" height={100} />
        </div>
      </div>

      {/* Per Habit Comparison */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <h3 className="font-display font-black text-xs tracking-wider text-[#64748B] dark:text-[#94A3B8] uppercase mb-4">
          Per-Habit Performance This Week
        </h3>

        <div className="space-y-3">
          {perHabit.map(({ habit, done, total, ratio }) => {
            const status = statusFor(ratio);
            const catCol = categoryColor(habit.category);

            return (
              <div
                key={habit.id}
                data-testid={`stat-habit-${habit.id}`}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/60 border border-[#E2E8F0] dark:border-[#334155]"
              >
                {/* Emoji */}
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] flex items-center justify-center text-xl shrink-0 shadow-xs border border-[#E2E8F0] dark:border-[#334155]">
                  {habit.icon}
                </div>

                {/* Progress Bar & Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-display font-black text-sm text-[#0F172A] dark:text-[#F8FAFC] truncate">
                      {habit.name}
                    </span>
                    <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] shrink-0">
                      {done}/{total} days ({Math.round(ratio * 100)}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(ratio * 100)}%`,
                        backgroundColor: catCol,
                      }}
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-black font-display shrink-0 ${status.colorClass}`}>
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
