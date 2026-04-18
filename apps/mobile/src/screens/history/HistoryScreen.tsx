import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/AppStack";
import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "@/hooks/useHistory";
import ScanCard from "@/components/ScanCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Colors } from "@/constants/colors";
import type { ScanResponse } from "@scamshieldlite/shared/";
import { NormalizedHistoryItem } from "@/services/scan.service";
import AuthGuard from "@/components/AuthGuard";
import TrialExpiryBanner from "@/components/TrialExpiryBanner";

type NavProp = NativeStackNavigationProp<AppStackParamList>;

interface HistoryItem extends ScanResponse {
  id: string;
  createdAt: string;
}

export default function HistoryScreen() {
  const { authState } = useAuth();
  const { items, isLoading, isRefreshing, error, fetch, refresh } =
    useHistory();
  const navigation = useNavigation<NavProp>();

  const isAuthenticated = authState === "authenticated";

  const handleCardPress = useCallback(
    (item: NormalizedHistoryItem) => {
      // Reconstruct ScanResponse shape from normalized history item
      navigation.navigate("ScanResult", {
        result: {
          result: item.result,
          scanId: item.id,
          // scansRemaining not available from history — omit
        },
        originalText: item.result.explanation, // No original text stored in history, but explanation can provide context
      });
    },
    [navigation],
  );

  // ── Auth gate ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>History</Text>
          {items.length > 0 && (
            <Text style={styles.count}>
              {items.length} scan{items.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        <AuthGuard message="Sign in to view your scan history and keep track of threats.">
          {/* Loading */}
          {isLoading && items.length === 0 ? (
            <LoadingSpinner message="Loading your scans…" fullScreen />
          ) : error && items.length === 0 ? (
            /* Error */
            <EmptyState
              title="Couldn't load history"
              subtitle={error}
              actionLabel="Try again"
              onAction={fetch}
            />
          ) : (
            /* List */
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ScanCard
                  riskLevel={item.result.risk_level}
                  riskScore={item.result.risk_score}
                  scamType={item.result.scam_type}
                  explanation={item.result.explanation}
                  createdAt={item.createdAt}
                  onPress={() => handleCardPress(item)}
                />
              )}
              contentContainerStyle={[
                styles.listContent,
                items.length === 0 && styles.listContentEmpty,
              ]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={refresh}
                  tintColor={Colors.primary}
                  colors={[Colors.primary]}
                />
              }
              ListEmptyComponent={
                <EmptyState
                  title="No scans yet"
                  subtitle="Paste a suspicious message on the Scan tab to analyze it."
                />
              }
              ListFooterComponent={
                items.length > 0 ? (
                  <Text style={styles.footer}>
                    Showing last {items.length} scan
                    {items.length !== 1 ? "s" : ""}
                  </Text>
                ) : null
              }
            />
          )}
        </AuthGuard>
      </SafeAreaView>
    );
  }

  // ── Loading ────────────────────────────────────────────────────
  if (isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>History</Text>
        </View>
        <LoadingSpinner message="Loading your scans…" fullScreen />
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>History</Text>
        </View>
        <EmptyState
          title="Couldn't load history"
          subtitle={error}
          actionLabel="Try again"
          onAction={fetch}
        />
      </SafeAreaView>
    );
  }

  // ── List ───────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <TrialExpiryBanner />
      <View style={styles.titleRow}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.count}>
          {items.length} scan{items.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScanCard
            riskLevel={item.result.risk_level}
            riskScore={item.result.risk_score}
            scamType={item.result.scam_type}
            explanation={item.result.explanation}
            createdAt={item.createdAt}
            onPress={() => handleCardPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No scans yet"
            subtitle="Paste a suspicious message on the Scan tab to analyze it. Your results will appear here."
          />
        }
        ListFooterComponent={
          items.length > 0 ? (
            <Text style={styles.footer}>
              Showing last {items.length} scan
              {items.length !== 1 ? "s" : ""}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  count: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listContentEmpty: {
    flex: 1,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    paddingBottom: 8,
  },
});
