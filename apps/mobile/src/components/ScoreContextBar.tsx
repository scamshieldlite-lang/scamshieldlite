import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, getRiskColors } from "@/constants/colors";
import type { RiskLevel } from "@scamshieldlite/shared/";

interface Props {
  score: number;
  riskLevel: RiskLevel;
  scansRemaining?: number;
  isGuest: boolean;
}

export default function ScoreContextBar({
  score,
  riskLevel,
  scansRemaining,
  isGuest,
}: Props) {
  const { color: primary } = getRiskColors(riskLevel);

  return (
    <View style={styles.container}>
      {/* Score bar */}
      <View style={styles.barSection}>
        <View style={styles.barTrack}>
          {/* Safe zone */}
          <View
            style={[
              styles.barSegment,
              { backgroundColor: Colors.safe + "44", flex: 20 },
            ]}
          />
          {/* Suspicious zone */}
          <View
            style={[
              styles.barSegment,
              { backgroundColor: Colors.suspicious + "44", flex: 30 },
            ]}
          />
          {/* Scam zone */}
          <View
            style={[
              styles.barSegment,
              { backgroundColor: Colors.scam + "44", flex: 50 },
            ]}
          />

          {/* Score marker */}
          <View
            style={[
              styles.marker,
              {
                left: `${score}%` as any,
                backgroundColor: primary,
                borderColor: Colors.background,
              },
            ]}
          />
        </View>

        <View style={styles.barLabels}>
          <Text style={styles.barLabel}>Safe</Text>
          <Text style={styles.barLabel}>Suspicious</Text>
          <Text style={styles.barLabel}>Scam</Text>
        </View>
      </View>

      {/* Usage meta */}
      {scansRemaining !== undefined && (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {isGuest ? "👤 Guest  ·  " : ""}
            {scansRemaining} scan{scansRemaining !== 1 ? "s" : ""} remaining
            today
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  barSection: {
    gap: 4,
  },
  barTrack: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "visible",
    position: "relative",
  },
  barSegment: {
    height: 8,
  },
  marker: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginLeft: -8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  metaRow: {
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
