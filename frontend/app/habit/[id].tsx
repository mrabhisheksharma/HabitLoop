import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";

import { useTheme, spacing, radius, fonts } from "@/src/theme";
import { useHabits } from "@/src/store/HabitStore";
import { ProgressRing } from "@/src/components/ProgressRing";
import { Heatmap } from "@/src/components/Heatmap";
import { BarChart, BarDatum } from "@/src/components/BarChart";
import { ManualLogModal } from "@/src/components/ManualLogModal";
import { quickSteps } from "@/src/components/HabitCard";
import { useToast } from "@/src/components/Toast";
import { todayStr, lastNDays, prettyDate } from "@/src/utils/date";
import {
  completionRatio,
  currentStreak,
  isDayComplete,
  longestStreak,
  valueMap,
} from "@/src/utils/streaks";
import { formatValue, targetLabel } from "@/src/utils/format";
import { categoryColor } from "@/src/constants";
import { haptic } from "@/src/utils/haptics";

export default function HabitDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { show } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getHabit,
    logsForHabit,
    getValue,
    incrementLog,
    setLog,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
  } = useHabits();

  const habit = getHabit(id);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [manualOpen, setManualOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [range, setRange] = useState<7 | 30>(7);

  const logs = logsForHabit(id);
  const map = useMemo(() => valueMap(logs), [logs]);

  if (!habit) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.onSurfaceTertiary, fontFamily: fonts.bold }}>
          Habit not found
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.brandPrimary, fontFamily: fonts.displayBold }}>
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const cur = currentStreak(logs, habit.target_value);
  const longest = longestStreak(logs, habit.target_value);
  const selValue = getValue(id, selectedDate);
  const selRatio = completionRatio(selValue, habit.target_value);
  const selDone = isDayComplete(selValue, habit.target_value);
  const steps = quickSteps(habit);
  const unit = habit.tracking_type === "duration" ? "m" : "";

  const dateStrip = lastNDays(14);
  const chartData: BarDatum[] = lastNDays(range).map((d) => ({
    label: dayjs(d).format("D"),
    value: map[d] ?? 0,
  }));

  const onQuick = (delta: number) => {
    const before = getValue(id, selectedDate);
    incrementLog(id, selectedDate, delta);
    if (
      isDayComplete(before + delta, habit.target_value) &&
      !isDayComplete(before, habit.target_value)
    ) {
      haptic.success();
      show("Target reached! 🎉", "success");
    } else {
      haptic.light();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          testID="detail-back"
          onPress={() => router.back()}
          style={[styles.headerBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          testID="detail-edit"
          onPress={() => router.push(`/habit-form?id=${habit.id}`)}
          style={[styles.headerBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Ionicons name="pencil" size={19} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={styles.identity}>
          <View
            style={[styles.emojiBig, { backgroundColor: colors.brandTertiary }]}
          >
            <Text style={{ fontSize: 40 }}>{habit.icon}</Text>
          </View>
          <Text style={[styles.name, { color: colors.onSurface }]}>
            {habit.name}
          </Text>
          <View style={styles.tagRow}>
            <View
              style={[styles.catChip, { backgroundColor: categoryColor(habit.category) + "22" }]}
            >
              <View
                style={[styles.catDot, { backgroundColor: categoryColor(habit.category) }]}
              />
              <Text style={[styles.catText, { color: colors.onSurface }]}>
                {habit.category}
              </Text>
            </View>
            <Text style={[styles.targetText, { color: colors.onSurfaceTertiary }]}>
              Goal: {targetLabel(habit.target_value, habit.tracking_type)}
            </Text>
          </View>
          {habit.archived ? (
            <View style={[styles.archivedBadge, { backgroundColor: colors.surfaceTertiary }]}>
              <Ionicons name="archive" size={13} color={colors.onSurfaceTertiary} />
              <Text style={[styles.archivedText, { color: colors.onSurfaceTertiary }]}>
                Archived
              </Text>
            </View>
          ) : null}
        </View>

        {/* Streak badges */}
        <View style={styles.streakRow}>
          <View style={[styles.streakBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Ionicons name="flame" size={24} color={colors.brandPrimary} />
            <Text style={[styles.streakNum, { color: colors.onSurface }]}>{cur}</Text>
            <Text style={[styles.streakLabel, { color: colors.onSurfaceTertiary }]}>
              Current streak
            </Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Ionicons name="trophy" size={22} color={colors.warning} />
            <Text style={[styles.streakNum, { color: colors.onSurface }]}>{longest}</Text>
            <Text style={[styles.streakLabel, { color: colors.onSurfaceTertiary }]}>
              Longest streak
            </Text>
          </View>
        </View>

        {/* Logging for a date (with backdating) */}
        <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Log progress</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStrip}
          >
            {dateStrip.map((d) => {
              const active = d === selectedDate;
              const dayDone = isDayComplete(map[d], habit.target_value);
              return (
                <Pressable
                  key={d}
                  testID={`date-${d}`}
                  onPress={() => setSelectedDate(d)}
                  style={[
                    styles.dateCell,
                    {
                      backgroundColor: active ? colors.brandPrimary : colors.surfaceTertiary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dateDow,
                      { color: active ? colors.onBrandPrimary : colors.onSurfaceTertiary },
                    ]}
                  >
                    {dayjs(d).format("dd")}
                  </Text>
                  <Text
                    style={[
                      styles.dateNum,
                      { color: active ? colors.onBrandPrimary : colors.onSurface },
                    ]}
                  >
                    {dayjs(d).format("D")}
                  </Text>
                  {dayDone ? (
                    <View
                      style={[
                        styles.dateDoneDot,
                        { backgroundColor: active ? colors.onBrandPrimary : colors.brandPrimary },
                      ]}
                    />
                  ) : (
                    <View style={styles.dateDoneDotPlaceholder} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.selDateLabel, { color: colors.onSurfaceTertiary }]}>
            {prettyDate(selectedDate)}
          </Text>

          <View style={styles.logRow}>
            <ProgressRing
              size={80}
              strokeWidth={9}
              progress={selRatio}
              color={colors.brandPrimary}
              trackColor={colors.surfaceTertiary}
            >
              {selDone ? (
                <Ionicons name="checkmark" size={34} color={colors.brandPrimary} />
              ) : (
                <Text style={[styles.ringPct, { color: colors.onSurface }]}>
                  {Math.round(selRatio * 100)}%
                </Text>
              )}
            </ProgressRing>
            <View style={{ flex: 1, marginLeft: spacing.lg }}>
              <Text style={[styles.logValue, { color: colors.onSurface }]}>
                {formatValue(selValue, habit.tracking_type)}
              </Text>
              <Text style={[styles.logTarget, { color: colors.onSurfaceTertiary }]}>
                of {targetLabel(habit.target_value, habit.tracking_type)}
              </Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            {steps.map((s) => (
              <Pressable
                key={s}
                testID={`detail-quick-${s}`}
                onPress={() => onQuick(s)}
                style={[styles.stepBtn, { backgroundColor: colors.brandTertiary }]}
              >
                <Text style={[styles.stepText, { color: colors.onBrandTertiary }]}>
                  +{s}
                  {unit}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.logActions}>
            <Pressable
              testID="detail-manual"
              onPress={() => setManualOpen(true)}
              style={[styles.logActionBtn, { backgroundColor: colors.surfaceTertiary }]}
            >
              <Ionicons name="create-outline" size={17} color={colors.onSurface} />
              <Text style={[styles.logActionText, { color: colors.onSurface }]}>
                Set exact value
              </Text>
            </Pressable>
            <Pressable
              testID="detail-clear"
              onPress={() => {
                setLog(id, selectedDate, 0);
                haptic.light();
              }}
              style={[styles.logActionBtn, { backgroundColor: colors.surfaceTertiary }]}
            >
              <Ionicons name="refresh-outline" size={17} color={colors.onSurface} />
              <Text style={[styles.logActionText, { color: colors.onSurface }]}>
                Clear
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Heatmap */}
        <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Consistency</Text>
          <Heatmap values={map} target={habit.target_value} />
        </View>

        {/* Chart */}
        <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.cardTitle, { color: colors.onSurface, marginBottom: 0 }]}>
              History
            </Text>
            <View style={[styles.rangeToggle, { backgroundColor: colors.surfaceTertiary }]}>
              {([7, 30] as const).map((r) => (
                <Pressable
                  key={r}
                  testID={`range-${r}`}
                  onPress={() => setRange(r)}
                  style={[
                    styles.rangeBtn,
                    range === r && { backgroundColor: colors.brandPrimary },
                  ]}
                >
                  <Text
                    style={[
                      styles.rangeText,
                      { color: range === r ? colors.onBrandPrimary : colors.onSurfaceTertiary },
                    ]}
                  >
                    {r}d
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <BarChart data={chartData} color={colors.brandSecondary} height={120} />
        </View>

        {/* Manage actions */}
        <View style={styles.manageRow}>
          {habit.archived ? (
            <Pressable
              testID="detail-unarchive"
              onPress={() => {
                unarchiveHabit(id);
                show(`${habit.name} restored`, "success");
              }}
              style={[styles.manageBtn, { backgroundColor: colors.brandTertiary }]}
            >
              <Ionicons name="refresh" size={18} color={colors.onBrandTertiary} />
              <Text style={[styles.manageText, { color: colors.onBrandTertiary }]}>
                Restore
              </Text>
            </Pressable>
          ) : (
            <Pressable
              testID="detail-archive"
              onPress={() => {
                haptic.warning();
                archiveHabit(id);
                show(`${habit.name} archived`, "warning");
              }}
              style={[styles.manageBtn, { backgroundColor: colors.surfaceTertiary }]}
            >
              <Ionicons name="archive-outline" size={18} color={colors.onSurface} />
              <Text style={[styles.manageText, { color: colors.onSurface }]}>
                Archive
              </Text>
            </Pressable>
          )}
          <Pressable
            testID="detail-delete"
            onPress={() => setConfirmDelete(true)}
            style={[styles.manageBtn, { backgroundColor: colors.error + "18" }]}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={[styles.manageText, { color: colors.error }]}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ManualLogModal
        visible={manualOpen}
        title={`Log ${habit.name}`}
        initial={selValue}
        type={habit.tracking_type}
        onClose={() => setManualOpen(false)}
        onSubmit={(v) => {
          const before = getValue(id, selectedDate);
          setLog(id, selectedDate, v);
          if (
            isDayComplete(v, habit.target_value) &&
            !isDayComplete(before, habit.target_value)
          ) {
            haptic.success();
            show("Target reached! 🎉", "success");
          }
        }}
      />

      {/* Delete confirm */}
      <Modal visible={confirmDelete} transparent animationType="fade" onRequestClose={() => setConfirmDelete(false)}>
        <View style={styles.confirmBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setConfirmDelete(false)} />
          <View testID="delete-confirm" style={[styles.confirmCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.confirmTitle, { color: colors.onSurface }]}>
              Delete {habit.name}?
            </Text>
            <Text style={[styles.confirmHint, { color: colors.onSurfaceTertiary }]}>
              This permanently removes the habit and all its history. To keep history, archive instead.
            </Text>
            <View style={styles.confirmRow}>
              <Pressable
                testID="delete-cancel"
                onPress={() => setConfirmDelete(false)}
                style={[styles.confirmBtn, { backgroundColor: colors.surfaceTertiary }]}
              >
                <Text style={[styles.confirmBtnText, { color: colors.onSurface }]}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="delete-confirm-btn"
                onPress={() => {
                  deleteHabit(id);
                  setConfirmDelete(false);
                  show("Habit deleted", "warning");
                  router.back();
                }}
                style={[styles.confirmBtn, { backgroundColor: colors.error }]}
              >
                <Text style={[styles.confirmBtnText, { color: "#FFFFFF" }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  identity: { alignItems: "center", marginBottom: spacing.xl },
  emojiBig: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  name: { fontFamily: fonts.displayExtraBold, fontSize: 26, textAlign: "center" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catText: { fontFamily: fonts.bold, fontSize: 13 },
  targetText: { fontFamily: fonts.semiBold, fontSize: 13 },
  archivedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  archivedText: { fontFamily: fonts.bold, fontSize: 12 },
  streakRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  streakBadge: {
    flex: 1,
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.lg,
    gap: 2,
  },
  streakNum: { fontFamily: fonts.displayExtraBold, fontSize: 28 },
  streakLabel: { fontFamily: fonts.semiBold, fontSize: 12 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: { fontFamily: fonts.displayBold, fontSize: 17, marginBottom: spacing.md },
  dateStrip: { gap: spacing.sm, paddingBottom: spacing.xs },
  dateCell: {
    width: 46,
    borderRadius: radius.md,
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: 2,
  },
  dateDow: { fontFamily: fonts.semiBold, fontSize: 11 },
  dateNum: { fontFamily: fonts.displayBold, fontSize: 16 },
  dateDoneDot: { width: 5, height: 5, borderRadius: 3 },
  dateDoneDotPlaceholder: { width: 5, height: 5 },
  selDateLabel: { fontFamily: fonts.bold, fontSize: 13, marginTop: spacing.md },
  logRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.md },
  ringPct: { fontFamily: fonts.displayBold, fontSize: 16 },
  logValue: { fontFamily: fonts.displayExtraBold, fontSize: 30 },
  logTarget: { fontFamily: fonts.semiBold, fontSize: 14 },
  quickRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  stepBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontFamily: fonts.displayBold, fontSize: 15 },
  logActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  logActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 44,
    borderRadius: radius.md,
  },
  logActionText: { fontFamily: fonts.bold, fontSize: 13 },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  rangeToggle: { flexDirection: "row", borderRadius: radius.pill, padding: 3 },
  rangeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  rangeText: { fontFamily: fonts.bold, fontSize: 12 },
  manageRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xs },
  manageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 50,
    borderRadius: radius.md,
  },
  manageText: { fontFamily: fonts.displayBold, fontSize: 14 },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  confirmCard: { width: "100%", borderRadius: radius.lg, padding: spacing.xl },
  confirmTitle: { fontFamily: fonts.displayBold, fontSize: 20 },
  confirmHint: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
  confirmRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
  confirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: { fontFamily: fonts.displayBold, fontSize: 16 },
});
