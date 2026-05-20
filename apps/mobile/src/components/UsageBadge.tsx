import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useScanUsage } from "@/hooks/useScanUsage";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/colors";

export default function UsageBadge() {
  const { usage } = useScanUsage();
  const { authState } = useAuth();

  if (!usage) return null;

  // Use authState as source of truth for guest status
  // not the API response which may be stale
  const isGuest = authState !== "authenticated";

  const { scansRemaining, scanLimit, isLifetime } = usage;
  const isLow = scansRemaining <= 1;
  const isExhausted = scansRemaining === 0;

  // Badge text depends on whether it's a lifetime or daily limit
  const remainingText = isExhausted
    ? isLifetime
      ? "All free scans used"
      : "No scans remaining today"
    : isLifetime
      ? `${scansRemaining} of ${scanLimit} free scans left`
      : `${scansRemaining} of ${scanLimit} scans remaining`;

  const guestLabel = isGuest ? "  ·  Guest" : "";

  return (
    <View
      style={[
        styles.container,
        isExhausted && styles.containerExhausted,
        isLow && !isExhausted && styles.containerLow,
      ]}
    >
      <View
        style={[
          styles.dot,
          isExhausted
            ? styles.dotExhausted
            : isLow
              ? styles.dotLow
              : styles.dotOk,
        ]}
      />
      <Text
        style={[
          styles.text,
          isExhausted && styles.textExhausted,
          isLow && !isExhausted && styles.textLow,
        ]}
      >
        {remainingText}
        {isGuest ? guestLabel : ""}
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
    gap: 6,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  containerLow: {
    borderColor: Colors.suspicious,
    backgroundColor: Colors.suspiciousLight + "22",
  },
  containerExhausted: {
    borderColor: Colors.scam,
    backgroundColor: Colors.scamLight + "22",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOk: { backgroundColor: Colors.safe },
  dotLow: { backgroundColor: Colors.suspicious },
  dotExhausted: { backgroundColor: Colors.scam },
  text: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  textLow: { color: Colors.suspicious },
  textExhausted: { color: Colors.scam },
});
