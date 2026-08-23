import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, spacing, radius, fonts } from "@/src/theme";

type ToastType = "success" | "info" | "warning";
interface ToastState {
  msg: string;
  type: ToastType;
  id: number;
}

const ToastContext = createContext<{
  show: (msg: string, type?: ToastType) => void;
}>({ show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const show = useCallback((msg: string, type: ToastType = "success") => {
    setToast({ msg, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    translateY.setValue(-16);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, 1700);
    return () => clearTimeout(t);
  }, [toast, opacity, translateY]);

  const iconName =
    toast?.type === "warning"
      ? "alert-circle"
      : toast?.type === "info"
        ? "information-circle"
        : "checkmark-circle";
  const accent =
    toast?.type === "warning"
      ? colors.warning
      : toast?.type === "info"
        ? colors.info
        : colors.brandPrimary;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          testID="app-toast"
          style={[
            styles.toast,
            {
              top: insets.top + spacing.sm,
              backgroundColor: colors.surfaceInverse,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Ionicons name={iconName} size={20} color={accent} />
          <Text style={[styles.text, { color: colors.onSurfaceInverse }]}>
            {toast.msg}
          </Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: { fontFamily: fonts.bold, fontSize: 14, flexShrink: 1 },
});
