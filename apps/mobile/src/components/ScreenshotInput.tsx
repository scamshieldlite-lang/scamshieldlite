// apps/mobile/src/components/ScreenshotInput.tsx

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { useOcr } from "@/hooks/useOcr";
import ImagePreview from "./ImagePreview";

interface Props {
  onTextExtracted: (text: string) => void;
}

export default function ScreenshotInput({ onTextExtracted }: Props) {
  const {
    state,
    pickedImage,
    ocrResult,
    error,
    pickFromGallery,
    captureFromCamera,
    clearImage,
  } = useOcr();

  const isProcessing = state === "processing";
  const hasImage = !!pickedImage;

  return (
    <View style={styles.container}>
      {/* No image selected — show picker options */}
      {!hasImage && (
        <View style={styles.pickArea}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🖼️</Text>
          </View>
          <Text style={styles.title}>Select a screenshot</Text>
          <Text style={styles.subtitle}>
            Choose a screenshot of a suspicious message. Text is extracted on
            your device — the image is never uploaded.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.pickButton}
              onPress={pickFromGallery}
              activeOpacity={0.8}
            >
              <Text style={styles.pickButtonIcon}>🖼️</Text>
              <Text style={styles.pickButtonText}>From gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickButton}
              onPress={captureFromCamera}
              activeOpacity={0.8}
            >
              <Text style={styles.pickButtonIcon}>📷</Text>
              <Text style={styles.pickButtonText}>Use camera</Text>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Tips for best results</Text>
            {[
              "Use full-resolution screenshots, not cropped thumbnails",
              "Ensure text is in focus and not blurry",
              "Works best with chat apps, emails, and SMS",
              "Supports English and most Nigerian languages",
            ].map((tip, i) => (
              <Text key={i} style={styles.tipItem}>
                • {tip}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Image selected — show preview + OCR result */}
      {hasImage && pickedImage && (
        <ImagePreview
          imageUri={pickedImage.uri}
          ocrResult={ocrResult}
          isProcessing={isProcessing}
          error={error}
          onClear={clearImage}
          onConfirm={onTextExtracted}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pickArea: {
    alignItems: "center",
    gap: 14,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + "18",
    borderWidth: 0.5,
    borderColor: Colors.primary + "44",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  pickButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  pickButtonIcon: { fontSize: 24 },
  pickButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  tipsCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
    gap: 6,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  tipItem: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
