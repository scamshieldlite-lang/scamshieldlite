import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, Path, G } from "react-native-svg";
import { Colors, getRiskColors } from "@/constants/colors";
import type { RiskLevel } from "@scamshieldlite/shared/";

// Reanimated needs animated versions of SVG primitives
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  score: number; // 0–100
  riskLevel: RiskLevel;
  size?: number; // diameter in px, default 180
}

/**
 * Circular arc meter.
 *
 * Arc geometry:
 * - The arc spans 240° (from 150° to 390°, i.e. bottom-left to bottom-right)
 * - 0 score = no arc fill
 * - 100 score = full 240° arc
 * - We animate strokeDashoffset from full circumference → target
 */
export default function RiskMeter({ score, riskLevel, size = 180 }: Props) {
  const { color: primary } = getRiskColors(riskLevel);

  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - 28) / 2; // 14px stroke inset each side
  const strokeWidth = 14;

  // Arc spans 240° — total arc length
  const ARC_DEGREES = 240;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (ARC_DEGREES / 360) * circumference;
  const gapLength = circumference - arcLength;

  // Score → filled arc length
  const filledLength = (score / 100) * arcLength;
  const targetOffset = arcLength - filledLength;

  // SVG arc path — 240° arc starting at 150° (bottom-left)
  const startAngle = 150;
  const endAngle = startAngle + ARC_DEGREES;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);

  const arcPath =
    `M ${start.x} ${start.y} ` +
    `A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;

  // Animated stroke offset
  const dashOffset = useSharedValue(arcLength); // starts empty

  useEffect(() => {
    dashOffset.value = withTiming(targetOffset, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  // Score label color
  const scoreColor =
    score <= 20 ? Colors.safe : score <= 50 ? Colors.suspicious : Colors.scam;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track arc — muted background */}
        <Path
          d={arcPath}
          fill="none"
          stroke={Colors.surfaceHigh}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset={0}
        />
        {/* Filled arc — animated */}
        <AnimatedPath
          d={arcPath}
          fill="none"
          stroke={primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${gapLength}`}
          animatedProps={animatedProps}
        />
      </Svg>

      {/* Center label */}
      <View style={[styles.label, { width: size, height: size }]}>
        <Text style={[styles.score, { color: scoreColor }]}>{score}</Text>
        <Text style={styles.outOf}>/100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "center",
  },
  label: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  score: {
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 44,
  },
  outOf: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
  },
});
