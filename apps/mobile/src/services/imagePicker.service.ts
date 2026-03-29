// apps/mobile/src/services/imagePicker.service.ts

import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";
import { logger } from "@/utils/logger";

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  mimeType: string;
}

export const imagePickerService = {
  /**
   * Open the system photo gallery.
   * Requests permission first on iOS.
   * Android 13+ uses READ_MEDIA_IMAGES which is declared in manifest.
   */
  async pickFromGallery(): Promise<PickedImage | null> {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "ScamShieldLite needs access to your photos to scan screenshot messages. Enable it in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
          },
        ],
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Don't crop — preserve full message context
      quality: 1, // Max quality for OCR accuracy
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];
    logger.info("Image picked from gallery", {
      width: asset.width,
      height: asset.height,
    });

    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType ?? "image/jpeg",
    };
  },

  /**
   * Open the camera to capture a screenshot in real-time.
   * Useful for scanning physical screens or documents.
   */
  async captureFromCamera(): Promise<PickedImage | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Camera permission required",
        "Allow camera access to scan messages directly.",
        [{ text: "OK" }],
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // Crop to square — helps focus on the message area
      aspect: [3, 4],
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];
    logger.info("Image captured from camera", {
      width: asset.width,
      height: asset.height,
    });

    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType ?? "image/jpeg",
    };
  },
};
