import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";

import { useTheme, spacing, radius, fonts } from "@/src/theme";
import { useHabits } from "@/src/store/HabitStore";
import { HabitCard } from "@/src/components/HabitCard";
import { EmptyState } from "@/src/components/EmptyState";
import { ManualLogModal } from "@/src/components/ManualLogModal";
import { useToast } from "@/src/components/Toast";
import { todayStr } from "@/src/utils/date";
import { isDayComplete } from "@/src/utils/streaks";
import { haptic } from "@/src/utils/haptics";
import { Habit } from "@/src/types";

export default function TodayScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { show } = useToast();
  const { activeHabits, getValue, incrementLog, setLog, loading } = useHabits();
  const [manualHabit, setManualHabit] = useState<Habit | null>(null);

  const today = todayStr();
  const doneCount = activeHabits.filter((h) =>
    isDayComplete(getValue(h.id, today), h.target_value),
  ).length;

  const handleQuick = (habit: Habit, delta: number) => {
    const before = getValue(habit.id, today);
    const after = before + delta;
    incrementLog(habit.id, today, delta);
    if (
      isDayComplete(after, habit.target_value) &&
      !isDayComplete(before, habit.target_value)
    ) {
      haptic.success();
      show(`${habit.name} done! 🎉`, "success");
    } else {
      haptic.light();
    }
  };

  const handleManualSave = (value: number) => {
    if (!manualHabit) return;
    const before = getValue(manualHabit.id, today);
    setLog(manualHabit.id, today, value);
    if (
      isDayComplete(value, manualHabit.target_value) &&
      !isDayComplete(before, manualHabit.target_value)
    ) {
      haptic.success();
      show(`${manualHabit.name} done! 🎉`, "success");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.date, { color: colors.onSurfaceTertiary }]}>
            {dayjs().format("dddd, MMM D").toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            Today
          </Text>
        </View>
        {activeHabits.length > 0 ? (
          <View
            style={[styles.summary, { backgroundColor: colors.brandTertiary }]}
          >
            <Ionicons
              name="flame"
              size={16}
              color={colors.onBrandTertiary}
            />
            <Text
              style={[styles.summaryText, { color: colors.onBrandTertiary }]}
            >
              {doneCount}/{activeHabits.length} done
            </Text>
          </View>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brandPrimary} size="large" />
        </View>
      ) : activeHabits.length === 0 ? (
        <EmptyState
          testID="today-empty"
          icon="leaf-outline"
          title="No habits yet!"
          subtitle="Let's start small. Add your first habit and begin your streak today."
          ctaLabel="Add your first habit"
          onPressCta={() => router.push("/habit-form")}
        />
      ) : (
        <FlatList
          data={activeHabits}
          keyExtractor={(h) => h.id}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + 140,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              value={getValue(item.id, today)}
              onQuick={(delta) => handleQuick(item, delta)}
              onManual={() => setManualHabit(item)}
              onOpen={() => router.push(`/habit/${item.id}`)}
            />
          )}
        />
      )}

      {activeHabits.length > 0 ? (
        <Pressable
          testID="today-add-fab"
          onPress={() => {
            haptic.medium();
            router.push("/habit-form");
          }}
          style={[
            styles.fab,
            {
              bottom: insets.bottom + 84,
              backgroundColor: colors.brandPrimary,
            },
          ]}
        >
          <Ionicons name="add" size={30} color={colors.onBrandPrimary} />
        </Pressable>
      ) : null}

      <ManualLogModal
        visible={!!manualHabit}
        title={manualHabit ? `Log ${manualHabit.name}` : ""}
        initial={manualHabit ? getValue(manualHabit.id, today) : 0}
        type={manualHabit?.tracking_type ?? "reps"}
        onClose={() => setManualHabit(null)}
        onSubmit={handleManualSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  date: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1 },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 34 },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  summaryText: { fontFamily: fonts.displayBold, fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  fab: {
    position: "absolute",
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
