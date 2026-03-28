import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Animated as RNAnimated,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/AppStack";
import { useAuth } from "@/hooks/useAuth";

import RiskHeader from "@/components/RiskHeader";
import RiskMeter from "@/components/RiskMeter";
import IndicatorChip from "@/components/IndicatorChip";
import InfoCard from "@/components/InfoCard";
import ScoreContextBar from "@/components/ScoreContextBar";
import SafeResultContent from "@/components/SafeResultContent";
import { Colors, getRiskColors } from "@/constants/colors";

type Props = NativeStackScreenProps<AppStackParamList, "ScanResult">;

export default function ScanResultScreen({ navigation, route }: Props) {
  const { result } = route.params;
  const { authState } = useAuth();
  const isGuest = authState === "guest";

  const {
    risk_level,
    risk_score,
    scam_type,
    indicators_detected,
    explanation,
    recommendation,
  } = result.result;

  const isSafe = risk_level === "Likely Safe";
  const { color: primary } = getRiskColors(risk_level);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message:
          `🛡️ ScamShieldLite Analysis\n\n` +
          `Result: ${risk_level} (${risk_score}/100)\n` +
          (scam_type ? `Type: ${scam_type}\n` : "") +
          `\n${explanation}\n\n` +
          `What to do: ${recommendation}\n\n` +
          `Analyzed with ScamShieldLite`,
      });
    } catch {
      // User cancelled share — silent
    }
  }, [risk_level, risk_score, scam_type, explanation, recommendation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleScanAgain = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleReport = useCallback(() => {
    // Phase 9 — wired up then
  }, []);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        stickyHeaderIndices={[0]}
      >
        {/* Sticky risk header */}
        <RiskHeader
          riskLevel={risk_level}
          riskScore={risk_score}
          scamType={scam_type ?? ""}
          onBack={handleBack}
          onShare={handleShare}
        />

        {/* Body */}
        <View style={styles.body}>
          {/* Safe variant — calming layout */}
          {isSafe && (
            <SafeResultContent
              explanation={explanation}
              recommendation={recommendation}
            />
          )}

          {/* Warning/Scam variant */}
          {!isSafe && (
            <>
              {/* Indicators section */}
              {indicators_detected.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>
                    Indicators detected ({indicators_detected.length})
                  </Text>
                  <View style={styles.chipGrid}>
                    {indicators_detected.map((indicator, i) => (
                      <IndicatorChip
                        key={i}
                        label={indicator}
                        riskLevel={risk_level}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Explanation */}
              <InfoCard
                label="What this means"
                content={explanation}
                icon="📋"
              />

              {/* Recommendation */}
              <InfoCard
                label="What to do"
                content={recommendation}
                icon="✅"
                accentColor={Colors.primary}
              />
            </>
          )}

          {/* Score context bar — always shown */}
          <ScoreContextBar
            score={risk_score}
            riskLevel={risk_level}
            scansRemaining={result.scansRemaining}
            isGuest={isGuest}
          />

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            AI-assisted analysis. Always verify with trusted sources before
            making any decisions.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed footer actions */}
      <View style={styles.footer}>
        {!isSafe && (
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReport}
            activeOpacity={0.75}
          >
            <Text style={styles.reportButtonText}>🚩 Report as scam</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={handleScanAgain}
          activeOpacity={0.8}
        >
          <Text style={styles.scanAgainText}>↩ Scan another message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  body: {
    padding: 20,
    gap: 16,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  reportButton: {
    borderWidth: 0.5,
    borderColor: Colors.scam + "55",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: Colors.scam + "0e",
  },
  reportButtonText: {
    color: Colors.scam,
    fontSize: 14,
    fontWeight: "600",
  },
  scanAgainButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: "center",
  },
  scanAgainText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});
