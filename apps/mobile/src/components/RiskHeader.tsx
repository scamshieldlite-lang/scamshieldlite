import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RiskMeter from "./RiskMeter";
import { Colors, getRiskColors } from "@/constants/colors";
import type { RiskLevel } from "@scamshieldlite/shared/";

interface Props {
  riskLevel: RiskLevel;
  riskScore: number;
  scamType: string;
  onBack: () => void;
  onShare: () => void;
  inputType?: "text" | "screenshot";
}

const LEVEL_LABELS: Record<RiskLevel, string> = {
  "Likely Safe": "This message appears safe",
  Suspicious: "This message looks suspicious",
  "Likely Scam": "This is likely a scam",
};

export default function RiskHeader({
  riskLevel,
  riskScore,
  scamType,
  onBack,
  onShare,
  inputType,
}: Props) {
  const insets = useSafeAreaInsets();
  const { color: primary } = getRiskColors(riskLevel);
  const backgroundColor = Colors.background;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: backgroundColor,
          borderBottomColor: primary + "33",
        },
      ]}
    >
      {/* Navigation row */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.navButton}>
          <Text style={[styles.navText, { color: primary }]}>‹ New scan</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={styles.navButton}>
          <Text style={[styles.navText, { color: primary }]}>Share ↗</Text>
        </TouchableOpacity>
      </View>

      {/* Meter */}
      <RiskMeter score={riskScore} riskLevel={riskLevel} size={160} />

      {/* Level label */}
      <View style={styles.labelBlock}>
        <Text style={[styles.levelText, { color: primary }]}>{riskLevel}</Text>
        <Text style={styles.levelSub}>{LEVEL_LABELS[riskLevel]}</Text>
        {scamType ? (
          <View>
            <View
              style={[
                styles.scamTypePill,
                {
                  backgroundColor: primary + "22",
                  borderColor: primary + "44",
                },
              ]}
            >
              <Text style={[styles.scamTypeText, { color: primary }]}>
                {scamType}
              </Text>
            </View>
          </View>
        ) : null}
        {inputType === "screenshot" && (
          <View style={styles.screenshotBadge}>
            <Text style={styles.screenshotBadgeText}>
              🖼️ Scanned from screenshot
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    paddingBottom: 20,
    gap: 12,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  navButton: { padding: 4 },
  navText: {
    fontSize: 15,
    fontWeight: "600",
  },
  labelBlock: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
  },
  levelText: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  levelSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  scamTypePill: {
    borderRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  scamTypeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  screenshotBadge: {
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.primary + "44",
    backgroundColor: Colors.primary + "18",
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  screenshotBadgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "600",
  },
});
