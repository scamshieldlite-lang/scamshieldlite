import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import {
  PRODUCT_IDS,
  PRODUCT_PRICES,
  type ProductId,
} from "@shared/subscription";
import { Colors } from "@/constants/colors";
import { useNavigation } from "@react-navigation/native";

const FEATURES = [
  "🛡️  Unlimited scam analysis",
  "📋  Full scan history",
  "⚡  Priority AI detection",
  "🔔  Scam alert notifications",
  "📊  Detailed risk analytics",
];

interface PlanCardProps {
  productId: ProductId;
  label: string;
  price: string;
  badge?: string;
  isSelected: boolean;
  onSelect: () => void;
}

function PlanCard({
  productId,
  label,
  price,
  badge,
  isSelected,
  onSelect,
}: PlanCardProps) {
  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.planCardSelected]}
      onPress={onSelect}
      activeOpacity={0.75}
    >
      <View style={styles.planCardLeft}>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
        <View>
          <Text style={styles.planLabel}>{label}</Text>
          <Text style={styles.planPrice}>{price}</Text>
        </View>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function PaywallScreen({
  onDismiss,
}: {
  onDismiss?: () => void;
}) {
  const { state, products, error, purchase, reset } = useSubscription();
  const { subscription } = useSubscriptionContext();

  const [selectedPlan, setSelectedPlan] = React.useState<ProductId>(
    PRODUCT_IDS.YEARLY,
  );

  const handlePurchase = useCallback(async () => {
    await purchase(selectedPlan);
  }, [purchase, selectedPlan]);

  const handleRestore = useCallback(() => {
    Alert.alert(
      "Restore purchases",
      "This will restore any previous ScamShieldLite subscriptions on this Google account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: () => {
            // react-native-iap restore for Android uses
            // getAvailablePurchases() — implement if needed
            Alert.alert(
              "Restore",
              "Restoration is handled automatically by Google Play.",
            );
          },
        },
      ],
    );
  }, []);

  const isLoading =
    state === "initializing" || state === "purchasing" || state === "verifying";

  // Trial days remaining banner
  const trialBanner =
    subscription?.isTrialActive && subscription.daysRemaining
      ? `${subscription.daysRemaining} day${subscription.daysRemaining !== 1 ? "s" : ""} left in your free trial`
      : null;

  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ScamShieldLite Pro</Text>
        <Text style={styles.subtitle}>
          Protect yourself from scams every day
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButtonWrapper} // 👈 Apply the wrapper style here
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Trial banner */}
        {trialBanner && (
          <View style={styles.trialBanner}>
            <Text style={styles.trialBannerText}>⏳ {trialBanner}</Text>
          </View>
        )}

        {/* Features list */}
        <View style={styles.featuresList}>
          {FEATURES.map((feature, i) => (
            <Text key={i} style={styles.featureItem}>
              {feature}
            </Text>
          ))}
        </View>

        {/* Plan selector */}
        <Text style={styles.sectionLabel}>Choose your plan</Text>

        <PlanCard
          productId={PRODUCT_IDS.YEARLY}
          label="Yearly"
          price={PRODUCT_PRICES[PRODUCT_IDS.YEARLY]}
          badge="Best value"
          isSelected={selectedPlan === PRODUCT_IDS.YEARLY}
          onSelect={() => setSelectedPlan(PRODUCT_IDS.YEARLY)}
        />
        <PlanCard
          productId={PRODUCT_IDS.MONTHLY}
          label="Monthly"
          price={PRODUCT_PRICES[PRODUCT_IDS.MONTHLY]}
          isSelected={selectedPlan === PRODUCT_IDS.MONTHLY}
          onSelect={() => setSelectedPlan(PRODUCT_IDS.MONTHLY)}
        />

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity onPress={reset}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Success */}
        {state === "success" && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>
              ✅ Subscription activated! Thank you.
            </Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            (isLoading || state === "success") && styles.ctaButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={isLoading || state === "success"}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.ctaButtonText}>
              {state === "success"
                ? "✅  Subscribed"
                : `Subscribe — ${PRODUCT_PRICES[selectedPlan]}`}
            </Text>
          )}
        </TouchableOpacity>

        {/* Footer links */}
        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Payment charged to your Google Play account. Subscription renews
          automatically. Cancel anytime in Play Store → Subscriptions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    // This allows us to position the X without breaking the center text
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  // This targets the TouchableOpacity wrapping the ✕
  closeButtonWrapper: {
    position: "absolute",
    top: 10,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHigh || "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeText: {
    color: Colors.textPrimary, // Use Primary instead of Muted for visibility
    fontSize: 20,
    fontWeight: "600",
    // Centers the ✕ character perfectly
    lineHeight: 22,
    textAlign: "center",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  trialBanner: {
    backgroundColor: Colors.suspicious + "22",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.suspicious + "55",
    padding: 12,
  },
  trialBannerText: {
    color: Colors.suspicious,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  featuresList: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    gap: 10,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  planCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  planLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  planPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.primary + "22",
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: Colors.primary + "44",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  errorBanner: {
    backgroundColor: Colors.scam + "18",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.scam + "55",
    padding: 12,
    gap: 6,
  },
  errorText: {
    color: Colors.scam,
    fontSize: 13,
  },
  retryText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  successBanner: {
    backgroundColor: Colors.safe + "18",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.safe + "55",
    padding: 12,
  },
  successText: {
    color: Colors.safe,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaButtonDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  restoreText: {
    color: Colors.primary,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  legalText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
