import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, spacing, radius, fonts } from "@/src/theme";
import { Habit } from "@/src/types";
import { ProgressRing } from "./ProgressRing";
import { completionRatio, isDayComplete } from "@/src/utils/streaks";
import { formatValue, targetLabel } from "@/src/utils/format";

interface Props {
  habit: Habit;
  value: number;
  onQuick: (delta: number) => void;
  onManual: () => void;
  onOpen: () => void;
}

export const quickSteps = (habit: Habit): number[] => {
  if (habit.tracking_type === "duration") return [15, 30];
  if (habit.target_value && habit.target_value >= 1000) return [100, 500, 1000];
  return [1, 5, 10];
};

export function HabitCard({ habit, value, onQuick, onManual, onOpen }: Props) {
  const { colors } = useTheme();
  const done = isDayComplete(value, habit.target_value);
  const ratio = completionRatio(value, habit.target_value);
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(value);

  useEffect(() => {
    if (value > prev.current) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.12,
          useNativeDriver: true,
          speed: 40,
          bounciness: 14,
        }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
    prev.current = value;
  }, [value, scale]);

  const steps = quickSteps(habit);
  const unit = habit.tracking_type === "duration" ? "m" : "";

  return (
    <Pressable
      testID={`habit-card-${habit.id}`}
      onPress={onOpen}
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: done ? colors.brandPrimary : colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.emojiCircle,
            { backgroundColor: done ? colors.brandPrimary : colors.brandTertiary },
          ]}
        >
          <Text style={styles.emoji}>{habit.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text
            style={[styles.name, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          <Text style={[styles.progressText, { color: colors.onSurfaceTertiary }]}>
            {formatValue(value, habit.tracking_type)}
            {habit.target_value
              ? ` / ${targetLabel(habit.target_value, habit.tracking_type)}`
              : ""}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ scale }] }}>
          <ProgressRing
            size={54}
            strokeWidth={6}
            progress={ratio}
            color={colors.brandPrimary}
            trackColor={colors.surfaceTertiary}
          >
            {done ? (
              <Ionicons name="checkmark" size={26} color={colors.brandPrimary} />
            ) : (
              <Text style={[styles.ringText, { color: colors.onSurface }]}>
                {Math.round(ratio * 100)}%
              </Text>
            )}
          </ProgressRing>
        </Animated.View>
      </View>

      <View style={styles.quickRow}>
        {steps.map((s) => (
          <Pressable
            key={s}
            testID={`quick-add-${habit.id}-${s}`}
            onPress={() => onQuick(s)}
            style={[styles.stepBtn, { backgroundColor: colors.brandTertiary }]}
          >
            <Text style={[styles.stepText, { color: colors.onBrandTertiary }]}>
              +{s}
              {unit}
            </Text>
          </Pressable>
        ))}
        <View style={{ flex: 1 }} />
        <Pressable
          testID={`manual-log-${habit.id}`}
          onPress={onManual}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceTertiary }]}
        >
          <Ionicons name="create-outline" size={18} color={colors.onSurface} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 26 },
  info: { flex: 1 },
  name: { fontFamily: fonts.displayBold, fontSize: 17 },
  progressText: { fontFamily: fonts.semiBold, fontSize: 13, marginTop: 2 },
  ringText: { fontFamily: fonts.displayBold, fontSize: 12 },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  stepBtn: {
    height: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontFamily: fonts.displayBold, fontSize: 14 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
