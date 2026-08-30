import React from "react";

export interface BarDatum {
  label: string;
  value: number;
  full?: boolean;
}

interface Props {
  data: BarDatum[];
  color: string;
  height?: number;
}

export function BarChart({ data, color, height = 130 }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const compact = data.length > 10;
  const barWidth = compact ? 10 : 28;
  const showValue = !compact;

  return (
    <div className="flex items-end gap-2 overflow-x-auto py-2 scrollbar-thin">
      {data.map((d, i) => {
        const h = Math.max(4, (d.value / max) * height);
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            {showValue && (
              <span className="text-[11px] font-bold text-[#686D73] dark:text-[#9BA1A6] h-4">
                {d.value > 0 ? d.value : ""}
              </span>
            )}
            <div
              className="flex items-end bg-[#F0F0F5] dark:bg-[#282C2F] rounded-lg p-0.5"
              style={{ height }}
            >
              <div
                className="rounded-md transition-all duration-300 hover:opacity-85"
                style={{
                  width: barWidth,
                  height: h,
                  backgroundColor: d.value > 0 ? color : "transparent",
                }}
              />
            </div>
            {(!compact || i % 5 === 0) && (
              <span className="text-[11px] font-semibold text-[#686D73] dark:text-[#9BA1A6] min-h-[16px] truncate max-w-[40px] text-center">
                {d.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
