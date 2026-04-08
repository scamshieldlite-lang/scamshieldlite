import React, { useState, forwardRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Eye, EyeOff } from "lucide-react-native";

interface Props extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  hint?: string;
}

const FormField = forwardRef<TextInput, Props>(
  ({ label, error, isPassword, hint, ...inputProps }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const hasError = !!error;

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[styles.inputWrapper, hasError && styles.inputWrapperError]}
        >
          <TextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={isPassword && !isVisible}
            autoCapitalize={isPassword ? "none" : inputProps.autoCapitalize}
            autoCorrect={isPassword ? false : inputProps.autoCorrect}
            {...inputProps}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsVisible((v) => !v)}
              style={styles.eyeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              {isVisible ? (
                <EyeOff size={20} color={Colors.textMuted} />
              ) : (
                <Eye size={20} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {hasError && <Text style={styles.errorText}>⚠ {error}</Text>}
        {hint && !hasError && <Text style={styles.hintText}>{hint}</Text>}
      </View>
    );
  },
);

FormField.displayName = "FormField";
export default FormField;

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  inputWrapperError: {
    borderColor: Colors.scam + "88",
    backgroundColor: Colors.scam + "0a",
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingVertical: 14,
  },
  eyeButton: {
    paddingLeft: 8,
  },
  eyeIcon: { fontSize: 16 },
  errorText: {
    fontSize: 12,
    color: Colors.scam,
    lineHeight: 16,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
