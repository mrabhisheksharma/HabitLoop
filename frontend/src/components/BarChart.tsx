import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import { useTheme, spacing, radius, fonts } from "@/src/theme";

export interface BarDatum {
  label: string;
  value: number;
  full?: boolean; // met target
}

interface Props {
  data: BarDatum[];
  color: string;
  height?: number;
}

export function BarChart({ data, color, height = 130 }: Props) {
  const { colors } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  const compact = data.length > 10;
  const barWidth = compact ? 8 : 26;
  const showValue = !compact;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {data.map((d, i) => {
        const h = Math.max(3, (d.value / max) * height);
        return (
          <View key={i} style={styles.col}>
            {showValue ? (
              <Text style={[styles.value, { color: colors.onSurfaceTertiary }]}>
                {d.value > 0 ? d.value : ""}
              </Text>
            ) : null}
            <View style={[styles.track, { height }]}>
              <View
                style={{
                  width: barWidth,
                  height: h,
                  borderRadius: radius.sm,
                  backgroundColor:
                    d.value > 0 ? color : colors.surfaceTertiary,
                }}
              />
            </View>
            {(!compact || i % 5 === 0) && (
              <Text
                style={[styles.label, { color: colors.onSurfaceTertiary }]}
                numberOfLines={1}
              >
                {d.label}
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "flex-end", gap: spacing.sm, paddingVertical: spacing.sm },
  col: { alignItems: "center", gap: spacing.xs },
  track: { justifyContent: "flex-end" },
  value: { fontFamily: fonts.semiBold, fontSize: 10 },
  label: { fontFamily: fonts.semiBold, fontSize: 10, minHeight: 14 },
});
