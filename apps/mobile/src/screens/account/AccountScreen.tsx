import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useScanUsage } from "@/hooks/useScanUsage";
import AuthGuard from "@/components/AuthGuard";
import { Colors } from "@/constants/colors";
import { UserIcon } from "lucide-react-native";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/AppStack";
import { AccountStackParamList } from "@/navigation/AccountStack";

// ── Info row — reusable within this screen ────────────────────────
interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

type AccountScreenNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<AccountStackParamList, "AccountHome">,
  NativeStackNavigationProp<AppStackParamList>
>;

function InfoRow({ label, value, valueColor }: InfoRowProps) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text
        style={[
          infoStyles.value,
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    maxWidth: "55%",
    textAlign: "right",
  },
});

// ── Section header ────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return <Text style={sectionStyles.header}>{title}</Text>;
}

const sectionStyles = StyleSheet.create({
  header: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
});

// ── Main screen ───────────────────────────────────────────────────
export default function AccountScreen() {
  const navigation = useNavigation<AccountScreenNavProp>();
  const { user, logout, authState } = useAuth();
  const { usage } = useScanUsage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(() => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and all scan history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: () => {
            // Phase 11 — full implementation with API call
            Alert.alert(
              "Coming soon",
              "Account deletion will be available in a future update. Contact support to delete your account.",
            );
          },
        },
      ],
    );
  }, []);

  // const navigation =
  //   useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Account</Text>
      </View>

      {/* AuthGuard wraps the authenticated content */}
      <AuthGuard message="Sign in to manage your account and subscription.">
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile section */}
          <SectionHeader title="Profile" />
          <View style={styles.card}>
            {/* Avatar */}
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                {user?.name ? (
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                ) : (
                  <UserIcon color={Colors.primary} size={24} />
                )}
              </View>
              <View style={styles.avatarInfo}>
                <Text style={styles.userName}>{user?.name ?? "Unknown"}</Text>
                <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
              </View>
            </View>
          </View>

          {/* Usage section */}
          <SectionHeader title="Usage today" />
          <View style={styles.card}>
            {usage && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(usage.scansToday / usage.scanLimit) * 100}%`,
                      backgroundColor:
                        usage.scansRemaining <= 1
                          ? Colors.scam
                          : Colors.primary,
                    },
                  ]}
                />
              </View>
            )}
          </View>
          {/* Subscription section */}
          <SectionHeader title="Subscription" />
          <View style={styles.card}>
            <InfoRow
              label="Current plan"
              value={usage?.isGuest ? "Guest" : "Free trial"}
              valueColor={Colors.primary}
            />
            <InfoRow label="Status" value="Active" valueColor={Colors.safe} />
            {/* Subscribe button — Phase 11 */}
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => navigation.navigate("Paywall")}
            >
              <Text style={styles.subscribeButtonText}>⭐ Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>

          {/* Account actions */}
          <SectionHeader title="Account" />
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate("Privacy")}
            >
              <Text style={styles.actionText}>🔒 Privacy settings</Text>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color={Colors.scam} />
              ) : (
                <Text style={styles.actionTextDanger}>Log out</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Danger zone */}
          <SectionHeader title="Danger zone" />
          <View style={[styles.card, styles.dangerCard]}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.actionTextDanger}>Delete account</Text>
            </TouchableOpacity>
          </View>

          {/* App info */}
          <Text style={styles.appVersion}>ScamShieldLite v1.0.0</Text>
        </ScrollView>
      </AuthGuard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 8,
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
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginTop: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + "33",
    borderWidth: 1.5,
    borderColor: Colors.primary + "55",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
  },
  avatarInfo: { gap: 2 },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  loader: {
    paddingVertical: 16,
  },
  subscribeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 12,
  },
  subscribeButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  actionRow: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  actionChevron: {
    color: Colors.textMuted,
    fontSize: 18,
  },
  actionTextDanger: {
    color: Colors.scam,
    fontSize: 14,
    fontWeight: "600",
  },
  appVersion: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
});
