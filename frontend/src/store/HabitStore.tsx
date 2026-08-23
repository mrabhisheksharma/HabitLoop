import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";
import { Habit, LogEntry, TrackingType } from "@/src/types";
import { seedHabits } from "@/src/constants";

const HABITS_KEY = "habitloop_habits_v1";
const LOGS_KEY = "habitloop_logs_v1";
const SEED_KEY = "habitloop_seeded_v1";

const genId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export interface NewHabitInput {
  name: string;
  icon: string;
  category: string;
  tracking_type: TrackingType;
  target_value: number | null;
  color: string;
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
}

const HabitContext = createContext<HabitContextValue | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const seeded = await storage.getItem<boolean>(SEED_KEY, false);
      const rawH = await storage.getItem<string>(HABITS_KEY, "");
      const rawL = await storage.getItem<string>(LOGS_KEY, "");
      let loadedHabits: Habit[] = rawH ? (JSON.parse(rawH) as Habit[]) : [];
      const loadedLogs: LogEntry[] = rawL ? (JSON.parse(rawL) as LogEntry[]) : [];
      if (!seeded) {
        loadedHabits = seedHabits();
        await storage.setItem(HABITS_KEY, JSON.stringify(loadedHabits));
        await storage.setItem(SEED_KEY, true);
      }
      setHabits(loadedHabits);
      setLogs(loadedLogs);
      setLoading(false);
    })();
  }, []);

  const persistHabits = (next: Habit[]) =>
    storage.setItem(HABITS_KEY, JSON.stringify(next));
  const persistLogs = (next: LogEntry[]) =>
    storage.setItem(LOGS_KEY, JSON.stringify(next));

  const addHabit = useCallback((data: NewHabitInput): Habit => {
    const habit: Habit = {
      id: genId(),
      ...data,
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
        const next = prev.map((h) => (h.id === id ? { ...h, ...patch } : h));
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
