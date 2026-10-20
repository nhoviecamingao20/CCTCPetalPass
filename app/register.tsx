import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/AppButton";
import { COLORS } from "@/constants/colors";
import { signUp } from "@/lib/auth";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        role,
      });

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        router.replace("/(tabs)");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
            <View style={styles.brandHeader}>
              <View style={styles.brandIcon}>
                <Ionicons
                  name="flower-outline"
                  size={30}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.brandName}>CCTC Petal Pass</Text>
              <Text style={styles.brandSubtitle}>
                CONSOLATRIX COLLEGE OF TOLEDO CITY
              </Text>
            </View>

            {success ? (
              <View style={styles.successCard}>
                <View style={styles.successIcon}>
                  <Ionicons
                    name="mail-open-outline"
                    size={34}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.successTitle}>You're almost there!</Text>
                <Text style={styles.successText}>
                  Your registration was submitted for {email.trim()}. If email
                  confirmation is enabled, check your inbox and follow the
                  instructions before signing in.
                </Text>

                <AppButton
                  theme="primary"
                  title="Back to Sign In"
                  icon="log-in-outline"
                  onPress={() => router.replace("/login")}
                />
              </View>
            ) : (
              <>
                <View style={styles.heading}>
                  <Text style={styles.eyebrow}>JOIN THE CAMPUS COMMUNITY</Text>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>
                    Set up your account to check in at school events and keep
                    track of your attendance.
                  </Text>
                </View>

                <View style={styles.formCard}>
                  <View style={styles.formHeading}>
                    <View style={styles.formHeadingIcon}>
                      <Ionicons
                        name="person-add-outline"
                        size={21}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.formHeadingText}>
                      <Text style={styles.formTitle}>Your details</Text>
                      <Text style={styles.formSubtitle}>
                        Enter your information below.
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.label}>FULL NAME</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="person-outline"
                      size={19}
                      color={COLORS.textSecondary}
                    />
                    <TextInput
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Enter your full name"
                      placeholderTextColor={COLORS.textSecondary}
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!loading}
                      returnKeyType="next"
                    />
                  </View>

                  <Text style={styles.label}>SCHOOL EMAIL</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={19}
                      color={COLORS.textSecondary}
                    />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email address"
                      placeholderTextColor={COLORS.textSecondary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      editable={!loading}
                      returnKeyType="next"
                    />
                  </View>

                  <Text style={styles.label}>PASSWORD</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={19}
                      color={COLORS.textSecondary}
                    />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="At least 6 characters"
                      placeholderTextColor={COLORS.textSecondary}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!loading}
                      returnKeyType="next"
                    />
                    <Pressable
                      onPress={() => setShowPassword((value) => !value)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.passwordHint}>
                    Use at least 6 characters.
                  </Text>

                  <Text style={styles.label}>CONFIRM PASSWORD</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={19}
                      color={COLORS.textSecondary}
                    />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Enter your password again"
                      placeholderTextColor={COLORS.textSecondary}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      editable={!loading}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />
                    <Pressable
                      onPress={() => setShowConfirmPassword((value) => !value)}
                      hitSlop={8}
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
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.label}>REGISTERING AS</Text>
                  <View style={styles.roleRow}>
                    <Pressable
                      style={[
                        styles.roleCard,
                        role === "student" && styles.roleCardActive,
                      ]}
                      onPress={() => setRole("student")}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityState={{ selected: role === "student" }}
                    >
                      <Ionicons
                        name="person-outline"
                        size={22}
                        color={
                          role === "student"
                            ? COLORS.primary
                            : COLORS.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.roleTitle,
                          role === "student" && styles.roleTitleActive,
                        ]}
                      >
                        Student
                      </Text>
                      <Text style={styles.roleDescription}>
                        Attend campus events
                      </Text>
                      {role === "student" && (
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color={COLORS.primary}
                          style={styles.roleCheck}
                        />
                      )}
                    </Pressable>

                    <Pressable
                      style={[
                        styles.roleCard,
                        role === "teacher" && styles.roleCardActive,
                      ]}
                      onPress={() => setRole("teacher")}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityState={{ selected: role === "teacher" }}
                    >
                      <Ionicons
                        name="school-outline"
                        size={22}
                        color={
                          role === "teacher"
                            ? COLORS.primary
                            : COLORS.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.roleTitle,
                          role === "teacher" && styles.roleTitleActive,
                        ]}
                      >
                        Teacher
                      </Text>
                      <Text style={styles.roleDescription}>
                        School staff account
                      </Text>
                      {role === "teacher" && (
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color={COLORS.primary}
                          style={styles.roleCheck}
                        />
                      )}
                    </Pressable>
                  </View>

                  {role === "teacher" && (
                    <View style={styles.teacherNote}>
                      <Ionicons
                        name="information-circle-outline"
                        size={19}
                        color={COLORS.primary}
                      />
                      <Text style={styles.teacherNoteText}>
                        Teacher access may require verification by your school
                        administrator.
                      </Text>
                    </View>
                  )}

                  {error && (
                    <View style={styles.errorContainer}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={19}
                        color={COLORS.danger}
                      />
                      <Text style={styles.error}>{error}</Text>
                    </View>
                  )}

                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                      <Text style={styles.loadingText}>
                        Creating your account...
                      </Text>
                    </View>
                  ) : (
                    <AppButton
                      theme="primary"
                      title="Create My Account"
                      icon="person-add-outline"
                      onPress={handleRegister}
                    />
                  )}

                  <View style={styles.securityNote}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color={COLORS.success}
                    />
                    <Text style={styles.securityText}>
                      Your account details are handled through the school's
                      sign-in system.
                    </Text>
                  </View>
                </View>

                <View style={styles.signInRow}>
                  <Text style={styles.signInText}>
                    Already have an account?{" "}
                  </Text>
                  <Link href="/login" style={styles.signInLink}>
                    Sign In
                  </Link>
                </View>
              </>
            )}

            <View style={styles.footer}>
              <Ionicons
                name="flower-outline"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.footerText}>Your Pass to Every Event.</Text>
              <Ionicons
                name="flower-outline"
                size={14}
                color={COLORS.primary}
              />
            </View>
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
    paddingHorizontal: 21,
    paddingBottom: 30,
  },
  brandHeader: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 28,
  },
  brandIcon: {
    width: 61,
    height: 61,
    borderRadius: 21,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: COLORS.textPrimary,
  },
  brandSubtitle: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: COLORS.textSecondary,
    marginTop: 5,
    textAlign: "center",
  },
  heading: {
    marginBottom: 20,
    gap: 7,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
    color: COLORS.primary,
  },
  title: {
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.7,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 19,
    marginBottom: 21,
  },
  formHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 15,
  },
  formHeadingIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  formHeadingText: {
    flex: 1,
    gap: 3,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  formSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: COLORS.textSecondary,
    marginTop: 14,
    marginBottom: 7,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 49,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 11,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  passwordHint: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleCard: {
    flex: 1,
    minHeight: 117,
    position: "relative",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.background,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  roleTitleActive: {
    color: COLORS.primary,
  },
  roleDescription: {
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.textSecondary,
  },
  roleCheck: {
    position: "absolute",
    top: 9,
    right: 9,
  },
  teacherNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 11,
    marginTop: 11,
  },
  teacherNoteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 11,
    marginTop: 14,
    marginBottom: 12,
  },
  error: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.danger,
  },
  loadingContainer: {
    alignItems: "center",
    gap: 9,
    paddingVertical: 15,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: 15,
  },
  securityText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.textSecondary,
  },
  successCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    gap: 14,
  },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    color: COLORS.textPrimary,
  },
  successText: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  signInText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  signInLink: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  footerText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
});
