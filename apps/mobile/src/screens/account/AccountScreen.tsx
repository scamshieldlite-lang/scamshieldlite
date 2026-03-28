import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  ChevronRight,
  CreditCard,
  Settings,
} from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/colors";

export default function AccountScreen() {
  const { authState, user, logout } = useAuth();
  const isGuest = authState === "guest";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Account</Text>

        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <User color={Colors.primary} size={32} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {isGuest ? "Guest User" : user?.name || "Member"}
            </Text>
            <Text style={styles.userEmail}>
              {isGuest ? "Sign in to sync history" : user?.email}
            </Text>
          </View>
        </View>

        {/* Subscription / Usage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Plan & Usage</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <ShieldCheck color={Colors.primary} size={20} />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuTitle}>Current Plan</Text>
              <Text style={styles.menuSub}>
                {isGuest ? "Free Tier" : "Pro Member"}
              </Text>
            </View>
            <ChevronRight color={Colors.textMuted} size={18} />
          </TouchableOpacity>

          {!isGuest && (
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <CreditCard color={Colors.primary} size={20} />
              </View>
              <Text style={styles.menuTitle}>Billing & Subscription</Text>
              <ChevronRight color={Colors.textMuted} size={18} />
            </TouchableOpacity>
          )}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Settings color={Colors.textSecondary} size={20} />
            </View>
            <Text style={styles.menuTitle}>Notification Settings</Text>
            <ChevronRight color={Colors.textMuted} size={18} />
          </TouchableOpacity>
        </View>

        {/* Auth Actions */}
        <View style={styles.footer}>
          {isGuest ? (
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Create Free Account</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut color={Colors.scam} size={20} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.versionText}>ScamShieldLite v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: Colors.textPrimary,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary },
  userEmail: { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  menuIcon: { marginRight: 12 },
  menuTextContent: { flex: 1 },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  menuSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  footer: { marginTop: 12, gap: 16 },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.scam + "44",
  },
  logoutText: { color: Colors.scam, fontWeight: "700", fontSize: 16 },
  versionText: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
});
