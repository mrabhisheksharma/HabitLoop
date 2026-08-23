import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

import { useTheme, spacing, radius, fonts } from "@/src/theme";

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  color?: string;
  testID?: string;
}

export function Chip({ label, active, onPress, color, testID }: ChipProps) {
  const { colors } = useTheme();
  const accent = color ?? colors.brandPrimary;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? accent : colors.surfaceTertiary,
          borderColor: active ? accent : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: active ? "#FFFFFF" : colors.onSurfaceTertiary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontFamily: fonts.bold, fontSize: 13 },
});
