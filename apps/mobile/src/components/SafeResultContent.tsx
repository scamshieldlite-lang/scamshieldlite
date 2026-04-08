import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

interface Props {
  explanation: string;
  recommendation: string;
}

export default function SafeResultContent({
  explanation,
  recommendation,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <Text style={styles.icon}>✅</Text>
      </View>
      <Text style={styles.headline}>This message looks safe</Text>
      <Text style={styles.body}>{explanation}</Text>

      <View style={styles.tipCard}>
        <Text style={styles.tipLabel}>💡 Good practice</Text>
        <Text style={styles.tipText}>{recommendation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 14,
    paddingTop: 8,
  },
  iconRow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.safeLight + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 36 },
  headline: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.safe,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  tipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.safe + "44",
    padding: 16,
    width: "100%",
    gap: 6,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.safe,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
