import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { useNavigation } from "@react-navigation/native";

interface Props {
  isGuest: boolean;
  isLifetime?: boolean;
  isDailyLimit?: boolean; // ← new — true when trial user hits daily cap
  onSubscribe?: () => void;
  onDismiss?: () => void;
}

export default function UpgradePrompt({
  isGuest,
  isLifetime = false,
  isDailyLimit = false,
  onSubscribe,
  onDismiss,
}: Props) {
  const { logout } = useAuth();
  const navigation = useNavigation<any>();

  const handleGuestAuth = () => {
    onDismiss?.();
    logout();
  };

  const handleSubscribe = () => {
    onDismiss?.();
    if (onSubscribe) {
      onSubscribe();
    } else {
      navigation.navigate("Paywall");
    }
  };

  // ── Determine the right message for each scenario ────────────────

  // Scenario 1: Guest who used all 3 lifetime free scans
  const guestExhausted = isGuest && isLifetime;

  // Scenario 2: Trial user who hit today's daily scan cap (resets tomorrow)
  const trialDailyExhausted = !isGuest && isDailyLimit && !isLifetime;

  // Scenario 3: Trial ended or paid subscription lapsed (lifetime limit)
  const accountExhausted = !isGuest && isLifetime;

  // ── Title ─────────────────────────────────────────────────────────
  const title = guestExhausted
    ? "You've used all 3 free scans"
    : trialDailyExhausted
      ? "Daily scans used up"
      : "Your free scans are exhausted";

  // ── Subtitle ──────────────────────────────────────────────────────
  const subtitle = guestExhausted
    ? "Create a free account to get a 30-day trial with 20 scans per day — no payment required."
    : trialDailyExhausted
      ? "You've used your 20 free scans for today. Your scans reset at midnight, or subscribe now for unlimited scanning."
      : accountExhausted
        ? "Your trial or subscription has ended. Subscribe to ScamShieldLite to continue protecting yourself."
        : "Subscribe to ScamShieldLite to continue protecting yourself.";

  // ── Emoji ─────────────────────────────────────────────────────────
  const emoji = trialDailyExhausted ? "⏰" : "🚫";

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {guestExhausted ? (
        // Guest — push to create account (30-day trial pitch)
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGuestAuth}
        >
          <Text style={styles.primaryButtonText}>Start 30-day free trial</Text>
        </TouchableOpacity>
      ) : trialDailyExhausted ? (
        // Trial user hit daily cap — offer both options
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubscribe}
          >
            <Text style={styles.primaryButtonText}>
              Subscribe for unlimited scans
            </Text>
          </TouchableOpacity>
          <View style={styles.resetNotice}>
            <Text style={styles.resetText}>
              🔄 Or wait — your free scans reset at midnight
            </Text>
          </View>
        </>
      ) : (
        // Account exhausted — push to subscribe
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubscribe}
        >
          <Text style={styles.primaryButtonText}>View subscription plans</Text>
        </TouchableOpacity>
      )}

      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>Maybe later</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 16,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  resetNotice: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  resetText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  dismissButton: {
    paddingVertical: 8,
  },
  dismissText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
