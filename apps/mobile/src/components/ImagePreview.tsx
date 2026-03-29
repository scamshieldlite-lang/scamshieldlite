// apps/mobile/src/components/ImagePreview.tsx

import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/colors";
import type { OcrResult } from "@/services/ocr.service";

interface Props {
  imageUri: string;
  ocrResult: OcrResult | null;
  isProcessing: boolean;
  error: string | null;
  onClear: () => void;
  onConfirm: (extractedText: string) => void;
}

const CONFIDENCE_COLORS = {
  high: Colors.safe,
  medium: Colors.suspicious,
  low: Colors.scam,
};

const CONFIDENCE_LABELS = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence — verify carefully",
};

export default function ImagePreview({
  imageUri,
  ocrResult,
  isProcessing,
  error,
  onClear,
  onConfirm,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Image thumbnail */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Processing state */}
      {isProcessing && (
        <View style={styles.processingCard}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.processingText}>Extracting text from image…</Text>
        </View>
      )}

      {/* Error state */}
      {error && !isProcessing && (
        <View style={styles.errorCard}>
          <Text style={styles.errorEmoji}>🔍</Text>
          <Text style={styles.errorTitle}>Text extraction failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onClear}>
            <Text style={styles.retryButtonText}>Try another image</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* OCR result */}
      {ocrResult && !isProcessing && (
        <View style={styles.resultCard}>
          {/* Confidence indicator */}
          <View style={styles.confidenceRow}>
            <View
              style={[
                styles.confidenceDot,
                {
                  backgroundColor: CONFIDENCE_COLORS[ocrResult.confidence],
                },
              ]}
            />
            <Text
              style={[
                styles.confidenceLabel,
                { color: CONFIDENCE_COLORS[ocrResult.confidence] },
              ]}
            >
              {CONFIDENCE_LABELS[ocrResult.confidence]}
            </Text>
            <Text style={styles.charCount}>
              {ocrResult.characterCount} chars · {ocrResult.blockCount} blocks
            </Text>
          </View>

          {/* Extracted text preview */}
          <Text style={styles.extractedLabel}>Extracted text preview</Text>
          <ScrollView
            style={styles.textScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.extractedText} numberOfLines={6}>
              {ocrResult.text}
            </Text>
          </ScrollView>

          {/* Privacy note */}
          <Text style={styles.privacyNote}>
            🔒 Image stays on your device. Only text is analyzed.
          </Text>

          {/* Confirm CTA */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => onConfirm(ocrResult.text)}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>🛡️ Analyze this text</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  imageWrapper: {
    position: "relative",
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  image: {
    width: 200,
    height: 160,
    backgroundColor: Colors.surface,
  },
  clearButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  processingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
  },
  processingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorCard: {
    backgroundColor: Colors.scam + "10",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.scam + "44",
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  errorEmoji: { fontSize: 28 },
  errorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  extractedLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  textScroll: {
    maxHeight: 120,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  extractedText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontFamily: "monospace",
  },
  privacyNote: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
