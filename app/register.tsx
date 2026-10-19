
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/AppButton";
import Header from "@/components/Header";
import { COLORS } from "@/constants/colors";
import { signUp } from "@/lib/auth";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearError = () => {
    if (error) setError(null);
  };

  const handleRegister = async () => {
    if (loading) return;

    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await signUp(
        email.trim(),
        password,
        {
          full_name: fullName.trim(),
          role: "student",
        },
      );

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        router.replace("/(tabs)");
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerContainer}>
              <View style={styles.brandIcon}>
                <Ionicons
                  name="qr-code-outline"
                  size={34}
                  color={COLORS.textOnPrimary}
                />
              </View>

              <Header title="QR Attendance" />

              <View style={styles.brandBadge}>
                <Ionicons
                  name="person-add-outline"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.brandBadgeText}>
                  JOIN YOUR SCHOOL COMMUNITY
                </Text>
              </View>
            </View>

            <View style={styles.welcomeSection}>
              <Text style={styles.eyebrow}>GET STARTED</Text>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>
                Register to make school event attendance simple and secure.
              </Text>
            </View>

            {success ? (
              <View style={styles.successCard}>
                <View style={styles.successIcon}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={44}
                    color={COLORS.success}
                  />
                </View>

                <Text style={styles.successTitle}>You're registered!</Text>
                <Text style={styles.successText}>
                  Your account has been created for {email.trim()}. If email
                  confirmation is enabled in Supabase, check your inbox for the
                  confirmation link before signing in.
                </Text>

                <AppButton
                  theme="primary"
                  title="Back to Sign In"
                  icon="log-in-outline"
                  onPress={() => router.replace("/login")}
                />
              </View>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Your details</Text>
                <Text style={styles.formSubtitle}>
                  Fill in the information below to register.
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Full name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={fullName}
                      onChangeText={(value) => {
                        setFullName(value);
                        clearError();
                      }}
                      placeholder="Enter your full name"
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="words"
                      autoCorrect={false}
                      textContentType="name"
                      editable={!loading}
                      returnKeyType="next"
                      accessibilityLabel="Full name"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Email address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        clearError();
                      }}
                      placeholder="your.email@school.edu"
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoComplete="email"
                      editable={!loading}
                      returnKeyType="next"
                      accessibilityLabel="Email address"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        clearError();
                      }}
                      placeholder="At least 6 characters"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry={!showPassword}
                      textContentType="newPassword"
                      autoComplete="new-password"
                      editable={!loading}
                      returnKeyType="next"
                      accessibilityLabel="Password"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword((current) => !current)}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={21}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Confirm password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        clearError();
                      }}
                      placeholder="Re-enter your password"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry={!showConfirmPassword}
                      textContentType="newPassword"
                      autoComplete="new-password"
                      editable={!loading}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                      accessibilityLabel="Confirm password"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={21}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color={COLORS.danger}
                    />
                    <Text style={styles.error}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.buttonContainer}>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.loadingText}>
                        Creating your account...
                      </Text>
                    </View>
                  ) : (
                    <AppButton
                      theme="primary"
                      title="Create Account"
                      icon="person-add-outline"
                      onPress={handleRegister}
                    />
                  )}
                </View>

                <View style={styles.securityNote}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color={COLORS.success}
                  />
                  <Text style={styles.securityText}>
                    Your account details are handled securely.
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Already have an account?</Text>
              <Link href="/login" asChild>
                <Text style={styles.signinLink}>Sign in</Text>
              </Link>
            </View>

            <Text style={styles.footer}>
              QR-ATT • Smart School Event Attendance
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  brandIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 10,
  },
  brandBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  welcomeSection: {
    marginBottom: 22,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  formTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  passwordToggle: {
    padding: 5,
    marginLeft: 3,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.dangerBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  error: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 19,
  },
  buttonContainer: {
    marginTop: 5,
  },
  loadingContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 8,
  },
  securityText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: "center",
  },
  successCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: COLORS.successBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  successText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 22,
  },
  signinContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 25,
  },
  signinText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  signinLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
    paddingVertical: 4,
  },
  footer: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 22,
  },
});
