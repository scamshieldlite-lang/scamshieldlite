import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthStack";
import FormField from "@/components/FormField";
import { useAuth } from "@/hooks/useAuth";
import { validateLoginForm } from "@/utils/formValidation";
import { extractErrorMessage } from "@/utils/errorMessage";
import { Colors } from "@/constants/colors";
import { ChevronLeft } from "lucide-react-native";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const { login } = useAuth();

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleLogin = useCallback(async () => {
    // 1. Initial Form Validation (Local)
    const { valid, errors: formErrors } = validateLoginForm(email, password);
    if (!valid) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      // Success: RootNavigator handles redirection
    } catch (err: any) {
      if (err?.isNetworkError || err?.message?.includes("reach the server")) {
        setErrors({
          general:
            "Could not connect to the server. Make sure you are on the same WiFi as your computer.",
        });
        return;
      }

      const status = err?.response?.status;
      const rawMessage = (
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        ""
      ).toLowerCase();

      // 401 from Better Auth always means wrong credentials
      if (status === 401) {
        setErrors({ password: "Incorrect email or password" });
        return;
      }

      const message = extractErrorMessage(err);
      if (
        rawMessage.includes("invalid") ||
        rawMessage.includes("credentials") ||
        rawMessage.includes("password") ||
        rawMessage.includes("not found") ||
        rawMessage.includes("no user")
      ) {
        setErrors({ password: "Incorrect email or password" });
      } else if (rawMessage.includes("email")) {
        setErrors({ email: "No account found with this email" });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login]);

  const handleForgotPassword = useCallback(() => {
    // Phase 10 extension — simple alert for now
    Alert.alert(
      "Reset password",
      "Enter your email address and we'll send you a reset link.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send link",
          onPress: () => {
            // Wire to Better Auth forgot password endpoint in production
            Alert.alert(
              "Email sent",
              "If an account exists for this email, a reset link has been sent.",
            );
          },
        },
      ],
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color={Colors.primary} size={28} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Log in to access your scan history and full features.
            </Text>
          </View>

          {/* General error */}
          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠ {errors.general}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <FormField
              label="Email address"
              value={email}
              textContentType="emailAddress"
              autoComplete="email"
              onChangeText={(val) => {
                setEmail(val);
                clearFieldError("email");
              }}
              error={errors.email}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!isLoading}
            />

            <FormField
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                clearFieldError("password");
              }}
              error={errors.password}
              placeholder="Your password"
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!isLoading}
            />

            {/* Forgot password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Log in</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.footerLink}> Sign up free</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  backButton: { alignSelf: "flex-start" },
  backText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  header: { gap: 8 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: Colors.scam + "18",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.scam + "55",
    padding: 12,
  },
  errorBannerText: {
    color: Colors.scam,
    fontSize: 13,
    lineHeight: 18,
  },
  form: { gap: 14 },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
