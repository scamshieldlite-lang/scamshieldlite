import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/AppStack";
import type { BottomTabParamList } from "@/navigation/BottomTabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useScanner } from "@/hooks/useScanner";
import { useAuth } from "@/hooks/useAuth";
import { useScanUsage } from "@/hooks/useScanUsage";
import UsageBadge from "@/components/UsageBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import UpgradePrompt from "@/components/UpgradePrompt";
import { Colors } from "@/constants/colors";
import { INPUT_LIMITS } from "@/constants/limits";

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "Scan">,
  NativeStackScreenProps<AppStackParamList>
>;

export default function ScanInputScreen({ navigation }: Props) {
  const [text, setText] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { scan, isLoading, error, isRateLimited, clearError } = useScanner();
  const { authState } = useAuth();
  const { usage } = useScanUsage();

  const charCount = text.trim().length;
  const isUnderMin = charCount > 0 && charCount < INPUT_LIMITS.MIN_LENGTH;
  const isOverMax = charCount > INPUT_LIMITS.MAX_LENGTH;
  const canSubmit =
    charCount >= INPUT_LIMITS.MIN_LENGTH &&
    charCount <= INPUT_LIMITS.MAX_LENGTH &&
    !isLoading;

  // Show upgrade modal automatically when rate limited
  useEffect(() => {
    if (isRateLimited) {
      setShowUpgradeModal(true);
    }
  }, [isRateLimited]);

  const handlePaste = useCallback(async () => {
    try {
      const content = await Clipboard.getStringAsync();
      if (content) {
        setText(content.slice(0, INPUT_LIMITS.MAX_LENGTH));
        clearError();
        inputRef.current?.focus();
      } else {
        Alert.alert("Nothing to paste", "Your clipboard is empty.");
      }
    } catch {
      Alert.alert("Paste failed", "Could not access clipboard.");
    }
  }, [clearError]);

  const handleClear = useCallback(() => {
    setText("");
    clearError();
    inputRef.current?.focus();
  }, [clearError]);

  const handleAnalyze = useCallback(async () => {
    if (!canSubmit) return;

    const result = await scan(text.trim());
    if (result) {
      navigation.navigate("ScanResult", { result });
    }
  }, [canSubmit, scan, text, navigation]);

  const handleSignUp = useCallback(() => {
    setShowUpgradeModal(false);
    // Navigate to auth — handled by RootNavigator re-render
  }, []);

  const charCountColor = isOverMax
    ? Colors.scam
    : isUnderMin
      ? Colors.suspicious
      : charCount > INPUT_LIMITS.MAX_LENGTH * 0.85
        ? Colors.suspicious
        : Colors.textMuted;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.heading}>Scan a message</Text>
            <Text style={styles.subheading}>
              Paste any suspicious text to check if it's a scam
            </Text>
          </View>

          {/* Usage indicator */}
          <View style={styles.usageRow}>
            <UsageBadge />
          </View>

          {/* Text input area */}
          <View
            style={[
              styles.inputCard,
              isOverMax && styles.inputCardError,
              isUnderMin && styles.inputCardWarn,
            ]}
          >
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={text}
              onChangeText={(val) => {
                setText(val);
                if (error) clearError();
              }}
              placeholder="Paste suspicious message here…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={INPUT_LIMITS.MAX_LENGTH + 100} // Soft cap — validation catches hard cap
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            {/* Character counter */}
            <View style={styles.counterRow}>
              <Text style={[styles.charCount, { color: charCountColor }]}>
                {charCount.toLocaleString()} /{" "}
                {INPUT_LIMITS.MAX_LENGTH.toLocaleString()}
              </Text>
              {isUnderMin && (
                <Text style={styles.hintText}>
                  {INPUT_LIMITS.MIN_LENGTH - charCount} more characters needed
                </Text>
              )}
              {isOverMax && (
                <Text style={styles.hintTextError}>
                  Too long — trim your message
                </Text>
              )}
            </View>
          </View>

          {/* Action row: Paste + Clear */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePaste}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>📋 Paste</Text>
            </TouchableOpacity>
            {text.length > 0 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleClear}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>✕ Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Error banner */}
          {error && !isRateLimited && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Primary CTA */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (!canSubmit || isLoading) && styles.analyzeButtonDisabled,
            ]}
            onPress={handleAnalyze}
            disabled={!canSubmit || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <LoadingSpinner message="Analyzing…" />
            ) : (
              <Text style={styles.analyzeButtonText}>🛡️ Analyze message</Text>
            )}
          </TouchableOpacity>

          {/* Info footer */}
          <Text style={styles.disclaimer}>
            Messages are analyzed privately. Personal information is
            automatically removed before processing.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Rate limit upgrade modal */}
      <Modal
        visible={showUpgradeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <UpgradePrompt
            isGuest={authState === "guest"}
            onSignUp={handleSignUp}
            onDismiss={() => setShowUpgradeModal(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: { gap: 6 },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  usageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  inputCardError: { borderColor: Colors.scam },
  inputCardWarn: { borderColor: Colors.suspicious },
  input: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 180,
    maxHeight: 320,
    padding: 16,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  charCount: {
    fontSize: 11,
    fontWeight: "500",
  },
  hintText: {
    fontSize: 11,
    color: Colors.suspicious,
  },
  hintTextError: {
    fontSize: 11,
    color: Colors.scam,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  errorBanner: {
    backgroundColor: Colors.scamLight + "22",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.scam + "55",
    padding: 12,
  },
  errorText: {
    color: Colors.scam,
    fontSize: 13,
    lineHeight: 18,
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  analyzeButtonDisabled: {
    backgroundColor: Colors.surfaceHigh,
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 20,
  },
});
