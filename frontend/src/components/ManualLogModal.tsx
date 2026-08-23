import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { useTheme, spacing, radius, fonts } from "@/src/theme";
import { TrackingType } from "@/src/types";
import { unitLabel } from "@/src/utils/format";

interface Props {
  visible: boolean;
  title: string;
  initial: number;
  type: TrackingType;
  onClose: () => void;
  onSubmit: (value: number) => void;
}

export function ManualLogModal({
  visible,
  title,
  initial,
  type,
  onClose,
  onSubmit,
}: Props) {
  const { colors } = useTheme();
  const [text, setText] = useState(String(initial || ""));

  useEffect(() => {
    if (visible) setText(initial ? String(initial) : "");
  }, [visible, initial]);

  const handleSave = () => {
    const parsed = parseInt(text, 10);
    onSubmit(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          testID="manual-log-modal"
          style={[styles.card, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {title}
          </Text>
          <Text style={[styles.hint, { color: colors.onSurfaceTertiary }]}>
            Enter exact value in {unitLabel(type)}
          </Text>
          <TextInput
            testID="manual-log-input"
            value={text}
            onChangeText={setText}
            keyboardType="number-pad"
            autoFocus
            placeholder="0"
            placeholderTextColor={colors.onSurfaceTertiary}
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceTertiary,
                color: colors.onSurface,
              },
            ]}
          />
          <View style={styles.row}>
            <Pressable
              testID="manual-log-cancel"
              onPress={onClose}
              style={[styles.btn, { backgroundColor: colors.surfaceTertiary }]}
            >
              <Text style={[styles.btnText, { color: colors.onSurface }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              testID="manual-log-save"
              onPress={handleSave}
              style={[styles.btn, { backgroundColor: colors.brandPrimary }]}
            >
              <Text style={[styles.btnText, { color: colors.onBrandPrimary }]}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  title: { fontFamily: fonts.displayBold, fontSize: 20 },
  hint: { fontFamily: fonts.regular, fontSize: 14, marginTop: spacing.xs },
  input: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 60,
    fontFamily: fonts.displayBold,
    fontSize: 28,
    textAlign: "center",
  },
  row: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontFamily: fonts.displayBold, fontSize: 16 },
});
