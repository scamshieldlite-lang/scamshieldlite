// apps/mobile/src/components/InputModeTabs.tsx

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export type InputMode = "text" | "screenshot";

interface Props {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
}

const TABS: { mode: InputMode; label: string; icon: string }[] = [
  { mode: "text", label: "Paste text", icon: "📝" },
  { mode: "screenshot", label: "Screenshot", icon: "🖼️" },
];

export default function InputModeTabs({ mode, onChange }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = mode === tab.mode;
        return (
          <TouchableOpacity
            key={tab.mode}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.mode)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabIcon: { fontSize: 15 },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.white,
  },
});
