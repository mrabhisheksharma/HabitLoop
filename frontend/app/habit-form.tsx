import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, spacing, radius, fonts } from "@/src/theme";
import { useHabits } from "@/src/store/HabitStore";
import { useToast } from "@/src/components/Toast";
import {
  EMOJI_CHOICES,
  CATEGORY_PRESETS,
  categoryColor,
} from "@/src/constants";
import { TrackingType } from "@/src/types";
import { haptic } from "@/src/utils/haptics";

export default function HabitFormScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { show } = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getHabit, addHabit, updateHabit } = useHabits();

  const existing = id ? getHabit(id) : undefined;
  const editing = !!existing;

  const presetForExisting =
    existing && CATEGORY_PRESETS.includes(existing.category)
      ? existing.category
      : existing
        ? "Custom"
        : "Fitness";

  const [name, setName] = useState(existing?.name ?? "");
  const [icon, setIcon] = useState(existing?.icon ?? EMOJI_CHOICES[0]);
  const [trackingType, setTrackingType] = useState<TrackingType>(
    existing?.tracking_type ?? "reps",
  );
  const [target, setTarget] = useState(
    existing?.target_value ? String(existing.target_value) : "",
  );
  const [category, setCategory] = useState(presetForExisting);
  const [customCategory, setCustomCategory] = useState(
    existing && !CATEGORY_PRESETS.includes(existing.category)
      ? existing.category
      : "",
  );
  const [error, setError] = useState("");

  const finalCategory =
    category === "Custom" ? customCategory.trim() || "Custom" : category;

  const handleSave = () => {
    if (!name.trim()) {
      setError("Please enter a habit name");
      return;
    }
    const parsedTarget = parseInt(target, 10);
    const target_value =
      Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : null;

    const payload = {
      name: name.trim(),
      icon,
      category: finalCategory,
      tracking_type: trackingType,
      target_value,
      color: categoryColor(finalCategory),
    };

    haptic.success();
    if (editing && existing) {
      updateHabit(existing.id, payload);
      show(`${payload.name} updated`, "success");
    } else {
      addHabit(payload);
      show(`${payload.name} created 🎉`, "success");
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>
          {editing ? "Edit habit" : "New habit"}
        </Text>
        <Pressable
          testID="form-close"
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Ionicons name="close" size={22} color={colors.onSurface} />
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={90}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <Text style={[styles.label, { color: colors.onSurface }]}>Name</Text>
        <TextInput
          testID="form-name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (error) setError("");
          }}
          placeholder="e.g. Morning Run"
          placeholderTextColor={colors.onSurfaceTertiary}
          style={[
            styles.input,
            { backgroundColor: colors.surfaceSecondary, color: colors.onSurface, borderColor: error ? colors.error : colors.border },
          ]}
        />
        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}

        {/* Emoji */}
        <Text style={[styles.label, { color: colors.onSurface }]}>Icon</Text>
        <View style={styles.emojiGrid}>
          {EMOJI_CHOICES.map((e) => (
            <Pressable
              key={e}
              testID={`emoji-${e}`}
              onPress={() => setIcon(e)}
              style={[
                styles.emojiCell,
                {
                  backgroundColor:
                    icon === e ? colors.brandPrimary : colors.surfaceSecondary,
                  borderColor: icon === e ? colors.brandPrimary : colors.border,
                },
              ]}
            >
              <Text style={{ fontSize: 24 }}>{e}</Text>
            </Pressable>
          ))}
        </View>

        {/* Tracking type */}
        <Text style={[styles.label, { color: colors.onSurface }]}>Tracking type</Text>
        <View style={[styles.segment, { backgroundColor: colors.surfaceTertiary }]}>
          {(["duration", "reps"] as const).map((t) => (
            <Pressable
              key={t}
              testID={`type-${t}`}
              onPress={() => setTrackingType(t)}
              style={[
                styles.segmentBtn,
                trackingType === t && { backgroundColor: colors.brandPrimary },
              ]}
            >
              <Ionicons
                name={t === "duration" ? "time-outline" : "repeat-outline"}
                size={18}
                color={trackingType === t ? colors.onBrandPrimary : colors.onSurfaceTertiary}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: trackingType === t ? colors.onBrandPrimary : colors.onSurfaceTertiary },
                ]}
              >
                {t === "duration" ? "Duration (min)" : "Reps / Count"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Target */}
        <Text style={[styles.label, { color: colors.onSurface }]}>
          Daily target{" "}
          <Text style={{ color: colors.onSurfaceTertiary, fontFamily: fonts.semiBold }}>
            (optional)
          </Text>
        </Text>
        <View style={styles.targetRow}>
          <TextInput
            testID="form-target"
            value={target}
            onChangeText={setTarget}
            keyboardType="number-pad"
            placeholder={trackingType === "duration" ? "30" : "50"}
            placeholderTextColor={colors.onSurfaceTertiary}
            style={[
              styles.input,
              { flex: 1, backgroundColor: colors.surfaceSecondary, color: colors.onSurface, borderColor: colors.border },
            ]}
          />
          <View style={[styles.unitBadge, { backgroundColor: colors.surfaceTertiary }]}>
            <Text style={[styles.unitText, { color: colors.onSurfaceTertiary }]}>
              {trackingType === "duration" ? "minutes" : "count"}
            </Text>
          </View>
        </View>

        {/* Category */}
        <Text style={[styles.label, { color: colors.onSurface }]}>Category</Text>
        <View style={styles.catWrap}>
          {CATEGORY_PRESETS.map((c) => (
            <Pressable
              key={c}
              testID={`category-${c}`}
              onPress={() => setCategory(c)}
              style={[
                styles.catChip,
                {
                  backgroundColor: category === c ? categoryColor(c) : colors.surfaceSecondary,
                  borderColor: category === c ? categoryColor(c) : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.catChipText,
                  { color: category === c ? "#FFFFFF" : colors.onSurface },
                ]}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
        {category === "Custom" ? (
          <TextInput
            testID="form-custom-category"
            value={customCategory}
            onChangeText={setCustomCategory}
            placeholder="Type a custom category"
            placeholderTextColor={colors.onSurfaceTertiary}
            style={[
              styles.input,
              { marginTop: spacing.md, backgroundColor: colors.surfaceSecondary, color: colors.onSurface, borderColor: colors.border },
            ]}
          />
        ) : null}
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
        >
          <Pressable
            testID="form-save"
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }]}
          >
            <Ionicons name="checkmark" size={22} color={colors.onBrandPrimary} />
            <Text style={[styles.saveText, { color: colors.onBrandPrimary }]}>
              {editing ? "Save changes" : "Create habit"}
            </Text>
          </Pressable>
        </View>
      </KeyboardStickyView>
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
    paddingBottom: spacing.md,
  },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 26 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  errorText: { fontFamily: fonts.semiBold, fontSize: 13, marginTop: spacing.xs },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  emojiCell: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  segment: { flexDirection: "row", borderRadius: radius.md, padding: 4, gap: 4 },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 46,
    borderRadius: radius.sm,
  },
  segmentText: { fontFamily: fonts.bold, fontSize: 13 },
  targetRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  unitBadge: {
    height: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  unitText: { fontFamily: fonts.bold, fontSize: 14 },
  catWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  catChip: {
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  catChipText: { fontFamily: fonts.bold, fontSize: 14 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 54,
    borderRadius: radius.md,
  },
  saveText: { fontFamily: fonts.displayExtraBold, fontSize: 17 },
});
