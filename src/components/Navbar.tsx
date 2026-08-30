import React from "react";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ListOrdered,
  BarChart2,
  Moon,
  Sun,
  Plus,
} from "lucide-react";
import { TabType } from "../types";
import { useTheme } from "../theme/ThemeContext";
import { BrandLogo } from "./BrandLogo";

interface Props {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenNewHabit: () => void;
}

export function Navbar({ activeTab, onSelectTab, onOpenNewHabit }: Props) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* Top Header for Desktop / Tablets */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#334155] px-4 md:px-8 py-3.5 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => onSelectTab("today")}
            className="flex items-center gap-3 text-left group"
          >
            <BrandLogo size="md" className="group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="font-display font-black text-xl tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                HabitLoop
              </h1>
              <p className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] hidden sm:block">
                Daily Tracker &amp; Consistency Loop
              </p>
            </div>
          </button>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden sm:flex items-center bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
            <button
              onClick={() => onSelectTab("today")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs transition-all ${
                activeTab === "today"
                  ? "bg-white dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs font-black"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-[#6366F1]" />
              Today
            </button>
            <button
              onClick={() => onSelectTab("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs transition-all ${
                activeTab === "calendar"
                  ? "bg-white dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs font-black"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              }`}
            >
              <CalendarDays className="w-4 h-4 text-[#0EA5E9]" />
              Calendar
            </button>
            <button
              onClick={() => onSelectTab("habits")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs transition-all ${
                activeTab === "habits"
                  ? "bg-white dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs font-black"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              }`}
            >
              <ListOrdered className="w-4 h-4 text-[#8B5CF6]" />
              Habits
            </button>
            <button
              onClick={() => onSelectTab("stats")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs transition-all ${
                activeTab === "stats"
                  ? "bg-white dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs font-black"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              }`}
            >
              <BarChart2 className="w-4 h-4 text-[#F59E0B]" />
              Stats
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2.5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#64748B]" />}
            </button>
            {activeTab === "habits" && (
              <button
                onClick={onOpenNewHabit}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-display font-black text-xs shadow-md hover:shadow-lg shadow-[#6366F1]/20 transition-all transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                New Habit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Floating Bottom Tab Bar for Mobile */}
      <div className="sm:hidden fixed bottom-4 left-3 right-3 z-40">
        <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-lg border border-[#E2E8F0] dark:border-[#334155] rounded-3xl p-1.5 shadow-2xl flex items-center justify-around">
          <button
            onClick={() => onSelectTab("today")}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
              activeTab === "today"
                ? "bg-[#EEF2FF] dark:bg-[#312E81]/60 text-[#4F46E5] dark:text-[#A5B4FC]"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="text-[10px] font-extrabold font-display">Today</span>
          </button>
          <button
            onClick={() => onSelectTab("calendar")}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
              activeTab === "calendar"
                ? "bg-[#EEF2FF] dark:bg-[#312E81]/60 text-[#4F46E5] dark:text-[#A5B4FC]"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="text-[10px] font-extrabold font-display">Calendar</span>
          </button>
          <button
            onClick={() => onSelectTab("habits")}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
              activeTab === "habits"
                ? "bg-[#EEF2FF] dark:bg-[#312E81]/60 text-[#4F46E5] dark:text-[#A5B4FC]"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span className="text-[10px] font-extrabold font-display">Habits</span>
          </button>
          <button
            onClick={() => onSelectTab("stats")}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
              activeTab === "stats"
                ? "bg-[#EEF2FF] dark:bg-[#312E81]/60 text-[#4F46E5] dark:text-[#A5B4FC]"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="text-[10px] font-extrabold font-display">Stats</span>
          </button>
        </div>
      </div>
    </>
  );
}
