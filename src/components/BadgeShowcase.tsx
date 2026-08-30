import React, { useState } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronRight,
  Flame,
  X,
  Info,
} from "lucide-react";
import { Badge, BadgeTier } from "../utils/badges";
import { triggerConfetti } from "../utils/confetti";

interface Props {
  badges: Badge[];
  title?: string;
  subtitle?: string;
}

const TIER_STYLES: Record<
  BadgeTier,
  {
    badgeBg: string;
    badgeBorder: string;
    accentText: string;
    glowClass: string;
    pillBg: string;
    label: string;
  }
> = {
  bronze: {
    badgeBg: "from-amber-500/10 via-orange-500/5 to-amber-600/10 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-900/40",
    badgeBorder: "border-amber-400/40 dark:border-amber-700/50",
    accentText: "text-amber-700 dark:text-amber-300",
    glowClass: "shadow-amber-500/10",
    pillBg: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    label: "Bronze Tier",
  },
  silver: {
    badgeBg: "from-slate-400/15 via-slate-300/10 to-indigo-400/10 dark:from-slate-800/40 dark:via-slate-700/20 dark:to-indigo-950/40",
    badgeBorder: "border-slate-300 dark:border-slate-600",
    accentText: "text-slate-700 dark:text-slate-200",
    glowClass: "shadow-slate-500/10",
    pillBg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    label: "Silver Tier",
  },
  gold: {
    badgeBg: "from-yellow-400/20 via-amber-400/10 to-orange-400/15 dark:from-yellow-950/50 dark:via-amber-950/30 dark:to-yellow-900/40",
    badgeBorder: "border-yellow-400/60 dark:border-yellow-600/60",
    accentText: "text-yellow-700 dark:text-yellow-300",
    glowClass: "shadow-yellow-500/20 ring-1 ring-yellow-400/30",
    pillBg: "bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-300 border-yellow-400 dark:border-yellow-700",
    label: "Gold Tier",
  },
  diamond: {
    badgeBg: "from-cyan-400/20 via-indigo-400/15 to-purple-400/20 dark:from-cyan-950/50 dark:via-indigo-950/30 dark:to-purple-950/40",
    badgeBorder: "border-cyan-400/60 dark:border-cyan-600/60",
    accentText: "text-cyan-700 dark:text-cyan-300",
    glowClass: "shadow-cyan-500/20 ring-1 ring-cyan-400/40",
    pillBg: "bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 border-cyan-400 dark:border-cyan-700",
    label: "Diamond Tier",
  },
};

