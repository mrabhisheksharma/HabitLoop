import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, spacing, radius, fonts } from "@/src/theme";
import { useHabits } from "@/src/store/HabitStore";
import { Chip } from "@/src/components/Chip";
import { EmptyState } from "@/src/components/EmptyState";
import { useToast } from "@/src/components/Toast";
import { targetLabel } from "@/src/utils/format";
import { categoryColor } from "@/src/constants";
import { haptic } from "@/src/utils/haptics";
import { Habit } from "@/src/types";

export default function HabitsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { show } = useToast();
  const { activeHabits, archivedHabits, archiveHabit, unarchiveHabit } =
    useHabits();
  const [filter, setFilter] = useState("All");

  const categories = useMemo(() => {
    const set = new Set(activeHabits.map((h) => h.category));
    return ["All", ...Array.from(set)];
  }, [activeHabits]);

  const filtered =
    filter === "All"
      ? activeHabits
      : activeHabits.filter((h) => h.category === filter);

  const ManageCard = ({ habit }: { habit: Habit }) => (
    <Pressable
      testID={`manage-card-${habit.id}`}
      onPress={() => router.push(`/habit/${habit.id}`)}
      style={[
        styles.card,
        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardTop}>
        <View
          style={[styles.emojiCircle, { backgroundColor: colors.brandTertiary }]}
        >
          <Text style={styles.emoji}>{habit.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.catDot,
                { backgroundColor: categoryColor(habit.category) },
              ]}
            />
            <Text style={[styles.meta, { color: colors.onSurfaceTertiary }]}>
              {habit.category} · {targetLabel(habit.target_value, habit.tracking_type)}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.onSurfaceTertiary}
        />
      </View>
      <View style={styles.actionRow}>
        <Pressable
          testID={`edit-${habit.id}`}
          onPress={() => router.push(`/habit-form?id=${habit.id}`)}
          style={[styles.actionBtn, { backgroundColor: colors.surfaceTertiary }]}
        >
          <Ionicons name="pencil" size={15} color={colors.onSurface} />
          <Text style={[styles.actionText, { color: colors.onSurface }]}>
            Edit
          </Text>
        </Pressable>
        <Pressable
          testID={`archive-${habit.id}`}
          onPress={() => {
            haptic.warning();
            archiveHabit(habit.id);
            show(`${habit.name} archived`, "warning");
          }}
          style={[styles.actionBtn, { backgroundColor: colors.surfaceTertiary }]}
        >
          <Ionicons name="archive-outline" size={15} color={colors.onSurface} />
          <Text style={[styles.actionText, { color: colors.onSurface }]}>
            Archive
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Habits</Text>
        <Pressable
          testID="habits-add-btn"
          onPress={() => {
            haptic.medium();
            router.push("/habit-form");
          }}
          style={[styles.addBtn, { backgroundColor: colors.brandPrimary }]}
        >
          <Ionicons name="add" size={22} color={colors.onBrandPrimary} />
        </Pressable>
      </View>

      {activeHabits.length > 0 ? (
        <View style={styles.chipRowWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {categories.map((c) => (
              <Chip
                key={c}
                testID={`filter-${c}`}
                label={c}
                active={filter === c}
                onPress={() => setFilter(c)}
                color={c === "All" ? colors.brandPrimary : categoryColor(c)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {activeHabits.length === 0 && archivedHabits.length === 0 ? (
        <EmptyState
          testID="habits-empty"
          icon="clipboard-outline"
          title="Your routine is a blank slate"
          subtitle="Create habits to track daily. Tap the + to add your first one."
          ctaLabel="Add a habit"
          onPressCta={() => router.push("/habit-form")}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((h) => (
            <ManageCard key={h.id} habit={h} />
          ))}

          {archivedHabits.length > 0 ? (
            <>
              <Text
                style={[styles.sectionTitle, { color: colors.onSurfaceTertiary }]}
              >
                ARCHIVED
              </Text>
              {archivedHabits.map((h) => (
                <View
                  key={h.id}
                  style={[
                    styles.archivedCard,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={styles.emojiSmall}>{h.icon}</Text>
                  <Text
                    style={[styles.name, { color: colors.onSurfaceTertiary, flex: 1 }]}
                    numberOfLines={1}
                  >
                    {h.name}
                  </Text>
                  <Pressable
                    testID={`unarchive-${h.id}`}
                    onPress={() => {
                      unarchiveHabit(h.id);
                      show(`${h.name} restored`, "success");
                    }}
                    style={[
                      styles.restoreBtn,
                      { backgroundColor: colors.brandTertiary },
                    ]}
                  >
                    <Text
                      style={[styles.actionText, { color: colors.onBrandTertiary }]}
                    >
                      Restore
                    </Text>
                  </Pressable>
                </View>
              ))}
            </>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 34 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRowWrap: { height: 56, justifyContent: "center" },
  chipRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 24 },
  emojiSmall: { fontSize: 22 },
  name: { fontFamily: fonts.displayBold, fontSize: 17 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 3 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  meta: { fontFamily: fonts.semiBold, fontSize: 13 },
  actionRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    height: 38,
    borderRadius: radius.pill,
  },
  actionText: { fontFamily: fonts.bold, fontSize: 13 },
  sectionTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  archivedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  restoreBtn: {
    paddingHorizontal: spacing.lg,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
