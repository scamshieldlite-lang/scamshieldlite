import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

interface Props {
  label: string;
  content: string;
  accentColor?: string; // if provided, tints border + label
  icon?: string;
}

export default function InfoCard({ label, content, accentColor, icon }: Props) {
  return (
    <View
      style={[
        styles.card,
        accentColor && {
          borderColor: accentColor + "44",
          backgroundColor: accentColor + "0e",
        },
      ]}
    >
      <View style={styles.labelRow}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text
          style={[
            styles.label,
            accentColor ? { color: accentColor } : undefined,
          ]}
        >
          {label}
        </Text>
      </View>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    gap: 10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: { fontSize: 15 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  content: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 23,
  },
});