export function BadgeShowcase({
  badges,
  title = "Trophies & Streak Badges",
  subtitle = "Unlock badges by maintaining streaks of 7, 30, and 100 days",
}: Props) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;

  const filteredBadges = badges.filter((b) => {
    if (filter === "unlocked") return b.unlocked;
    if (filter === "locked") return !b.unlocked;
    return true;
  });

  // Next milestone badge to reach
  const nextMilestone = badges.find((b) => !b.unlocked);

  const handleOpenBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      triggerConfetti();
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 sm:p-7 border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-black text-lg sm:text-xl text-[#0F172A] dark:text-[#F8FAFC]">
              {title}
            </h3>
          </div>
          <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Progress Pill & Filter Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#EEF2FF] dark:bg-[#312E81]/60 text-[#4338CA] dark:text-[#A5B4FC] font-display font-black text-xs border border-[#6366F1]/20">
            <Award className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>
              {unlockedCount}/{totalCount} Unlocked
            </span>
          </div>

          <div className="flex items-center bg-[#F1F5F9] dark:bg-[#0F172A] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === "all"
                  ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unlocked")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === "unlocked"
                  ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Next Up Milestone Banner */}
      {nextMilestone && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#EEF2FF] via-[#F8FAFC] to-[#F1F5F9] dark:from-[#312E81]/30 dark:via-[#1E293B] dark:to-[#0F172A]/50 border border-[#6366F1]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-[#6366F1]/30 flex items-center justify-center text-xl shadow-xs shrink-0">
              {nextMilestone.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#6366F1] dark:text-[#A5B4FC]">
                  Next Streak Milestone
                </span>
                <span className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC]">
                  • {nextMilestone.targetStreak}-Day Streak
                </span>
              </div>
              <p className="text-xs font-bold text-[#475569] dark:text-[#CBD5E1]">
                {nextMilestone.title} ({nextMilestone.currentStreakAchieved}/
                {nextMilestone.targetStreak} days complete)
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
              <span>{Math.round(nextMilestone.progress * 100)}%</span>
              <span>
                {Math.max(
                  0,
                  nextMilestone.targetStreak - nextMilestone.currentStreakAchieved,
                )}{" "}
                days left
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6366F1] transition-all duration-500"
                style={{ width: `${Math.round(nextMilestone.progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {filteredBadges.map((badge) => {
          const style = TIER_STYLES[badge.tier];

          return (
            <button
              key={badge.id}
              onClick={() => handleOpenBadge(badge)}
              data-testid={`badge-card-${badge.id}`}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-200 group flex flex-col justify-between ${
                badge.unlocked
                  ? `bg-gradient-to-br ${style.badgeBg} ${style.badgeBorder} ${style.glowClass} hover:scale-[1.02] shadow-xs cursor-pointer`
                  : "bg-[#F8FAFC]/80 dark:bg-[#0F172A]/40 border-[#E2E8F0] dark:border-[#334155] opacity-75 hover:opacity-95 cursor-pointer"
              }`}
            >
              {/* Top Row: Icon + Tier Label + Status */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition-transform group-hover:scale-110 ${
                      badge.unlocked
                        ? "bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]"
                        : "bg-[#E2E8F0]/60 dark:bg-[#334155]/60 grayscale"
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${style.pillBg}`}
                    >
                      {badge.targetStreak}-Day Streak
                    </span>
                    <h4 className="font-display font-black text-sm text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 leading-snug">
                      {badge.title}
                    </h4>
                  </div>
                </div>

                {badge.unlocked ? (
                  <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="p-1 rounded-full bg-[#E2E8F0] dark:bg-[#334155] text-[#94A3B8] dark:text-[#64748B]">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mb-3">
                {badge.description}
              </p>

              {/* Bottom Progress Bar / Unlocked Status */}
              <div className="pt-2 border-t border-[#E2E8F0]/60 dark:border-[#334155]/60">
                {badge.unlocked ? (
                  <div className="flex items-center justify-between text-xs font-black text-emerald-700 dark:text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-current" />
                      Unlocked!
                    </span>
                    {badge.qualifyingHabits.length > 0 && (
                      <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] truncate max-w-[120px]">
                        via {badge.qualifyingHabits[0]}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                      <span>{Math.round(badge.progress * 100)}% Progress</span>
                      <span>
                        {badge.currentStreakAchieved}/{badge.targetStreak}d
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6366F1] transition-all duration-300"
                        style={{ width: `${Math.round(badge.progress * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-[#E2E8F0] dark:border-[#334155] shadow-2xl animate-pop text-center relative">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-md mb-4 ${
                selectedBadge.unlocked
                  ? "bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950 border border-amber-300 dark:border-amber-700 scale-105"
                  : "bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] grayscale opacity-70"
              }`}
            >
              {selectedBadge.icon}
            </div>

            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 border ${
                TIER_STYLES[selectedBadge.tier].pillBg
              }`}
            >
              {selectedBadge.targetStreak}-Day Milestone
            </span>

            <h3 className="font-display font-black text-2xl text-[#0F172A] dark:text-[#F8FAFC]">
              {selectedBadge.title}
            </h3>

            <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] mt-2 leading-relaxed">
              {selectedBadge.description}
            </p>

            {/* Progress / Unlock details */}
            <div className="mt-6 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/70 border border-[#E2E8F0] dark:border-[#334155] text-left">
              <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2">
                <span>Streak Status</span>
                <span className="font-black text-[#6366F1]">
                  {selectedBadge.currentStreakAchieved} of{" "}
                  {selectedBadge.targetStreak} days
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedBadge.unlocked ? "bg-emerald-500" : "bg-[#6366F1]"
                  }`}
                  style={{
                    width: `${Math.round(selectedBadge.progress * 100)}%`,
                  }}
                />
              </div>

              {selectedBadge.unlocked ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>
                    Unlocked trophy!{" "}
                    {selectedBadge.qualifyingHabits.length > 0 &&
                      `Earned via ${selectedBadge.qualifyingHabits.join(", ")}`}
                  </span>
                </div>
              ) : (
                <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Keep your streak going for{" "}
                  {selectedBadge.targetStreak -
                    selectedBadge.currentStreakAchieved}{" "}
                  more consecutive day(s) to unlock this trophy.
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-6 w-full py-3 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-display font-black text-sm shadow-md transition-all active:scale-95"
            >
              Awesome
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
