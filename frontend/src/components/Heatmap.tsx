import React, { useRef } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import dayjs from "dayjs";

import { useTheme, spacing, fonts } from "@/src/theme";
import { weekStart, DATE_FMT } from "@/src/utils/date";
import { completionRatio } from "@/src/utils/streaks";

const WEEKS = 18;
const CELL = 15;
const GAP = 4;

interface Props {
  values: Record<string, number>;
  target: number | null;
}

export function Heatmap({ values, target }: Props) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const start = weekStart().subtract(WEEKS - 1, "week");
  const today = dayjs();

  const tierColor = (dateStr: string): string => {
    const d = dayjs(dateStr);
    if (d.isAfter(today, "day")) return colors.surfaceTertiary + "55";
    const v = values[dateStr] ?? 0;
    const r = completionRatio(v, target);
    if (r <= 0) return colors.heat0;
    if (r <= 0.34) return colors.heat1;
    if (r <= 0.67) return colors.heat2;
    return colors.heat3;
  };

  const columns: string[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const col: string[] = [];
    for (let d = 0; d < 7; d++) {
      col.push(start.add(w, "week").add(d, "day").format(DATE_FMT));
    }
    columns.push(col);
  }

  const dayLabels = ["Mon", "", "Wed", "", "Fri", "", ""];

  return (
    <View style={styles.wrap}>
      <View style={styles.labelCol}>
        {dayLabels.map((l, i) => (
          <View key={i} style={styles.labelCell}>
            <Text style={[styles.dayLabel, { color: colors.onSurfaceTertiary }]}>
              {l}
            </Text>
          </View>
        ))}
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        contentContainerStyle={styles.grid}
      >
        {columns.map((col, ci) => (
          <View key={ci} style={{ gap: GAP }}>
            {col.map((dateStr) => (
              <View
                key={dateStr}
                style={[
                  styles.cell,
                  { backgroundColor: tierColor(dateStr) },
                ]}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row" },
  labelCol: { gap: GAP, marginRight: spacing.xs },
  labelCell: { height: CELL, justifyContent: "center" },
  dayLabel: { fontFamily: fonts.semiBold, fontSize: 9 },
  grid: { gap: GAP, paddingRight: spacing.md },
  cell: { width: CELL, height: CELL, borderRadius: 4 },
});
