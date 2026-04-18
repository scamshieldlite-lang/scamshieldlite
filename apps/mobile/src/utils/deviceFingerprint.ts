// apps/mobile/src/utils/deviceFingerprint.ts

import * as Device from "expo-device";
import * as Application from "expo-application";
import { storageService, StorageKey } from "@/services/storage.service";
import { logger } from "@/utils/logger";

/**
 * Generate a stable device fingerprint.
 *
 * Uses: deviceId (Android) → installationId → random fallback
 * Stored in SecureStore so it survives app restarts but not reinstalls.
 * This is intentional — reinstall = fresh guest identity.
 */
async function generateFingerprint(): Promise<string> {
  // Android: use the hardware device ID (stable across reinstalls)
  const androidId = Application.getAndroidId();
  if (androidId) return `android_${androidId}`;

  // iOS: use Expo's installation ID (resets on reinstall, acceptable)
  const installId = await Application.getIosIdForVendorAsync?.();
  if (installId) return `ios_${installId}`;

  // Fallback: generate a random ID and persist it
  const random = `fp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return random;
}

/**
 * Get the device fingerprint.
 * Returns cached value from SecureStore if available.
 * Generates and persists a new one on first call.
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const cached = await storageService.get(StorageKey.DEVICE_FINGERPRINT);
    if (cached) return cached;

    const fingerprint = await generateFingerprint();
    await storageService.set(StorageKey.DEVICE_FINGERPRINT, fingerprint);
    logger.info("Device fingerprint generated and stored");
    return fingerprint;
  } catch (error) {
    logger.error("Failed to get device fingerprint", error);
    // Return a session-only fallback — never crash over this
    return `session_${Date.now()}`;
  }
}

// import * as Application from "expo-application";
// import * as Crypto from "expo-crypto";
// import { storageService, StorageKey } from "@/services/storage.service";
// import { logger } from "@/utils/logger";

// async function generateFingerprint(): Promise<string> {
//   const androidId = Application.getAndroidId();
//   if (androidId) return `android_${androidId}`;

//   if (Application.getIosIdForVendorAsync) {
//     const iosId = await Application.getIosIdForVendorAsync();
//     if (iosId) return `ios_${iosId}`;
//   }

//   return `fp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
// }

// async function hash(value: string) {
//   return await Crypto.digestStringAsync(
//     Crypto.CryptoDigestAlgorithm.SHA256,
//     value,
//   );
// }

// export async function getDeviceFingerprint(): Promise<string> {
//   try {
//     const cached = await storageService.get(StorageKey.DEVICE_FINGERPRINT);
//     if (cached) return cached;

//     const raw = await generateFingerprint();
//     // const hashed = await hash(raw); // uncomment in production

//     await storageService.set(StorageKey.DEVICE_FINGERPRINT, raw);
//     logger.info("Device fingerprint generated and stored");

//     return raw;
//   } catch (error) {
//     logger.error("Failed to get device fingerprint", error);
//     return `session_${Date.now()}`;
//   }
// }
