export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ── Individual validators ─────────────────────────────────────────

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password is too long";
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return "Full name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (name.trim().length > 80) return "Name is too long";
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirm: string,
): string | null {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return null;
}

// ── Password strength ─────────────────────────────────────────────

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  score: PasswordStrength;
  label: string;
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, label: "", color: "#334155" };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  const capped = Math.min(score, 4) as PasswordStrength;

  const labels: Record<PasswordStrength, string> = {
    0: "",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };

  const colors: Record<PasswordStrength, string> = {
    0: "#334155",
    1: "#ef4444",
    2: "#f59e0b",
    3: "#22c55e",
    4: "#6366f1",
  };

  return { score: capped, label: labels[capped], color: colors[capped] };
}

// ── Form validators ───────────────────────────────────────────────

export function validateLoginForm(
  email: string,
  password: string,
): ValidationResult {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSignUpForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): ValidationResult {
  const errors: Record<string, string> = {};

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  const confirmError = validateConfirmPassword(password, confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  return { valid: Object.keys(errors).length === 0, errors };
}
