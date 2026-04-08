import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getPasswordStrength } from "@/utils/formValidation";
import { Colors } from "@/constants/colors";

interface Props {
  password: string;
}

export default function PasswordStrengthBar({ password }: Props) {
  const { score, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <View style={styles.container}>
      {/* Segmented bar — 4 segments */}
      <View style={styles.barRow}>
        {[1, 2, 3, 4].map((segment) => (
          <View
            key={segment}
            style={[
              styles.segment,
              {
                backgroundColor: segment <= score ? color : Colors.surfaceHigh,
              },
            ]}
          />
        ))}
      </View>

      {/* Label */}
      {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginTop: -2,
  },
  barRow: {
    flexDirection: "row",
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
  },
});
