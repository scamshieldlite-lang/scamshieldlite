import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { useNavigation } from "@react-navigation/native";

interface Props {
  isGuest: boolean;
  isLifetime?: boolean;
  onSubscribe?: () => void;
  onDismiss?: () => void;
}

export default function UpgradePrompt({
  isGuest,
  isLifetime = false,
  onSubscribe,
  onDismiss,
}: Props) {
  const { logout } = useAuth();
  const navigation = useNavigation<any>();

  // Guest action: Log out to access Welcome/Login screen
  const handleGuestAuth = () => {
    onDismiss?.();
    logout();
  };

  // Authenticated action: Open paywall directly without logging out
  const handleSubscribe = () => {
    onDismiss?.();
    if (onSubscribe) {
      onSubscribe();
    } else {
      navigation.navigate("Paywall");
    }
  };

  const title = isGuest
    ? "You've used all 3 free scans"
    : "Your free scans are exhausted";

  const subtitle = isGuest
    ? "Sign in or create a free account to continue scanning."
    : "Subscribe to ScamShieldLite to continue protecting yourself.";

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚫</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {isGuest ? (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGuestAuth}
          >
            <Text style={styles.primaryButtonText}>
              Sign In / Create Account
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubscribe}
        >
          <Text style={styles.primaryButtonText}>View Subscription Plans</Text>
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
  dismissButton: {
    paddingVertical: 8,
  },
  dismissText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
