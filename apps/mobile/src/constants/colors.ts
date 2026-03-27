export const Colors = {
  // 🛡️ Primary Brand (Cybersecurity Theme)
  primary: "#1E90FF", // Electric Blue
  secondary: "#22C55E", // Success Green

  // 🌚 Backgrounds & Surfaces
  background: "#0B1F3A", // Primary Background
  surface: "#112A4A", // Card Background
  surfaceHigh: "#1C3D6E", // Elevated Surface (active states)

  // 🚦 Risk Level Colors (Brand Specific)
  safe: "#22C55E", // Green
  safeLight: "rgba(34, 197, 94, 0.1)",

  suspicious: "#F59E0B", // Warning Orange
  suspiciousLight: "rgba(245, 158, 11, 0.1)",

  scam: "#EF4444", // Danger Red
  scamLight: "rgba(239, 68, 68, 0.1)",

  // 📝 Text
  textPrimary: "#FFFFFF", // Primary Text
  textSecondary: "#A0AEC0", // Secondary Text
  textMuted: "#718096",

  // 🎨 Gradients (For UI Elements)
  gradients: {
    primary: ["#22C55E", "#1E90FF"], // Success to Blue
    accent: ["#F59E0B", "#EF4444"], // Warning to Danger
  },

  // 🛠️ Utility
  border: "rgba(160, 174, 192, 0.1)",
  white: "#FFFFFF",
  transparent: "transparent",
} as const;

export type ColorKey = keyof typeof Colors;

/**
 * Maps risk level string to the correct color set and specific gradients.
 * Perfect for the "Analysis Report" and "History" cards.
 */
export function getRiskTheme(
  riskLevel: "Likely Safe" | "Suspicious" | "Likely Scam",
) {
  switch (riskLevel) {
    case "Likely Safe":
      return {
        color: Colors.safe,
        bg: Colors.safeLight,
        gradient: [Colors.safe, Colors.primary],
      };
    case "Suspicious":
      return {
        color: Colors.suspicious,
        bg: Colors.suspiciousLight,
        gradient: [Colors.suspicious, Colors.scam],
      };
    case "Likely Scam":
      return {
        color: Colors.scam,
        bg: Colors.scamLight,
        gradient: Colors.gradients.accent,
      };
  }
}
