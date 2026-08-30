import React, { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import {
  X,
  Trash2,
  Download,
  Upload,
  HardDrive,
  Sparkles,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  FileJson,
  ShieldAlert,
  Database,
  ArrowRight,
} from "lucide-react";
import { useHabits } from "../store/HabitStore";
import { useToast } from "./Toast";
import { todayStr, DATE_FMT, formatFullDate } from "../utils/date";
import { Habit, LogEntry } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultMonthDate?: string; // YYYY-MM-DD to pre-fill month range
}

type TabKey = "clear" | "backup" | "storage";

export function CalendarSettingsModal({
  isOpen,
  onClose,
  defaultMonthDate,
}: Props) {
  const {
    activeHabits,
    habits,
    logs,
    clearLogsByDateRange,
    exportBackup,
    importBackup,
    optimizeStorage,
    getStorageFootprint,
    resetToDefaults,
  } = useHabits();
  const { show } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>("clear");

  // Date Range Clear State
  const initialStart = useMemo(() => {
    if (defaultMonthDate) {
      return dayjs(defaultMonthDate).startOf("month").format(DATE_FMT);
    }
    return dayjs().startOf("month").format(DATE_FMT);
  }, [defaultMonthDate]);

  const initialEnd = useMemo(() => todayStr(), []);

  const [startDate, setStartDate] = useState<string>(initialStart);
  const [endDate, setEndDate] = useState<string>(initialEnd);
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  // Backup & Restore State
  const [restoreMode, setRestoreMode] = useState<"replace" | "merge">("replace");
  const [filePreview, setFilePreview] = useState<{
    fileName: string;
    habitCount: number;
    logCount: number;
    rawJson: string;
    exportedAt?: string;
  } | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Storage Stats State
  const [footprint, setFootprint] = useState(getStorageFootprint());
  const [isOptimizing, setIsOptimizing] = useState(false);

  if (!isOpen) return null;

  // Calculate matching logs for current range filter
  const matchingLogsCount = logs.filter((l) => {
    const inRange = l.date >= startDate && l.date <= endDate;
    const matchesHabit = selectedHabitId === "all" || l.habit_id === selectedHabitId;
    return inRange && matchesHabit && l.value > 0;
  }).length;

  const handleQuickRange = (preset: "week" | "month" | "last30" | "all") => {
    const today = dayjs();
    if (preset === "week") {
      setStartDate(today.subtract(6, "day").format(DATE_FMT));
      setEndDate(today.format(DATE_FMT));
    } else if (preset === "month") {
      setStartDate(today.startOf("month").format(DATE_FMT));
      setEndDate(today.format(DATE_FMT));
    } else if (preset === "last30") {
      setStartDate(today.subtract(29, "day").format(DATE_FMT));
      setEndDate(today.format(DATE_FMT));
    } else if (preset === "all") {
      setStartDate("2020-01-01");
      setEndDate(today.format(DATE_FMT));
    }
  };

  const handleExecuteClear = () => {
    if (matchingLogsCount === 0) {
      show("No records found in the selected date range.", "info");
      setIsConfirmingClear(false);
      return;
    }
    const count = clearLogsByDateRange(startDate, endDate, selectedHabitId);
    show(`Cleared ${count} log entries from ${startDate} to ${endDate}.`, "success");
    setIsConfirmingClear(false);
    setFootprint(getStorageFootprint());
  };

  const handleExportBackup = () => {
    try {
      const jsonStr = exportBackup();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const filename = `habitloop-backup-${todayStr()}.json`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      show(`Backup saved as ${filename}`, "success");
    } catch (e: any) {
      show("Failed to generate backup file.", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const importedHabits: Habit[] = Array.isArray(parsed)
          ? parsed
          : parsed.habits || [];
        const importedLogs: LogEntry[] = parsed.logs || [];

        if (!Array.isArray(importedHabits) || importedHabits.length === 0) {
          show("Selected file does not contain valid HabitLoop data.", "error");
          return;
        }

        setFilePreview({
          fileName: file.name,
          habitCount: importedHabits.length,
          logCount: importedLogs.filter((l) => l.value > 0).length,
          rawJson: text,
          exportedAt: parsed.exported_at,
        });
      } catch (err: any) {
        show("Could not read JSON file: " + err.message, "error");
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!filePreview) return;
    setIsRestoring(true);
    try {
      const res = importBackup(filePreview.rawJson, restoreMode);
      if (res.success) {
        show(res.message, "success");
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFootprint(getStorageFootprint());
        onClose();
      } else {
        show(res.message, "error");
      }
    } catch (err: any) {
      show("Restore failed: " + err.message, "error");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleOptimizeStorage = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const result = optimizeStorage();
      setFootprint(getStorageFootprint());
      setIsOptimizing(false);
      show(
        `Optimized! Storage is now ${result.newSizeKb} KB (${result.prunedLogsCount} empty/redundant logs pruned).`,
        "success"
      );
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#312E81] flex items-center justify-center text-[#6366F1]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F172A] dark:text-[#F8FAFC]">
                Data &amp; Calendar Tools
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                Manage logs, clear date ranges, and backup your progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] dark:border-[#334155] px-4 pt-2 gap-2 bg-[#F8FAFC] dark:bg-[#0F172A]/40">
          <button
            onClick={() => {
              setActiveTab("clear");
              setIsConfirmingClear(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-display text-xs font-black transition-all cursor-pointer ${
              activeTab === "clear"
                ? "border-[#EF4444] text-[#EF4444]"
                : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Date Range
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-display text-xs font-black transition-all cursor-pointer ${
              activeTab === "backup"
                ? "border-[#6366F1] text-[#6366F1]"
                : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Backup &amp; Restore
          </button>

          <button
            onClick={() => setActiveTab("storage")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-display text-xs font-black transition-all cursor-pointer ${
              activeTab === "storage"
                ? "border-[#0EA5E9] text-[#0EA5E9]"
                : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Storage Health
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CLEAR BY DATE RANGE */}
          {activeTab === "clear" && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-[#FEF2F2] dark:bg-[#450A0A]/40 border border-[#FECACA] dark:border-[#7F1D1D] text-xs text-[#991B1B] dark:text-[#FCA5A5] flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Selective Data Purge:</span> Choose a
                  date range to delete logged completions. Habit settings, streaks,
                  and target history will remain intact.
                </div>
              </div>

              {/* Quick Range Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickRange("week")}
                    className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] hover:bg-[#E2E8F0] dark:hover:bg-[#475569] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    Past 7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickRange("month")}
                    className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] hover:bg-[#E2E8F0] dark:hover:bg-[#475569] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickRange("last30")}
                    className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] hover:bg-[#E2E8F0] dark:hover:bg-[#475569] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickRange("all")}
                    className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] hover:bg-[#E2E8F0] dark:hover:bg-[#475569] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    All History
                  </button>
                </div>
              </div>

              {/* Start & End Date Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                    Start Date (From)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] dark:text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#EF4444]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                    End Date (To)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={todayStr()}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] dark:text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#EF4444]"
                  />
                </div>
              </div>

              {/* Habit Filter */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Target Habits
                </label>
                <select
                  value={selectedHabitId}
                  onChange={(e) => setSelectedHabitId(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] dark:text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#EF4444] cursor-pointer"
                >
                  <option value="all">All Habits ({activeHabits.length})</option>
                  {habits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.icon} {h.name} {h.archived ? "(Archived)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status & Preview of matching logs */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                    Records matching criteria:
                  </span>
                  <div className="font-display font-black text-lg text-[#0F172A] dark:text-[#F8FAFC]">
                    {matchingLogsCount} {matchingLogsCount === 1 ? "log" : "logs"} found
                  </div>
                </div>
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                  {formatFullDate(startDate)} → {formatFullDate(endDate)}
                </span>
              </div>

              {/* Clear Button / Confirmation Box */}
              {!isConfirmingClear ? (
                <button
                  type="button"
                  disabled={matchingLogsCount === 0}
                  onClick={() => setIsConfirmingClear(true)}
                  className={`w-full py-3 rounded-2xl font-display font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    matchingLogsCount === 0
                      ? "bg-[#F1F5F9] dark:bg-[#334155] text-[#94A3B8] cursor-not-allowed"
                      : "bg-[#EF4444] hover:bg-[#DC2626] text-white active:scale-98"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Selected Date Range</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FEF2F2] dark:bg-[#450A0A]/60 border border-[#FECACA] dark:border-[#991B1B] space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-sm font-black text-[#991B1B] dark:text-[#FCA5A5]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Confirm Clearing {matchingLogsCount} Records?</span>
                  </div>
                  <p className="text-xs text-[#7F1D1D] dark:text-[#FECACA] leading-relaxed">
                    This will permanently clear logs between {startDate} and{" "}
                    {endDate}. This action cannot be reversed unless you have a
                    backup.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClear(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteClear}
                      className="flex-1 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      Yes, Clear Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BACKUP & RESTORE */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              {/* Export Section */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-black text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-[#6366F1]" />
                      Export Offline Backup File
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Download all your habit targets, historical changes, and
                      logs into a single JSON file directly on your device.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                    {habits.length} habits • {logs.filter((l) => l.value > 0).length} records
                  </span>
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-display font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Backup (.json)
                  </button>
                </div>
              </div>

              {/* Import / Restore Section */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                <div>
                  <h3 className="font-display font-black text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#0EA5E9]" />
                    Restore from Backup File
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                    Select a previously saved HabitLoop backup file to restore
                    your progress on this device.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="backup-file-picker"
                />

                {!filePreview ? (
                  <label
                    htmlFor="backup-file-picker"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#CBD5E1] dark:border-[#475569] rounded-2xl bg-white dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]/60 cursor-pointer transition-colors"
                  >
                    <FileJson className="w-8 h-8 text-[#0EA5E9] mb-2" />
                    <span className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      Click to choose a .json backup file
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Works 100% offline and stays safely inside device storage
                    </span>
                  </label>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#0EA5E9] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <div>
                          <span className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC]">
                            {filePreview.fileName}
                          </span>
                          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            Found {filePreview.habitCount} habits &amp;{" "}
                            {filePreview.logCount} logged check-ins
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-xs font-bold text-[#EF4444] hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Restore Mode Option */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setRestoreMode("replace")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                          restoreMode === "replace"
                            ? "bg-[#EEF2FF] dark:bg-[#312E81] border-[#6366F1] text-[#4F46E5] dark:text-[#C7D2FE]"
                            : "bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                        }`}
                      >
                        Replace All Data
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestoreMode("merge")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                          restoreMode === "merge"
                            ? "bg-[#EEF2FF] dark:bg-[#312E81] border-[#6366F1] text-[#4F46E5] dark:text-[#C7D2FE]"
                            : "bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                        }`}
                      >
                        Merge with Existing
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isRestoring}
                      onClick={handleExecuteRestore}
                      className="w-full py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-display font-black text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
                    >
                      {isRestoring ? "Restoring..." : "Apply & Restore Data Now"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE HEALTH */}
          {activeTab === "storage" && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155] text-center">
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
                    Storage Size
                  </span>
                  <div className="font-display font-black text-xl text-[#0EA5E9] dark:text-[#38BDF8] mt-1">
                    {footprint.sizeKb} KB
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155] text-center">
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
                    Stored Logs
                  </span>
                  <div className="font-display font-black text-xl text-[#6366F1] dark:text-[#818CF8] mt-1">
                    {footprint.logCount}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155] text-center">
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
                    Total Habits
                  </span>
                  <div className="font-display font-black text-xl text-[#8B5CF6] dark:text-[#A78BFA] mt-1">
                    {footprint.habitCount}
                  </div>
                </div>
              </div>

              {/* Lightweight Footprint guarantee info */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <h4 className="font-display font-black text-xs text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">
                    Ultra-Lightweight Storage Engine
                  </h4>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  HabitLoop uses a compact, sparse data representation. Days with
                  zero check-ins consume 0 bytes of storage, and 1 full year of
                  daily tracking across 10 habits takes less than ~35 KB of device
                  memory.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isOptimizing}
                    onClick={handleOptimizeStorage}
                    className="w-full py-2.5 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{isOptimizing ? "Optimizing..." : "Compact & Optimize Local Data"}</span>
                  </button>
                </div>
              </div>

              {/* Reset to Seed Demo Data */}
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                    Want to start fresh with demo habits?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Reset all habits and logs to default seed template? Your current data will be replaced."
                      )
                    ) {
                      resetToDefaults();
                      setFootprint(getStorageFootprint());
                      show("Reset to default demo data successfully.", "info");
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A]/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
