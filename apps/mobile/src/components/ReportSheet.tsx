import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  REPORT_CATEGORIES,
  type ReportCategory,
} from "@scamshieldlite/shared/";
import { Colors } from "@/constants/colors";

interface Props {
  visible: boolean;
  initialCategory?: string;
  onSubmit: (category: ReportCategory, comment?: string) => void;
  onDismiss: () => void;
  isLoading: boolean;
}

export default function ReportSheet({
  visible,
  initialCategory,
  onSubmit,
  onDismiss,
  isLoading,
}: Props) {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory>("other");
  const [comment, setComment] = useState("");

  // Pre-select category from scan result if it maps to a known category
  React.useEffect(() => {
    if (initialCategory) {
      const match = Object.keys(REPORT_CATEGORIES).find((key) =>
        initialCategory.toLowerCase().includes(key.replace("_", " ")),
      ) as ReportCategory | undefined;
      if (match) setSelectedCategory(match);
    }
  }, [initialCategory]);

  const handleSubmit = useCallback(() => {
    onSubmit(selectedCategory, comment.trim() || undefined);
  }, [selectedCategory, comment, onSubmit]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onDismiss}
          activeOpacity={1}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Title */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>Report this scam</Text>
              <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Your report helps protect others. The message text is
              automatically anonymized before submission.
            </Text>

            {/* Category selector */}
            <Text style={styles.sectionLabel}>Scam category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {(
                Object.entries(REPORT_CATEGORIES) as [ReportCategory, string][]
              ).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryPill,
                    selectedCategory === key && styles.categoryPillActive,
                  ]}
                  onPress={() => setSelectedCategory(key)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      selectedCategory === key && styles.categoryPillTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Optional comment */}
            <Text style={styles.sectionLabel}>
              Additional details <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={(val) => setComment(val.slice(0, 300))}
              placeholder="Any other details about this scam…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
            <Text style={styles.charCount}>{comment.length}/300</Text>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>🚩 Submit report</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: "center",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: -4,
  },
  optional: {
    fontWeight: "400",
    textTransform: "none",
    letterSpacing: 0,
    color: Colors.textMuted,
  },
  categoryScroll: {
    marginHorizontal: -20,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
  },
  categoryPill: {
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.background,
  },
  categoryPillActive: {
    borderColor: Colors.scam + "88",
    backgroundColor: Colors.scamLight,
  },
  categoryPillText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  categoryPillTextActive: {
    color: Colors.scam,
    fontWeight: "700",
  },
  commentInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 14,
    minHeight: 80,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: -8,
  },
  submitButton: {
    backgroundColor: Colors.scam,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
