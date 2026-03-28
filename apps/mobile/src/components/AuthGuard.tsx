import React, { type ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/colors";
import { Lock } from "lucide-react-native";

interface Props {
  children: ReactNode;
  message?: string;
}

export default function AuthGuard({ children, message }: Props) {
  const { authState } = useAuth();
  const navigation = useNavigation<any>();

  if (authState === "authenticated") {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Lock color={Colors.primary} size={48} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Sign in required</Text>
      <Text style={styles.message}>
        {message ?? "Create a free account to access this feature."}
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.primaryText}>Create free account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.secondaryText}>
          Already have an account? Log in
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
    backgroundColor: Colors.background,
  },
  icon: { fontSize: 40, marginBottom: 4 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryText: {
    color: Colors.primary,
    fontSize: 13,
    marginTop: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
});
