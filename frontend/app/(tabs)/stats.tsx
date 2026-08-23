import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import dayjs from "dayjs";

import { useTheme, spacing, radius, fonts } from "@/src/theme";
import { useHabits } from "@/src/store/HabitStore";
import { ProgressRing } from "@/src/components/ProgressRing";
import { BarChart, BarDatum } from "@/src/components/BarChart";
import { EmptyState } from "@/src/components/EmptyState";
import { currentWeekDays, isFuture } from "@/src/utils/date";
import { isDayComplete } from "@/src/utils/streaks";
import { categoryColor } from "@/src/constants";

export default function StatsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { activeHabits, getValue } = useHabits();

  const weekDays = currentWeekDays();
  const elapsedDays = weekDays.filter((d) => !isFuture(d));

  const { rate, perDay, perHabit } = useMemo(() => {
    let completed = 0;
    const total = activeHabits.length * Math.max(1, elapsedDays.length);

    const perDay: BarDatum[] = weekDays.map((d) => {
      const future = isFuture(d);
      const count = future
        ? 0
        : activeHabits.filter((h) =>
            isDayComplete(getValue(h.id, d), h.target_value),
          ).length;
      return { label: dayjs(d).format("dd"), value: count };
    });

    const perHabit = activeHabits
      .map((h) => {
        const done = elapsedDays.filter((d) =>
          isDayComplete(getValue(h.id, d), h.target_value),
        ).length;
        completed += done;
        return {
          habit: h,
          done,
          total: elapsedDays.length,
          ratio: elapsedDays.length ? done / elapsedDays.length : 0,
        };
      })
      .sort((a, b) => b.ratio - a.ratio);

    return { rate: total ? completed / total : 0, perDay, perHabit };
  }, [activeHabits, elapsedDays, weekDays, getValue]);

  const statusFor = (ratio: number) => {
    if (ratio >= 0.7) return { label: "On track", color: colors.brandPrimary };
    if (ratio >= 0.4) return { label: "Keeping up", color: colors.info };
    return { label: "Slipping", color: colors.onSurfaceTertiary };
  };

  if (activeHabits.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Stats</Text>
        </View>
        <EmptyState
          testID="stats-empty"
          icon="bar-chart-outline"
          title="Log data to see your garden grow!"
          subtitle="Add habits and start logging. Your streaks and trends will appear here."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Stats</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceTertiary }]}>
          This week&apos;s progress
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly completion rate */}
        <View
          style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
        >
          <View style={styles.rateRow}>
            <ProgressRing
              size={112}
              strokeWidth={12}
              progress={rate}
              color={colors.brandPrimary}
              trackColor={colors.surfaceTertiary}
            >
              <Text style={[styles.ratePct, { color: colors.onSurface }]}>
                {Math.round(rate * 100)}%
              </Text>
            </ProgressRing>
            <View style={{ flex: 1, marginLeft: spacing.lg }}>
              <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
                Weekly completion
              </Text>
              <Text style={[styles.cardHint, { color: colors.onSurfaceTertiary }]}>
                Across {activeHabits.length} habit
                {activeHabits.length > 1 ? "s" : ""} over{" "}
                {elapsedDays.length} day{elapsedDays.length > 1 ? "s" : ""} this week.
              </Text>
            </View>
          </View>
        </View>

        {/* Daily completed bars */}
        <View
          style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
        >
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
            Habits completed per day
          </Text>
          <BarChart data={perDay} color={colors.brandSecondary} height={110} />
        </View>

        {/* Per-habit comparison */}
        <Text style={[styles.sectionTitle, { color: colors.onSurfaceTertiary }]}>
          PER-HABIT THIS WEEK
        </Text>
        {perHabit.map(({ habit, done, total, ratio }) => {
          const status = statusFor(ratio);
          return (
            <View
              key={habit.id}
              testID={`stat-habit-${habit.id}`}
              style={[
                styles.habitRow,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
            >
              <View
                style={[styles.emojiCircle, { backgroundColor: colors.brandTertiary }]}
              >
                <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.habitTopRow}>
                  <Text
                    style={[styles.habitName, { color: colors.onSurface }]}
                    numberOfLines={1}
                  >
                    {habit.name}
                  </Text>
                  <Text style={[styles.doneText, { color: colors.onSurfaceTertiary }]}>
                    {done}/{total}
                  </Text>
                </View>
                <View
                  style={[styles.barTrack, { backgroundColor: colors.surfaceTertiary }]}
                >
                  <View
                    style={{
                      width: `${Math.round(ratio * 100)}%`,
                      height: "100%",
                      borderRadius: radius.pill,
                      backgroundColor: categoryColor(habit.category),
                    }}
                  />
                </View>
              </View>
              <View style={styles.statusWrap}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 34 },
  subtitle: { fontFamily: fonts.semiBold, fontSize: 14, marginTop: 2 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  rateRow: { flexDirection: "row", alignItems: "center" },
  ratePct: { fontFamily: fonts.displayExtraBold, fontSize: 24 },
  cardTitle: { fontFamily: fonts.displayBold, fontSize: 17, marginBottom: spacing.xs },
  cardHint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  sectionTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  emojiCircle: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  habitTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  habitName: { fontFamily: fonts.displayBold, fontSize: 15, flex: 1 },
  doneText: { fontFamily: fonts.bold, fontSize: 13 },
  barTrack: { height: 8, borderRadius: radius.pill, overflow: "hidden" },
  statusWrap: { alignItems: "center", gap: 3, width: 64 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: fonts.bold, fontSize: 11, textAlign: "center" },
});
