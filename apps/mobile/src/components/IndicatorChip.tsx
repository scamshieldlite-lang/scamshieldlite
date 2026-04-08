import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { RiskLevel } from "@scamshieldlite/shared/";
import { getRiskColors } from "@/constants/colors";

interface Props {
  label: string;
  riskLevel: RiskLevel;
}

// Maps indicator keywords → emoji icons
const INDICATOR_ICONS: Record<string, string> = {
  urgency: "⏰",
  threat: "⚠️",
  threats: "⚠️",
  money_request: "💸",
  "money request": "💸",
  impersonation: "🎭",
  suspicious_link: "🔗",
  "suspicious link": "🔗",
  grammar: "📝",
  prize: "🎁",
  "fake prize": "🎁",
  secrecy: "🤫",
  "data harvesting": "🕵️",
  bvn: "🕵️",
  otp: "🔑",
  pressure: "😰",
  crypto: "₿",
  "gift card": "🎴",
  "too good": "🤩",
  job: "💼",
  "fake job": "💼",
  lottery: "🎰",
  investment: "📈",
  romance: "💔",
  delivery: "📦",
};

function getIcon(label: string): string {
  const lower = label.toLowerCase();
  for (const [key, icon] of Object.entries(INDICATOR_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "🔍"; // default
}

export default function IndicatorChip({ label, riskLevel }: Props) {
  const { color: primary } = getRiskColors(riskLevel);
  const icon = getIcon(label);
  const display = label.replace(/_/g, " ").trim();

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: primary + "18",
          borderColor: primary + "44",
        },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, { color: primary }]}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  icon: { fontSize: 13 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
