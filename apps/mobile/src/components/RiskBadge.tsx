// apps/mobile/src/components/RiskBadge.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getRiskColors } from "@/constants/colors";
import type { RiskLevel } from "@scamshieldlite/shared/";

interface Props {
  riskLevel: RiskLevel;
  riskScore: number;
  size?: "sm" | "lg";
}

const RISK_EMOJI: Record<RiskLevel, string> = {
  "Likely Safe": "✅",
  Suspicious: "⚠️",
  "Likely Scam": "🚨",
};

export default function RiskBadge({
  riskLevel,
  riskScore,
  size = "lg",
}: Props) {
  const { color: primary, bg } = getRiskColors(riskLevel);
  const isLarge = size === "lg";

  return (
    <View
      style={[
        styles.container,
        { borderColor: primary + "55", backgroundColor: bg },
        isLarge && styles.containerLarge,
      ]}
    >
      <Text style={isLarge ? styles.emojiLarge : styles.emojiSm}>
        {RISK_EMOJI[riskLevel]}
      </Text>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.level,
            { color: primary },
            isLarge && styles.levelLarge,
          ]}
        >
          {riskLevel}
        </Text>
        {isLarge && (
          <Text style={[styles.score, { color: primary + "99" }]}>
            Risk score: {riskScore}/100
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignSelf: "stretch",
  },
  emojiSm: { fontSize: 14 },
  emojiLarge: { fontSize: 28 },
  textContainer: { gap: 2 },
  level: {
    fontSize: 14,
    fontWeight: "700",
  },
  levelLarge: { fontSize: 20 },
  score: {
    fontSize: 12,
    fontWeight: "500",
  },
});
