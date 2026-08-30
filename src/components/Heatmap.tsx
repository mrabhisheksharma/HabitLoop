import React, { useRef, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useTheme } from "../theme/ThemeContext";
import { weekStart, DATE_FMT, prettyDate } from "../utils/date";
import { completionRatio } from "../utils/streaks";

const CELL = 13;
const GAP = 3.5;

interface Props {
  values: Record<string, number>;
  target: number | null;
  weeks?: number;
  onSelectDate?: (dateStr: string) => void;
  selectedDate?: string;
  unit?: string;
}

export function Heatmap({
  values,
  target,
  weeks = 52,
  onSelectDate,
  selectedDate,
  unit,
}: Props) {
  const { colors } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const start = useMemo(() => weekStart().subtract(weeks - 1, "week"), [weeks]);
  const today = dayjs();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeks]);

  const tierColor = (dateStr: string): string => {
    const d = dayjs(dateStr);
    if (d.isAfter(today, "day")) return colors.surfaceTertiary + "40";
    const v = values[dateStr] ?? 0;
    const r = completionRatio(v, target);
    if (r <= 0) return colors.heat0;
    if (r <= 0.34) return colors.heat1;
    if (r <= 0.67) return colors.heat2;
    return colors.heat3;
  };

  const { columns, monthHeaders } = useMemo(() => {
    const cols: string[][] = [];
    const headers: { month: string; colIndex: number }[] = [];
    let lastMonth = "";

    for (let w = 0; w < weeks; w++) {
      const col: string[] = [];
      const colStart = start.add(w, "week");
      const currentMonth = colStart.format("MMM");

      if (currentMonth !== lastMonth) {
        headers.push({ month: currentMonth, colIndex: w });
        lastMonth = currentMonth;
      }

      for (let d = 0; d < 7; d++) {
        col.push(colStart.add(d, "day").format(DATE_FMT));
      }
      cols.push(col);
    }
    return { columns: cols, monthHeaders: headers };
  }, [start, weeks]);

  const dayLabels = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

  return (
    <div className="flex select-none">
      {/* Day of week labels */}
      <div
        className="flex flex-col shrink-0 mr-2 justify-between pt-5"
        style={{ height: 7 * CELL + 6 * GAP + 20 }}
      >
        {dayLabels.map((l, i) => (
          <div
            key={i}
            className="flex items-center text-[10px] font-semibold text-[#686D73] dark:text-[#9BA1A6]"
            style={{ height: CELL }}
          >
            {l}
          </div>
        ))}
      </div>

      {/* Grid columns with Month header row */}
      <div
        ref={scrollRef}
        className="flex flex-col overflow-x-auto pb-2 scrollbar-thin flex-1"
      >
        {/* Month labels row */}
        <div className="flex relative h-5 mb-1" style={{ width: columns.length * (CELL + GAP) }}>
          {monthHeaders.map(({ month, colIndex }) => (
            <div
              key={`${month}-${colIndex}`}
              className="absolute text-[10px] font-bold text-[#686D73] dark:text-[#9BA1A6] select-none"
              style={{ left: colIndex * (CELL + GAP) }}
            >
              {month}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex" style={{ gap: GAP }}>
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col" style={{ gap: GAP }}>
              {col.map((dateStr) => {
                const isSelected = selectedDate === dateStr;
                const val = values[dateStr] ?? 0;
                const isFutureDate = dayjs(dateStr).isAfter(today, "day");
                const u = unit ? ` ${unit}` : "";
                return (
                  <button
                    key={dateStr}
                    type="button"
                    title={`${prettyDate(dateStr)}: ${val}${u}${
                      target ? ` / ${target}${u}` : ""
                    }`}
                    disabled={isFutureDate}
                    onClick={() => onSelectDate && onSelectDate(dateStr)}
                    className={`rounded-[3px] transition-transform hover:scale-125 focus:outline-none ${
                      isSelected
                        ? "ring-2 ring-[#6366F1] dark:ring-[#818CF8] ring-offset-1 z-10"
                        : ""
                    }`}
                    style={{
                      width: CELL,
                      height: CELL,
                      backgroundColor: tierColor(dateStr),
                      cursor: isFutureDate ? "default" : "pointer",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
