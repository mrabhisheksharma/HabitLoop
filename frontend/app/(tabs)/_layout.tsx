import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useTheme, spacing, radius, fonts } from "@/src/theme";
import { haptic } from "@/src/utils/haptics";

const TAB_META: Record<
  string,
  {
    label: string;
    active: keyof typeof Ionicons.glyphMap;
    inactive: keyof typeof Ionicons.glyphMap;
  }
> = {
  index: { label: "Today", active: "today", inactive: "today-outline" },
  habits: { label: "Habits", active: "albums", inactive: "albums-outline" },
  stats: {
    label: "Stats",
    active: "stats-chart",
    inactive: "stats-chart-outline",
  },
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom + spacing.sm,
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const focused = state.index === index;
        const onPress = () => {
          haptic.selection();
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable
            key={route.key}
            testID={`tab-${route.name}`}
            onPress={onPress}
            style={styles.tab}
          >
            <View
              style={[
                styles.pill,
                focused && { backgroundColor: colors.brandTertiary },
              ]}
            >
              <Ionicons
                name={focused ? meta.active : meta.inactive}
                size={22}
                color={focused ? colors.brandPrimary : colors.onSurfaceTertiary}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: focused ? colors.onSurface : colors.onSurfaceTertiary,
                  fontFamily: focused ? fonts.displayBold : fonts.semiBold,
                },
              ]}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="habits" options={{ title: "Habits" }} />
      <Tabs.Screen name="stats" options={{ title: "Stats" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
  },
  tab: { flex: 1, alignItems: "center", gap: 2 },
  pill: {
    width: 56,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 11 },
});
