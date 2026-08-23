import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, spacing, radius, fonts } from "@/src/theme";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  testID?: string;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  ctaLabel,
  onPressCta,
  testID,
}: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container} testID={testID}>
      <View
        style={[styles.iconBubble, { backgroundColor: colors.brandTertiary }]}
      >
        <Ionicons name={icon} size={44} color={colors.brandPrimary} />
      </View>
      <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.onSurfaceTertiary }]}>
        {subtitle}
      </Text>
      {ctaLabel && onPressCta ? (
        <Pressable
          testID="empty-state-cta"
          onPress={onPressCta}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: colors.brandPrimary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name="add" size={20} color={colors.onBrandPrimary} />
          <Text style={[styles.ctaText, { color: colors.onBrandPrimary }]}>
            {ctaLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  iconBubble: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.xl,
  },
  ctaText: { fontFamily: fonts.displayBold, fontSize: 16 },
});
