import React, { useEffect, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

interface ScanResult {
  id: string;
  url: string;
  riskLevel: "safe" | "warning" | "dangerous";
  timestamp: string;
  details: string;
}

export const ScanResultScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = route.params as { scanResult: ScanResult } | undefined;
    if (params?.scanResult) {
      setResult(params.scanResult);
    }
    setLoading(false);
  }, [route.params]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "safe":
        return "#4CAF50";
      case "warning":
        return "#FFC107";
      case "dangerous":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No scan result available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View
        style={[
          styles.riskBadge,
          { backgroundColor: getRiskColor(result.riskLevel) },
        ]}
      >
        <Text style={styles.riskText}>{result.riskLevel.toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>URL Scanned:</Text>
        <Text style={styles.url}>{result.url}</Text>

        <Text style={styles.label}>Details:</Text>
        <Text style={styles.details}>{result.details}</Text>

        <Text style={styles.label}>Timestamp:</Text>
        <Text style={styles.timestamp}>
          {new Date(result.timestamp).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Scan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  riskBadge: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  riskText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 4,
  },
  url: {
    fontSize: 14,
    color: "#0066CC",
    marginBottom: 12,
  },
  details: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  button: {
    backgroundColor: "#0066CC",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
});
