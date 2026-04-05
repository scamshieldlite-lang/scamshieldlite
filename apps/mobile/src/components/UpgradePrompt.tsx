import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  isGuest: boolean;
  onSubscribe?: () => void;
  onDismiss?: () => void;
}

export default function UpgradePrompt({
  isGuest,
  onSubscribe,
  onDismiss,
}: Props) {
  const { logout } = useAuth();

  // Calling logout sets authState → "unauthenticated"
  // RootNavigator automatically swaps to AuthStack
  // WelcomeScreen appears with Login + Sign up buttons
  // No manual navigation needed
  const handleSignUp = () => {
    onDismiss?.(); // close the modal first
    logout(); // then trigger the stack swap
  };

  const handleSubscribe = () => {
    onDismiss?.();
    onSubscribe?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚫</Text>
      <Text style={styles.title}>
        {isGuest ? "You've used all free scans" : "Trial scan limit reached"}
      </Text>
      <Text style={styles.subtitle}>
        {isGuest
          ? "Create a free account to get 20 scans per day and keep your scan history."
          : "Subscribe to ScamShieldLite for unlimited scans and full history access."}
      </Text>

      {isGuest ? (
        <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp}>
          <Text style={styles.primaryButtonText}>Create free account</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubscribe}
        >
          <Text style={styles.primaryButtonText}>View subscription plans</Text>
        </TouchableOpacity>
      )}

      {onDismiss && (
        <TouchableOpacity onPress={onDismiss}>
          <Text style={styles.dismissText}>Maybe later</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    alignItems: "center",
    gap: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    shadowColor: Colors.surface,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  emoji: { fontSize: 36 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  dismissText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
});
