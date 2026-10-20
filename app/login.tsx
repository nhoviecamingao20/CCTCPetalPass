<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
=======
import Ionicons from "@expo/vector-icons/Ionicons";
>>>>>>> origin/main
import { Link, useRouter } from "expo-router";
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
<<<<<<< HEAD
=======
  TouchableOpacity,
>>>>>>> origin/main
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/AppButton";
<<<<<<< HEAD
=======
import Header from "@/components/Header";
>>>>>>> origin/main
import { COLORS } from "@/constants/colors";
import { signIn } from "@/lib/auth";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
<<<<<<< HEAD
=======
    if (loading) return;

    setError(null);

>>>>>>> origin/main
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

<<<<<<< HEAD
    setError(null);
=======
>>>>>>> origin/main
    setLoading(true);

    try {
      const { error: authError } = await signIn(email.trim(), password);

      if (authError) {
        setError(authError.message);
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
<<<<<<< HEAD
          : "Unable to sign in. Please try again.",
=======
          : "Something went wrong. Please try again.",
>>>>>>> origin/main
      );
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <View style={[styles.container, { paddingTop: insets.top }]}>
=======
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
>>>>>>> origin/main
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
<<<<<<< HEAD
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 20 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              <View style={styles.brandMark}>
                <Ionicons
                  name="flower-outline"
                  size={29}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.brandTextContainer}>
                <Text style={styles.brandName}>CCTC Petal Pass</Text>
                <Text style={styles.brandCaption}>
                  CONSOLATRIX COLLEGE OF TOLEDO CITY
=======
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerContainer}>
              <View style={styles.brandIcon}>
                <Ionicons
                  name="qr-code-outline"
                  size={38}
                  color={COLORS.textOnPrimary}
                />
              </View>

              <Header title="QR Attendance" />

              <View style={styles.brandBadge}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.brandBadgeText}>
                  SMART SCHOOL ATTENDANCE
>>>>>>> origin/main
                </Text>
              </View>
            </View>

<<<<<<< HEAD
            <View style={styles.hero}>
              <View style={styles.flowerDecoration}>
                <Ionicons name="flower" size={24} color={COLORS.border} />
                <Ionicons
                  name="flower-outline"
                  size={16}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.heroIcon}>
                <Ionicons
                  name="qr-code-outline"
                  size={43}
                  color={COLORS.primary}
                />
                <View style={styles.heroFlower}>
                  <Ionicons name="flower" size={19} color={COLORS.primary} />
                </View>
              </View>

              <Text style={styles.eyebrow}>YOUR CAMPUS, CONNECTED</Text>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in and get ready for your next school event.
=======
            <View style={styles.welcomeSection}>
              <Text style={styles.eyebrow}>WELCOME BACK</Text>
              <Text style={styles.title}>Sign in to your account</Text>
              <Text style={styles.subtitle}>
                Manage your school attendance with ease.
>>>>>>> origin/main
              </Text>
            </View>

            <View style={styles.formCard}>
<<<<<<< HEAD
              <Text style={styles.formTitle}>Sign in to your account</Text>
              <Text style={styles.formSubtitle}>
                Enter your registered school account below.
              </Text>

              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@school.edu"
                  placeholderTextColor={COLORS.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.textSecondary}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoCapitalize="none"
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={21}
                  color={COLORS.textSecondary}
                  onPress={() => setShowPassword(!showPassword)}
                />
=======
              <Text style={styles.formTitle}>Let's get started</Text>
              <Text style={styles.formSubtitle}>
                Enter your account details below.
              </Text>

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
                      if (error) setError(null);
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
                      if (error) setError(null);
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showPassword}
                    textContentType="password"
                    autoComplete="current-password"
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
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
>>>>>>> origin/main
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
<<<<<<< HEAD
                    size={18}
=======
                    size={19}
>>>>>>> origin/main
                    color={COLORS.danger}
                  />
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.buttonContainer}>
                {loading ? (
<<<<<<< HEAD
                  <View style={styles.loadingButton}>
                    <ActivityIndicator
                      size="small"
                      color={COLORS.textOnPrimary}
                    />
                    <Text style={styles.loadingText}>Signing in...</Text>
=======
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Signing you in...</Text>
>>>>>>> origin/main
                  </View>
                ) : (
                  <AppButton
                    theme="primary"
                    title="Sign In"
                    icon="log-in-outline"
                    onPress={handleLogin}
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
<<<<<<< HEAD
                  Secure school event attendance
=======
                  Your account is securely authenticated.
>>>>>>> origin/main
                </Text>
              </View>
            </View>

<<<<<<< HEAD
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>New to Petal Pass? </Text>
              <Link href="/register" style={styles.registerLink}>
                Create an account
              </Link>
            </View>

            <View style={styles.footer}>
              <View style={styles.footerDivider} />
              <Ionicons
                name="flower-outline"
                size={15}
                color={COLORS.primary}
              />
              <View style={styles.footerDivider} />
              <Text style={styles.footerText}>YOUR PASS TO EVERY EVENT</Text>
            </View>
=======
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <Link href="/register" asChild>
                <Text style={styles.signupLink}>Create an account</Text>
              </Link>
            </View>

            <Text style={styles.footer}>
              QR-ATT • Smart School Event Attendance
            </Text>
>>>>>>> origin/main
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
<<<<<<< HEAD
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 23,
    paddingTop: 18,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  brandMark: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextContainer: {
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  brandCaption: {
    fontSize: 8,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
  },
  hero: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 23,
    position: "relative",
  },
  flowerDecoration: {
    position: "absolute",
    right: 13,
    top: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 32,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroFlower: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 7,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 7,
    maxWidth: 290,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  formSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 7,
    marginTop: 13,
  },
  inputContainer: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 13,
    backgroundColor: COLORS.background,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 13,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#FFF0F0",
  },
  error: {
    flex: 1,
    fontSize: 12,
    color: COLORS.danger,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 22,
  },
  loadingButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
=======

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
    marginBottom: 32,
  },

  brandIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
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
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  welcomeSection: {
    marginBottom: 24,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 9,
  },

  title: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textSecondary,
  },

  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
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
    marginBottom: 23,
  },

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 9,
  },

  inputWrapper: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  passwordToggle: {
    padding: 5,
    marginLeft: 4,
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
    marginTop: 6,
  },

  loadingContainer: {
    minHeight: 54,
>>>>>>> origin/main
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
<<<<<<< HEAD
  loadingText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textOnPrimary,
  },
=======

  loadingText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },

>>>>>>> origin/main
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
<<<<<<< HEAD
    marginTop: 16,
  },
  securityText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 23,
  },
  registerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  footer: {
=======
    marginTop: 8,
  },

  securityText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  signupContainer: {
>>>>>>> origin/main
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
<<<<<<< HEAD
    gap: 10,
    marginTop: 27,
    marginBottom: 10,
  },
  footerDivider: {
    width: 34,
    height: 1,
    backgroundColor: COLORS.border,
  },
  footerText: {
    width: "100%",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});
=======
    gap: 5,
    marginTop: 27,
  },

  signupText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  signupLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
    paddingVertical: 4,
  },

  footer: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 25,
  },
});
>>>>>>> origin/main
