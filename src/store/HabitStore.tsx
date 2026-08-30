import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Habit, LogEntry, TrackingType } from "../types";
import { seedHabits, seedLogs } from "../constants";
import { isDateEditable, todayStr } from "../utils/date";
import { updateTargetHistory } from "../utils/target";

const HABITS_KEY = "habitloop_habits_v2";
const LOGS_KEY = "habitloop_logs_v2";
const SEED_KEY = "habitloop_seeded_v2";

const genId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export interface NewHabitInput {
  name: string;
  icon: string;
  category: string;
  tracking_type: TrackingType;
  unit?: string;
  target_value: number | null;
  color: string;
  quick_increments?: number[];
}

interface HabitContextValue {
  habits: Habit[];
  logs: LogEntry[];
  loading: boolean;
  activeHabits: Habit[];
  archivedHabits: Habit[];
  getHabit: (id: string) => Habit | undefined;
  getValue: (habitId: string, date: string) => number;
  logsForHabit: (habitId: string) => LogEntry[];
  addHabit: (data: NewHabitInput) => Habit;
  updateHabit: (id: string, patch: Partial<NewHabitInput>) => void;
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  setLog: (habitId: string, date: string, value: number) => void;
  incrementLog: (habitId: string, date: string, delta: number) => void;
  clearLogsByDateRange: (startDate: string, endDate: string, habitId?: string | "all") => number;
  exportBackup: () => string;
  importBackup: (jsonString: string, mode?: "replace" | "merge") => { success: boolean; message: string; habitCount: number; logCount: number };
  optimizeStorage: () => { prunedLogsCount: number; newSizeKb: number };
  getStorageFootprint: () => { sizeKb: number; logCount: number; habitCount: number };
  resetToDefaults: () => void;
}

