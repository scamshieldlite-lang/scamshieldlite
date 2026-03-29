// apps/mobile/src/hooks/useOcr.ts

import { useState, useCallback } from "react";
import {
  ocrService,
  type OcrResult,
  type OcrError,
} from "@/services/ocr.service";
import {
  imagePickerService,
  type PickedImage,
} from "@/services/imagePicker.service";
import { logger } from "@/utils/logger";

type OcrState = "idle" | "picking" | "processing" | "done" | "error";

interface UseOcrReturn {
  state: OcrState;
  pickedImage: PickedImage | null;
  ocrResult: OcrResult | null;
  error: string | null;
  pickFromGallery: () => Promise<void>;
  captureFromCamera: () => Promise<void>;
  clearImage: () => void;
}

export function useOcr(): UseOcrReturn {
  const [state, setState] = useState<OcrState>("idle");
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runOcr = useCallback(async (image: PickedImage) => {
    setPickedImage(image);
    setOcrResult(null);
    setError(null);
    setState("processing");

    try {
      const result = await ocrService.extractText(image.uri);
      setOcrResult(result);
      setState("done");

      logger.info("OCR complete", {
        confidence: result.confidence,
        chars: result.characterCount,
        blocks: result.blockCount,
      });
    } catch (err) {
      const ocrError = err as OcrError;
      setError(ocrError.message ?? "Failed to extract text from image");
      setState("error");
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    setState("picking");
    setError(null);

    const image = await imagePickerService.pickFromGallery();
    if (!image) {
      // User cancelled
      setState("idle");
      return;
    }

    await runOcr(image);
  }, [runOcr]);

  const captureFromCamera = useCallback(async () => {
    setState("picking");
    setError(null);

    const image = await imagePickerService.captureFromCamera();
    if (!image) {
      setState("idle");
      return;
    }

    await runOcr(image);
  }, [runOcr]);

  const clearImage = useCallback(() => {
    setPickedImage(null);
    setOcrResult(null);
    setError(null);
    setState("idle");
  }, []);

  return {
    state,
    pickedImage,
    ocrResult,
    error,
    pickFromGallery,
    captureFromCamera,
    clearImage,
  };
}
