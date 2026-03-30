// apps/mobile/src/screens/account/PrivacyScreen.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AccountStackParamList } from "@/navigation/AccountStack";
import { privacyService } from "@/services/privacy.service";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/colors";
import type { PrivacySettingsData, ConsentSummary } from "@shared/privacy";
import { LEGAL_VERSIONS } from "@shared/privacy";
import { extractErrorMessage } from "@/utils/errorMessage";

type Props = NativeStackScreenProps<AccountStackParamList, "Privacy">;

// ── Toggle row ────────────────────────────────────────────────────
interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({
  label,
  description,
  value,
  onToggle,
  disabled,
}: ToggleRowProps) {
  return (
    <View style={toggleStyles.row}>
      <View style={toggleStyles.text}>
        <Text style={toggleStyles.label}>{label}</Text>
        <Text style={toggleStyles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{
          false: Colors.surfaceHigh,
          true: Colors.primary + "88",
        }}
        thumbColor={value ? Colors.primary : Colors.textMuted}
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  text: { flex: 1, gap: 3 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});

// ── Main screen ───────────────────────────────────────────────────
export default function PrivacyScreen({ navigation }: Props) {
  const { logout } = useAuth();

  const [settings, setSettings] = useState<PrivacySettingsData | null>(null);
  const [consent, setConsent] = useState<ConsentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await privacyService.getSettings();
      setSettings(data.settings);
      setConsent(data.consent);
    } catch (err) {
      Alert.alert(
        "Error",
        "Could not load privacy settings. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const updateSetting = useCallback(
    async (
      key: keyof Omit<PrivacySettingsData, "updatedAt">,
      value: boolean,
    ) => {
      if (!settings) return;

      // Optimistic update
      setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

      setIsSaving(true);
      try {
        const updated = await privacyService.updateSettings({
          [key]: value,
        });
        setSettings(updated);
      } catch (err) {
        // Revert on failure
        setSettings((prev) => (prev ? { ...prev, [key]: !value } : prev));
        Alert.alert("Error", extractErrorMessage(err));
      } finally {
        setIsSaving(false);
      }
    },
    [settings],
  );

  const handleDeleteHistory = useCallback(() => {
    Alert.alert(
      "Delete scan history",
      "This will permanently delete all your scan records. Your account and subscription will remain active.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete history",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await privacyService.deleteScanHistory();
              Alert.alert("History deleted", result.message);
            } catch (err) {
              Alert.alert("Error", extractErrorMessage(err));
            }
          },
        },
      ],
    );
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account, all scan history, and cancel your subscription. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "I understand, delete my account",
          style: "destructive",
          onPress: async () => {
            try {
              await privacyService.deleteAccount();
              await logout();
            } catch (err) {
              Alert.alert("Error", extractErrorMessage(err));
            }
          },
        },
      ],
    );
  }, [logout]);

  const handleExportData = useCallback(() => {
    Alert.alert(
      "Export your data",
      "Your data will be prepared as a JSON file. This may take a moment.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            try {
              await privacyService.exportData();
              Alert.alert(
                "Export ready",
                "Your data has been prepared. Check your downloads folder.",
              );
            } catch (err) {
              Alert.alert("Error", extractErrorMessage(err));
            }
          },
        },
      ],
    );
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const consentDate = consent?.acceptedAt
    ? new Date(consent.acceptedAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not recorded";

  const needsReConsent =
    !consent ||
    consent.termsVersion !== LEGAL_VERSIONS.TERMS ||
    consent.privacyVersion !== LEGAL_VERSIONS.PRIVACY;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Privacy</Text>
        {isSaving ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Re-consent banner */}
        {needsReConsent && (
          <TouchableOpacity
            style={styles.reconsentBanner}
            onPress={() => privacyService.recordConsent()}
          >
            <Text style={styles.reconsentTitle}>⚠ Policy update</Text>
            <Text style={styles.reconsentText}>
              Our Terms and Privacy Policy have been updated. Tap to review and
              accept the latest versions.
            </Text>
          </TouchableOpacity>
        )}

        {/* Privacy controls */}
        <Text style={styles.sectionHeader}>Data controls</Text>
        <View style={styles.card}>
          {settings && (
            <>
              <ToggleRow
                label="Save scan history"
                description="Store your scan results so you can review them later. Disabling this means new scans won't be saved."
                value={settings.scanHistoryEnabled}
                onToggle={(val) => updateSetting("scanHistoryEnabled", val)}
                disabled={isSaving}
              />
              <ToggleRow
                label="Usage analytics"
                description="Help improve ScamShieldLite by sharing anonymous usage data. No personal information is included."
                value={settings.analyticsEnabled}
                onToggle={(val) => updateSetting("analyticsEnabled", val)}
                disabled={isSaving}
              />
              <ToggleRow
                label="Crash reporting"
                description="Automatically send crash reports to help us fix bugs faster."
                value={settings.crashReportingEnabled}
                onToggle={(val) => updateSetting("crashReportingEnabled", val)}
                disabled={isSaving}
              />
            </>
          )}
        </View>

        {/* Data rights */}
        <Text style={styles.sectionHeader}>Your data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>📦</Text>
              <View>
                <Text style={styles.actionLabel}>Export my data</Text>
                <Text style={styles.actionDescription}>
                  Download everything we hold about you
                </Text>
              </View>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDeleteHistory}
          >
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>🗑️</Text>
              <View>
                <Text style={styles.actionLabel}>Delete scan history</Text>
                <Text style={styles.actionDescription}>
                  Remove all saved scan records
                </Text>
              </View>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Consent record */}
        <Text style={styles.sectionHeader}>Consent record</Text>
        <View style={styles.card}>
          <View style={styles.consentRow}>
            <Text style={styles.consentLabel}>Terms accepted</Text>
            <Text style={styles.consentValue}>
              v{consent?.termsVersion ?? "—"} · {consentDate}
            </Text>
          </View>
          <View style={styles.consentRow}>
            <Text style={styles.consentLabel}>Privacy policy accepted</Text>
            <Text style={styles.consentValue}>
              v{consent?.privacyVersion ?? "—"}
            </Text>
          </View>
        </View>

        {/* Legal links */}
        <Text style={styles.sectionHeader}>Legal</Text>
        <View style={styles.card}>
          {[
            {
              label: "Privacy Policy",
              icon: "🔏",
              url: "https://scamshieldlite.app/privacy",
            },
            {
              label: "Terms of Service",
              icon: "📄",
              url: "https://scamshieldlite.app/terms",
            },
            {
              label: "Cookie Policy",
              icon: "🍪",
              url: "https://scamshieldlite.app/cookies",
            },
          ].map(({ label, icon, url }) => (
            <TouchableOpacity
              key={label}
              style={styles.actionRow}
              onPress={() => Linking.openURL(url)}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>{icon}</Text>
                <Text style={styles.actionLabel}>{label}</Text>
              </View>
              <Text style={styles.actionChevron}>↗</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionHeader}>Danger zone</Text>
        <View style={[styles.card, styles.dangerCard]}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDeleteAccount}
          >
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>⚠️</Text>
              <View>
                <Text style={[styles.actionLabel, { color: Colors.scam }]}>
                  Delete account
                </Text>
                <Text style={styles.actionDescription}>
                  Permanently remove all your data
                </Text>
              </View>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🔒 Our privacy commitment</Text>
          <Text style={styles.summaryText}>
            ScamShieldLite never stores the original text of messages you scan.
            Personal information is automatically removed before any analysis.
            Screenshots are processed entirely on your device and are never
            transmitted. We do not sell your data.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "500",
    width: 60,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  dangerCard: {
    borderColor: Colors.scam + "44",
  },
  reconsentBanner: {
    backgroundColor: Colors.suspicious + "18",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.suspicious + "55",
    padding: 14,
    gap: 6,
  },
  reconsentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.suspicious,
  },
  reconsentText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  actionIcon: { fontSize: 18, width: 24, textAlign: "center" },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionChevron: {
    color: Colors.textMuted,
    fontSize: 18,
    paddingLeft: 8,
  },
  consentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  consentLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  consentValue: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
    maxWidth: "45%",
    textAlign: "right",
  },
  summaryCard: {
    backgroundColor: Colors.primary + "0e",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.primary + "33",
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  summaryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
