import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

interface Props {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

export default function ReportSuccess({ visible, message, onDismiss }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onDismiss}
          activeOpacity={1}
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✅</Text>
          </View>

          <Text style={styles.title}>Report submitted</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              🔒 Your personal information was automatically removed before this
              report was stored.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={onDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    marginBottom: 4,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.safeLight + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
    width: "100%",
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  doneButton: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  doneButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
