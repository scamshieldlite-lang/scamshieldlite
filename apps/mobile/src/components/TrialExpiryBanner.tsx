import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { Colors } from "@/constants/colors";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/AppStack";

const SHOW_BANNER_DAYS = 3;

export default function TrialExpiryBanner() {
  const { subscription } = useSubscriptionContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (!subscription?.isTrialActive) return null;
  if (subscription.daysRemaining === null) return null;
  if (subscription.daysRemaining > SHOW_BANNER_DAYS) return null;

  const isLastDay = subscription.daysRemaining <= 1;
  const daysText = isLastDay
    ? "Your free trial ends today"
    : `Your free trial ends in ${subscription.daysRemaining} day${
        subscription.daysRemaining !== 1 ? "s" : ""
      }`;

  return (
    <View
      style={[
        styles.banner,
        isLastDay ? styles.bannerUrgent : styles.bannerWarning,
      ]}
    >
      <Text style={styles.icon}>{isLastDay ? "🚨" : "⏳"}</Text>
      <Text
        style={[
          styles.text,
          isLastDay ? styles.textUrgent : styles.textWarning,
        ]}
      >
        {daysText}
      </Text>
      <TouchableOpacity
        style={[
          styles.button,
          isLastDay ? styles.buttonUrgent : styles.buttonWarning,
        ]}
        onPress={() => navigation.navigate("Paywall")}
      >
        <Text style={styles.buttonText}>Subscribe</Text>
      </TouchableOpacity>

      {/* Close button */}
      <TouchableOpacity
        onPress={() => setDismissed(true)}
        style={styles.closeButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 0.5,
  },
  bannerWarning: {
    backgroundColor: Colors.suspicious + "18",
    borderBottomColor: Colors.suspicious + "44",
  },
  bannerUrgent: {
    backgroundColor: Colors.scam + "18",
    borderBottomColor: Colors.scam + "44",
  },
  icon: { fontSize: 16 },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  textWarning: { color: Colors.suspicious },
  textUrgent: { color: Colors.scam },
  button: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
  },
  buttonWarning: {
    borderColor: Colors.suspicious,
    backgroundColor: Colors.suspicious + "22",
  },
  buttonUrgent: {
    borderColor: Colors.scam,
    backgroundColor: Colors.scam + "22",
  },
  buttonText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 2,
  },
  closeText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "600",
  },
});
