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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthStack";
import FormField from "@/components/FormField";
import PasswordStrengthBar from "@/components/PasswordStrengthBar";
import { useAuth } from "@/hooks/useAuth";
import { validateSignUpForm } from "@/utils/formValidation";
import { extractErrorMessage } from "@/utils/errorMessage";
import { Colors } from "@/constants/colors";
import { TRIAL_DURATION_DAYS } from "@/constants/limits";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const { signUp } = useAuth();

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSignUp = useCallback(async () => {
    // Validate form fields
    const { valid, errors: formErrors } = validateSignUpForm(
      name,
      email,
      password,
      confirmPassword,
    );
    if (!valid) {
      setErrors(formErrors);
      return;
    }

    if (!agreedToTerms) {
      setErrors({ terms: "Please agree to the terms to continue" });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
      // RootNavigator re-renders on authState → "authenticated"
    } catch (err: any) {
      // Network error — special handling
      if (err?.isNetworkError || err?.message?.includes("reach the server")) {
        setErrors({
          general:
            "Could not connect to the server. Make sure you are on the same WiFi as your computer and try again.",
        });
        return;
      }

      const message = extractErrorMessage(err);

      if (
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("exists")
      ) {
        setErrors({
          email: "An account with this email already exists",
        });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password, confirmPassword, agreedToTerms, signUp]);

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
          {/* Back */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Get {TRIAL_DURATION_DAYS} days free, then choose a plan. No
              payment info required to start.
            </Text>
          </View>

          {/* Trial badge */}
          <View style={styles.trialBadge}>
            <Text style={styles.trialBadgeText}>
              🎁 {TRIAL_DURATION_DAYS}-day free trial included
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
              label="Full name"
              value={name}
              onChangeText={(val) => {
                setName(val);
                clearFieldError("name");
              }}
              error={errors.name}
              placeholder="Ada Okafor"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!isLoading}
            />

            <FormField
              ref={emailRef}
              label="Email address"
              value={email}
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

            <View style={styles.passwordGroup}>
              <FormField
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  clearFieldError("password");
                }}
                error={errors.password}
                placeholder="Min. 8 characters"
                isPassword
                hint="Use uppercase, numbers and symbols for a stronger password"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                editable={!isLoading}
              />
              <PasswordStrengthBar password={password} />
            </View>

            <FormField
              ref={confirmRef}
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                clearFieldError("confirmPassword");
              }}
              error={errors.confirmPassword}
              placeholder="Repeat your password"
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
              editable={!isLoading}
            />
          </View>

          {/* Terms */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => {
              setAgreedToTerms((v) => !v);
              clearFieldError("terms");
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                agreedToTerms && styles.checkboxChecked,
                errors.terms && styles.checkboxError,
              ]}
            >
              {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && (
            <Text style={styles.termsError}>⚠ {errors.terms}</Text>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.signUpButton,
              isLoading && styles.signUpButtonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.signUpButtonText}>Create account</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}> Log in</Text>
            </TouchableOpacity>
          </View>

          {/* Legal disclaimer */}
          <Text style={styles.disclaimer}>
            ScamShieldLite is an AI-assisted tool. It does not guarantee
            detection of all scams. Always exercise caution with unsolicited
            messages.
          </Text>
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
    gap: 18,
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
  trialBadge: {
    backgroundColor: Colors.primary + "18",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.primary + "44",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  trialBadgeText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
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
  passwordGroup: { gap: 6 },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxError: {
    borderColor: Colors.scam,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
  termsError: {
    fontSize: 12,
    color: Colors.scam,
    marginTop: -10,
  },
  signUpButton: {
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
  signUpButtonDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
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
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