const HabitContext = createContext<HabitContextValue | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const seeded = localStorage.getItem(SEED_KEY);
      const rawH = localStorage.getItem(HABITS_KEY);
      const rawL = localStorage.getItem(LOGS_KEY);
      let loadedHabits: Habit[] = rawH ? (JSON.parse(rawH) as Habit[]) : [];
      let loadedLogs: LogEntry[] = rawL ? (JSON.parse(rawL) as LogEntry[]) : [];

      if (!seeded || loadedHabits.length < 8) {
        loadedHabits = seedHabits();
        loadedLogs = seedLogs(todayStr());
        localStorage.setItem(HABITS_KEY, JSON.stringify(loadedHabits));
        localStorage.setItem(LOGS_KEY, JSON.stringify(loadedLogs));
        localStorage.setItem(SEED_KEY, "true");
      } else {
        const today = todayStr();
        let habitsNeedUpdate = false;
        loadedHabits = loadedHabits.map((h) => {
          // If water intake target was updated to 3000 today but missing the 2500 historical anchor
          if (h.id === "seed-water" && h.target_value === 3000) {
            const has2500 = h.target_history?.some(
              (entry) => entry.target_value === 2500 && entry.effective_from < today
            );
            if (!has2500) {
              habitsNeedUpdate = true;
              return {
                ...h,
                target_history: [
                  { effective_from: "2020-01-01", target_value: 2500 },
                  { effective_from: today, target_value: 3000 },
                ],
              };
            }
          }

          if (!h.target_history || h.target_history.length === 0) {
            habitsNeedUpdate = true;
            return {
              ...h,
              target_history: [
                { effective_from: "2020-01-01", target_value: h.target_value },
              ],
            };
          }

          // Ensure habit has a past anchor for earlier dates
          const hasPastAnchor = h.target_history.some((e) => e.effective_from < today);
          if (!hasPastAnchor) {
            habitsNeedUpdate = true;
            const originalTarget =
              h.id === "seed-water" ? 2500 : h.target_value;
            return {
              ...h,
              target_history: [
                { effective_from: "2020-01-01", target_value: originalTarget },
                ...h.target_history,
              ],
            };
          }

          return h;
        });

        if (habitsNeedUpdate) {
          localStorage.setItem(HABITS_KEY, JSON.stringify(loadedHabits));
        }
      }
      setHabits(loadedHabits);
      setLogs(loadedLogs);
    } catch (e) {
      console.error("Error loading habits from localStorage:", e);
      setHabits(seedHabits());
      setLogs(seedLogs(todayStr()));
    } finally {
      setLoading(false);
    }
  }, []);

  const persistHabits = (next: Habit[]) => {
    try {
      localStorage.setItem(HABITS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Error persisting habits:", e);
    }
  };

  const persistLogs = (next: LogEntry[]) => {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Error persisting logs:", e);
    }
  };

  const addHabit = useCallback((data: NewHabitInput): Habit => {
    const habit: Habit = {
      id: genId(),
      ...data,
      target_history:
        data.target_value !== null && data.target_value !== undefined
          ? [{ effective_from: "2020-01-01", target_value: data.target_value }]
          : [],
      created_at: new Date().toISOString(),
      archived: false,
    };
    setHabits((prev) => {
      const next = [...prev, habit];
      persistHabits(next);
      return next;
    });
    return habit;
  }, []);

  const updateHabit = useCallback(
    (id: string, patch: Partial<NewHabitInput>) => {
      setHabits((prev) => {
        const today = todayStr();
        const next = prev.map((h) => {
          if (h.id !== id) return h;
          let targetHistory = h.target_history;
          if (
            patch.target_value !== undefined &&
            patch.target_value !== h.target_value
          ) {
            targetHistory = updateTargetHistory(
              h.target_history,
              h.target_value,
              patch.target_value,
              today,
              h.created_at
            );
          }
          return {
            ...h,
            ...patch,
            target_history: targetHistory,
          };
        });
        persistHabits(next);
        return next;
      });
    },
    [],
  );

  const archiveHabit = useCallback((id: string) => {
    setHabits((prev) => {
      const next = prev.map((h) =>
        h.id === id ? { ...h, archived: true } : h,
      );
      persistHabits(next);
      return next;
    });
  }, []);

  const unarchiveHabit = useCallback((id: string) => {
    setHabits((prev) => {
      const next = prev.map((h) =>
        h.id === id ? { ...h, archived: false } : h,
      );
      persistHabits(next);
      return next;
    });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => {
      const next = prev.filter((h) => h.id !== id);
      persistHabits(next);
      return next;
    });
    setLogs((prev) => {
      const next = prev.filter((l) => l.habit_id !== id);
      persistLogs(next);
      return next;
    });
  }, []);

  const setLog = useCallback(
    (habitId: string, date: string, value: number) => {
      // 7-day rule: only allow modifying records within the last 7 days (and not future)
      if (!isDateEditable(date)) {
        console.warn(`Attempted to modify log for non-editable date: ${date}`);
        return;
      }
      setLogs((prev) => {
        const idx = prev.findIndex(
          (l) => l.habit_id === habitId && l.date === date,
        );
        let next: LogEntry[];
        if (value <= 0) {
          next = idx >= 0 ? prev.filter((_, i) => i !== idx) : prev;
        } else if (idx >= 0) {
          next = prev.map((l, i) => (i === idx ? { ...l, value } : l));
        } else {
          next = [
            ...prev,
            {
              id: genId(),
              habit_id: habitId,
              date,
              value,
              created_at: new Date().toISOString(),
            },
          ];
        }
        persistLogs(next);
        return next;
      });
    },
    [],
  );

  const incrementLog = useCallback(
    (habitId: string, date: string, delta: number) => {
      // 7-day rule: only allow modifying records within the last 7 days (and not future)
      if (!isDateEditable(date)) {
        console.warn(`Attempted to modify log for non-editable date: ${date}`);
        return;
      }
      setLogs((prev) => {
        const idx = prev.findIndex(
          (l) => l.habit_id === habitId && l.date === date,
        );
        const current = idx >= 0 ? prev[idx].value : 0;
        const value = Math.max(0, current + delta);
        let next: LogEntry[];
        if (value <= 0 && idx >= 0) {
          next = prev.filter((_, i) => i !== idx);
        } else if (idx >= 0) {
          next = prev.map((l, i) => (i === idx ? { ...l, value } : l));
        } else {
          next = [
            ...prev,
            {
              id: genId(),
              habit_id: habitId,
              date,
              value,
              created_at: new Date().toISOString(),
            },
          ];
        }
        persistLogs(next);
        return next;
      });
    },
    [],
  );

  const clearLogsByDateRange = useCallback(
    (startDate: string, endDate: string, habitId: string = "all"): number => {
      let deletedCount = 0;
      setLogs((prev) => {
        const next = prev.filter((l) => {
          const inRange = l.date >= startDate && l.date <= endDate;
          const matchesHabit = habitId === "all" || l.habit_id === habitId;
          if (inRange && matchesHabit) {
            deletedCount++;
            return false;
          }
          return true;
        });
        persistLogs(next);
        return next;
      });
      return deletedCount;
    },
    [],
  );

  const exportBackup = useCallback((): string => {
    const payload = {
      version: "2.0",
      appName: "HabitLoop",
      exported_at: new Date().toISOString(),
      habits,
      logs: logs.filter((l) => l.value > 0),
    };
    return JSON.stringify(payload, null, 2);
  }, [habits, logs]);

  const importBackup = useCallback(
    (
      jsonString: string,
      mode: "replace" | "merge" = "replace"
    ): { success: boolean; message: string; habitCount: number; logCount: number } => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed) {
          return {
            success: false,
            message: "Invalid backup format: file is empty.",
            habitCount: 0,
            logCount: 0,
          };
        }

        const importedHabits: Habit[] = Array.isArray(parsed)
          ? parsed
          : parsed.habits || [];
        const importedLogs: LogEntry[] = parsed.logs || [];

        if (!Array.isArray(importedHabits) || importedHabits.length === 0) {
          return {
            success: false,
            message: "Invalid backup file: no habit definitions found.",
            habitCount: 0,
            logCount: 0,
          };
        }

        const validHabitIds = new Set(importedHabits.map((h) => h.id));
        const sanitizedLogs = importedLogs.filter(
          (l) =>
            l &&
            l.habit_id &&
            l.date &&
            l.value > 0 &&
            (mode === "merge" ? true : validHabitIds.has(l.habit_id))
        );

        let finalHabits: Habit[];
        let finalLogs: LogEntry[];

        if (mode === "replace") {
          finalHabits = importedHabits;
          finalLogs = sanitizedLogs;
        } else {
          const habitMap = new Map(habits.map((h) => [h.id, h]));
          importedHabits.forEach((h) => habitMap.set(h.id, h));
          finalHabits = Array.from(habitMap.values());

          const logKey = (l: LogEntry) => `${l.habit_id}_${l.date}`;
          const logMap = new Map(logs.map((l) => [logKey(l), l]));
          sanitizedLogs.forEach((l) => logMap.set(logKey(l), l));
          finalLogs = Array.from(logMap.values());
        }

        setHabits(finalHabits);
        setLogs(finalLogs);
        persistHabits(finalHabits);
        persistLogs(finalLogs);

        return {
          success: true,
          message: `Restored ${finalHabits.length} habits and ${finalLogs.length} activity records.`,
          habitCount: finalHabits.length,
          logCount: finalLogs.length,
        };
      } catch (e: any) {
        return {
          success: false,
          message: `Could not parse backup file: ${e.message || "Invalid JSON"}`,
          habitCount: 0,
          logCount: 0,
        };
      }
    },
    [habits, logs]
  );

  const optimizeStorage = useCallback((): { prunedLogsCount: number; newSizeKb: number } => {
    const activeAndArchivedIds = new Set(habits.map((h) => h.id));
    let prunedCount = 0;

    const seenMap = new Map<string, LogEntry>();
    logs.forEach((l) => {
      if (!l.habit_id || !l.date || l.value <= 0 || !activeAndArchivedIds.has(l.habit_id)) {
        prunedCount++;
        return;
      }
      const key = `${l.habit_id}_${l.date}`;
      if (seenMap.has(key)) {
        prunedCount++;
      }
      seenMap.set(key, l);
    });

    const optimizedLogs = Array.from(seenMap.values());
    setLogs(optimizedLogs);
    persistLogs(optimizedLogs);
    persistHabits(habits);

    const rawH = localStorage.getItem(HABITS_KEY) || "";
    const rawL = localStorage.getItem(LOGS_KEY) || "";
    const totalBytes = new Blob([rawH, rawL]).size;
    const newSizeKb = Math.round((totalBytes / 1024) * 10) / 10;

    return { prunedLogsCount: prunedCount, newSizeKb };
  }, [habits, logs]);

  const getStorageFootprint = useCallback((): { sizeKb: number; logCount: number; habitCount: number } => {
    try {
      const rawH = localStorage.getItem(HABITS_KEY) || "";
      const rawL = localStorage.getItem(LOGS_KEY) || "";
      const totalBytes = new Blob([rawH, rawL]).size;
      const sizeKb = Math.round((totalBytes / 1024) * 10) / 10;
      return {
        sizeKb,
        logCount: logs.filter((l) => l.value > 0).length,
        habitCount: habits.length,
      };
    } catch {
      return { sizeKb: 0, logCount: logs.length, habitCount: habits.length };
    }
  }, [habits, logs]);

  const resetToDefaults = useCallback(() => {
    const defaultHabits = seedHabits();
    const defaultLogs = seedLogs(todayStr());
    setHabits(defaultHabits);
    setLogs(defaultLogs);
    persistHabits(defaultHabits);
    persistLogs(defaultLogs);
    localStorage.setItem(SEED_KEY, "true");
  }, []);

  const getValue = useCallback(
    (habitId: string, date: string): number =>
      logs.find((l) => l.habit_id === habitId && l.date === date)?.value ?? 0,
    [logs],
  );

  const logsForHabit = useCallback(
    (habitId: string): LogEntry[] =>
      logs.filter((l) => l.habit_id === habitId),
    [logs],
  );

  const getHabit = useCallback(
    (id: string): Habit | undefined => habits.find((h) => h.id === id),
    [habits],
  );

  const activeHabits = useMemo(
    () => habits.filter((h) => !h.archived),
    [habits],
  );
  const archivedHabits = useMemo(
    () => habits.filter((h) => h.archived),
    [habits],
  );

  const value: HabitContextValue = {
    habits,
    logs,
    loading,
    activeHabits,
    archivedHabits,
    getHabit,
    getValue,
    logsForHabit,
    addHabit,
    updateHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
    setLog,
    incrementLog,
    clearLogsByDateRange,
    exportBackup,
    importBackup,
    optimizeStorage,
    getStorageFootprint,
    resetToDefaults,
  };

  return (
    <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
  );
}

export const useHabits = (): HabitContextValue => {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used within HabitProvider");
  return ctx;
};
