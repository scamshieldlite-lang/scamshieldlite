// apps/mobile/src/services/ocr.service.ts

import TextRecognition, {
  type TextRecognitionResult,
} from "@react-native-ml-kit/text-recognition";
import * as ImageManipulator from "expo-image-manipulator";
import { logger } from "@/utils/logger";

export interface OcrResult {
  text: string;
  confidence: "high" | "medium" | "low";
  blockCount: number;
  characterCount: number;
}

export interface OcrError {
  code:
    | "NO_TEXT_FOUND"
    | "IMAGE_TOO_SMALL"
    | "PROCESSING_FAILED"
    | "IMAGE_UNREADABLE";
  message: string;
}

// Minimum extracted text length to be useful for scam detection
const MIN_TEXT_LENGTH = 20;

// Max image dimension — resize before OCR for speed + memory
const MAX_IMAGE_DIMENSION = 1920;

/**
 * OCR Service
 *
 * Uses Google ML Kit text recognition running entirely on-device.
 * Images are never transmitted anywhere — only the extracted text
 * is passed to the scan pipeline (after PII scrubbing on backend).
 */
export const ocrService = {
  /**
   * Extract text from an image URI.
   *
   * Pipeline:
   * 1. Resize to max 1920px on longest edge (memory + speed)
   * 2. Run ML Kit text recognition
   * 3. Concatenate text blocks in reading order
   * 4. Normalize whitespace and clean output
   * 5. Validate minimum useful text length
   */
  async extractText(imageUri: string): Promise<OcrResult> {
    // ── 1. Resize image ────────────────────────────────────────
    const resized = await this.resizeImage(imageUri);

    logger.debug("Image resized for OCR", {
      uri: resized.uri,
      width: resized.width,
      height: resized.height,
    });

    // ── 2. Run ML Kit OCR ──────────────────────────────────────
    let result: TextRecognitionResult;
    try {
      result = await TextRecognition.recognize(resized.uri);
    } catch (error) {
      logger.error("ML Kit OCR failed", { error });
      throw {
        code: "PROCESSING_FAILED",
        message: "Could not process this image. Try a clearer screenshot.",
      } satisfies OcrError;
    }

    // ── 3. Extract and join text blocks ───────────────────────
    const blocks = result.blocks ?? [];

    if (blocks.length === 0) {
      throw {
        code: "NO_TEXT_FOUND",
        message:
          "No text found in this image. Make sure the screenshot contains readable text.",
      } satisfies OcrError;
    }

    // Join blocks preserving natural reading order
    // ML Kit returns blocks sorted top-left → bottom-right
    const rawText = blocks
      .map((block) =>
        block.lines
          .map((line) => line.elements.map((el) => el.text).join(" "))
          .join("\n"),
      )
      .join("\n\n");

    // ── 4. Normalize text ──────────────────────────────────────
    const cleaned = this.normalizeText(rawText);

    logger.info("OCR extraction complete", {
      blockCount: blocks.length,
      rawLength: rawText.length,
      cleanedLength: cleaned.length,
    });

    // ── 5. Validate minimum length ─────────────────────────────
    if (cleaned.length < MIN_TEXT_LENGTH) {
      throw {
        code: "IMAGE_TOO_SMALL",
        message:
          `Not enough readable text found (${cleaned.length} characters). ` +
          "Try a larger or clearer screenshot.",
      } satisfies OcrError;
    }

    // Estimate confidence based on block density
    const confidence =
      blocks.length > 5 ? "high" : blocks.length > 2 ? "medium" : "low";

    return {
      text: cleaned,
      confidence,
      blockCount: blocks.length,
      characterCount: cleaned.length,
    };
  },

  /**
   * Resize image to max dimension for OCR performance.
   * Preserves aspect ratio. Skips resize if already small enough.
   */
  async resizeImage(uri: string): Promise<{
    uri: string;
    width: number;
    height: number;
  }> {
    try {
      // Get image info first
      const info = await ImageManipulator.manipulateAsync(
        uri,
        [], // no-op to get dimensions
        { format: ImageManipulator.SaveFormat.JPEG },
      );

      const { width, height } = info;
      const maxDim = Math.max(width, height);

      // Already small enough — skip resize
      if (maxDim <= MAX_IMAGE_DIMENSION) {
        return { uri: info.uri, width, height };
      }

      // Resize proportionally
      const scale = MAX_IMAGE_DIMENSION / maxDim;
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);

      const resized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: newWidth, height: newHeight } }],
        {
          compress: 0.85,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      return {
        uri: resized.uri,
        width: newWidth,
        height: newHeight,
      };
    } catch (error) {
      logger.error("Image resize failed — using original", { error });
      // Return original URI if resize fails — OCR may still work
      return { uri, width: 0, height: 0 };
    }
  },

  /**
   * Normalize extracted text for scam detection.
   *
   * - Collapse multiple blank lines to single line break
   * - Remove zero-width characters
   * - Normalize unicode spaces
   * - Trim leading/trailing whitespace
   * - Preserve intentional line breaks (message structure matters)
   */
  normalizeText(raw: string): string {
    return raw
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
      .replace(/\u00A0/g, " ") // non-breaking space → space
      .replace(/[ \t]+/g, " ") // collapse inline whitespace
      .replace(/\n{3,}/g, "\n\n") // max 2 consecutive newlines
      .replace(/^\s+|\s+$/gm, "") // trim each line
      .trim();
  },
};
