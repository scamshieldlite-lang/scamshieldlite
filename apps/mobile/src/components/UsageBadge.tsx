import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useScanUsage } from "@/hooks/useScanUsage";
import { Colors } from "@/constants/colors";

export default function UsageBadge() {
  const { usage } = useScanUsage();

  if (!usage) return null;

  const { scansRemaining, scanLimit, isGuest } = usage;
  const isLow = scansRemaining === 1; // ⚠️ 1 scan left
  const isExhausted = scansRemaining === 0; // 🛑 0 scans left

  // 🎨 Selection Logic based on your probable Constants
  const errorColor = Colors.scam || "#EF4444";
  const warningColor = Colors.suspicious || "#F59E0B";
  const okColor = Colors.primary || "#38BDF8";

  return (
    <View
      style={[
        styles.container,
        isExhausted && {
          borderColor: errorColor,
          backgroundColor: errorColor + "15",
        },
        isLow &&
          !isExhausted && {
            borderColor: warningColor,
            backgroundColor: warningColor + "15",
          },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: isExhausted
              ? errorColor
              : isLow
                ? warningColor
                : okColor,
          },
        ]}
      />
      <Text
        style={[
          styles.text,
          isExhausted && { color: errorColor },
          isLow && !isExhausted && { color: warningColor },
        ]}
      >
        {isExhausted
          ? "No scans remaining"
          : `${scansRemaining} of ${scanLimit} scans remaining`}
        {isGuest ? "  ·  Guest" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});
