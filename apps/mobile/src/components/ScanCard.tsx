import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Colors, getRiskColors } from "@/constants/colors";
import type { RiskLevel } from "@scamshieldlite/shared/";

interface Props {
  riskLevel: RiskLevel;
  riskScore: number;
  scamType: string;
  explanation: string;
  createdAt: string;
  onPress: () => void;
}

export default function ScanCard({
  riskLevel,
  riskScore,
  scamType,
  explanation,
  createdAt,
  onPress,
}: Props) {
  const { color: primary } = getRiskColors(riskLevel);
  const date = new Date(createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Left color accent bar */}
      <View style={[styles.accent, { backgroundColor: primary }]} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: primary + "22", borderColor: primary + "55" },
            ]}
          >
            <Text style={[styles.badgeText, { color: primary }]}>
              {riskLevel}
            </Text>
          </View>
          <Text style={styles.score}>{riskScore}/100</Text>
        </View>

        {/* Scam type */}
        {scamType ? (
          <Text style={styles.scamType} numberOfLines={1}>
            {scamType}
          </Text>
        ) : null}

        {/* Explanation preview */}
        <Text style={styles.explanation} numberOfLines={2}>
          {explanation}
        </Text>

        {/* Date */}
        <Text style={styles.date}>{date}</Text>
      </View>

      {/* Chevron */}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 10,
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    borderRadius: 6,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  score: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  scamType: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  explanation: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    color: Colors.textMuted,
    fontSize: 22,
    alignSelf: "center",
    paddingRight: 12,
  },
});
