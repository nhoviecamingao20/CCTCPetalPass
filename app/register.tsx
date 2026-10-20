<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
=======

import Ionicons from "@expo/vector-icons/Ionicons";
>>>>>>> origin/main
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
<<<<<<< HEAD
  Modal,
  Platform,
  Pressable,
=======
  Platform,
>>>>>>> origin/main
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
import { COLORS } from "@/constants/colors";
import {
  signUp,
  type StudentDepartment,
  type StudentYearLevel,
} from "@/lib/auth";

const DEPARTMENTS: {
  value: StudentDepartment;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "BSIT",
    name: "Bachelor of Science in Information Technology",
    icon: "laptop-outline",
  },
  {
    value: "BSHM",
    name: "Bachelor of Science in Hospitality Management",
    icon: "restaurant-outline",
  },
  {
    value: "BSEntrep",
    name: "Bachelor of Science in Entrepreneurship",
    icon: "briefcase-outline",
  },
];

const YEAR_LEVELS: StudentYearLevel[] = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];
=======
import Header from "@/components/Header";
import { COLORS } from "@/constants/colors";
import { signUp } from "@/lib/auth";
>>>>>>> origin/main

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();

<<<<<<< HEAD
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [department, setDepartment] = useState<StudentDepartment>("BSIT");
  const [yearLevel, setYearLevel] = useState<StudentYearLevel>("1st Year");

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
=======
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

>>>>>>> origin/main
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  const selectedDepartment = DEPARTMENTS.find(
    (item) => item.value === department,
  )!;
=======
  const clearError = () => {
    if (error) setError(null);
  };
>>>>>>> origin/main

  const handleRegister = async () => {
    if (loading) return;

    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
<<<<<<< HEAD
      setError("Your password must contain at least 6 characters.");
=======
      setError("Your password must be at least 6 characters.");
>>>>>>> origin/main
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

<<<<<<< HEAD
    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    Keyboard.dismiss();

    try {
      const { data, error: authError } = await signUp(
        normalizedEmail,
=======
    setLoading(true);

    try {
      const { data, error: authError } = await signUp(
        email.trim(),
>>>>>>> origin/main
        password,
        {
          full_name: fullName.trim(),
          role: "student",
<<<<<<< HEAD
          department,
          year_level: yearLevel,
=======
>>>>>>> origin/main
        },
      );

      if (authError) {
        setError(authError.message);
<<<<<<< HEAD
        return;
      }

      if (data.session) {
=======
      } else if (data.session) {
>>>>>>> origin/main
        router.replace("/(tabs)");
      } else {
        setSuccess(true);
      }
<<<<<<< HEAD
    } catch (registrationError) {
      console.error("Registration failed:", registrationError);

      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Something went wrong. Please try again.",
=======
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
>>>>>>> origin/main
      );
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const closeDepartmentModal = () => setShowDepartmentModal(false);
  const closeYearModal = () => setShowYearModal(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
              </Text>
            </View>

            {success ? (
              <View style={styles.successCard}>
                <View style={styles.successIcon}>
                  <Ionicons
<<<<<<< HEAD
                    name="mail-open-outline"
                    size={34}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.successTitle}>
                  You&apos;re almost there!
                </Text>

                <Text style={styles.successText}>
                  Your registration was submitted for {email.trim()}. If email
                  confirmation is enabled, check your inbox and follow the
                  instructions before signing in.
                </Text>

                <View style={styles.registrationSummary}>
                  <SummaryRow label="Department" value={department} />
                  <SummaryRow label="Year Level" value={yearLevel} />
                  <SummaryRow
                    label="Block"
                    value="Assigned during registration"
                  />
                </View>

=======
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

>>>>>>> origin/main
                <AppButton
                  theme="primary"
                  title="Back to Sign In"
                  icon="log-in-outline"
                  onPress={() => router.replace("/login")}
                />
              </View>
            ) : (
<<<<<<< HEAD
              <>
                <View style={styles.heading}>
                  <Text style={styles.eyebrow}>JOIN THE CAMPUS COMMUNITY</Text>

                  <Text style={styles.title}>Create Account</Text>

                  <Text style={styles.subtitle}>
                    Register your student account to check in at school events
                    and keep track of your attendance.
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
                      maxLength={120}
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
                      autoCorrect={false}
                      editable={!loading}
                      returnKeyType="next"
                    />

                    <Pressable
                      onPress={() => setShowPassword((value) => !value)}
                      disabled={loading}
                      hitSlop={8}
=======
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
>>>>>>> origin/main
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
<<<<<<< HEAD
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
                      autoCorrect={false}
                      editable={!loading}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />

                    <Pressable
                      onPress={() => setShowConfirmPassword((value) => !value)}
                      disabled={loading}
                      hitSlop={8}
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.label}>DEPARTMENT</Text>

                  <Pressable
                    style={styles.selectorField}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowDepartmentModal(true);
                      setError(null);
                    }}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Choose department"
                  >
                    <View style={styles.selectorIcon}>
                      <Ionicons
                        name="school-outline"
                        size={21}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.selectorText}>
                      <Text style={styles.selectorValue}>
                        {selectedDepartment.value}
                      </Text>
                      <Text style={styles.selectorHint}>
                        {selectedDepartment.name}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={COLORS.primary}
                    />
                  </Pressable>

                  <Text style={styles.label}>YEAR LEVEL</Text>

                  <Text style={styles.selectionHint}>
                    Select your current year level.
                  </Text>

                  <Pressable
                    style={styles.selectorField}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowYearModal(true);
                      setError(null);
                    }}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Choose year level"
                  >
                    <View style={styles.selectorIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={21}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.selectorText}>
                      <Text style={styles.selectorValue}>{yearLevel}</Text>
                      <Text style={styles.selectorHint}>
                        Tap to change your year level
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={COLORS.primary}
                    />
                  </Pressable>

                  <View style={styles.blockInfo}>
                    <View style={styles.blockInfoIcon}>
                      <Ionicons
                        name="shuffle-outline"
                        size={21}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.blockInfoContent}>
                      <Text style={styles.blockInfoTitle}>
                        Automatic block assignment
                      </Text>

                      <Text style={styles.blockInfoText}>
                        Your block will be randomly assigned as A, B, or C
                        during registration and saved to your student profile.
                      </Text>
                    </View>
                  </View>

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
=======
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
>>>>>>> origin/main
                      <Text style={styles.loadingText}>
                        Creating your account...
                      </Text>
                    </View>
                  ) : (
                    <AppButton
                      theme="primary"
<<<<<<< HEAD
                      title="Create My Account"
=======
                      title="Create Account"
>>>>>>> origin/main
                      icon="person-add-outline"
                      onPress={handleRegister}
                    />
                  )}
<<<<<<< HEAD

                  <View style={styles.securityNote}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color={COLORS.success}
                    />
                    <Text style={styles.securityText}>
                      Your student profile is saved through the school&apos;s
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

      {/* Department selection modal */}
      <Modal
        visible={showDepartmentModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDepartmentModal}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeDepartmentModal}
            accessibilityLabel="Close department selection"
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons
                  name="school-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Choose Department</Text>
                <Text style={styles.modalSubtitle}>
                  Select your college program.
                </Text>
              </View>

              <Pressable
                onPress={closeDepartmentModal}
                hitSlop={10}
                style={styles.modalClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalOptionsScroll}
              contentContainerStyle={styles.modalOptionsContent}
              showsVerticalScrollIndicator={false}
            >
              {DEPARTMENTS.map((item) => {
                const selected = department === item.value;

                return (
                  <Pressable
                    key={item.value}
                    style={[
                      styles.departmentOption,
                      selected && styles.optionSelected,
                    ]}
                    onPress={() => {
                      setDepartment(item.value);
                      setError(null);
                      closeDepartmentModal();
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        selected && styles.optionIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={23}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.optionText}>
                      <Text
                        style={[
                          styles.optionCode,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {item.value}
                      </Text>
                      <Text style={styles.optionDescription}>{item.name}</Text>
                    </View>

                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioOuterSelected,
                      ]}
                    >
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              style={styles.modalCancelButton}
              onPress={closeDepartmentModal}
              accessibilityRole="button"
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Year-level selection modal */}
      <Modal
        visible={showYearModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeYearModal}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeYearModal}
            accessibilityLabel="Close year-level selection"
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Choose Year Level</Text>
                <Text style={styles.modalSubtitle}>
                  Select your current academic year.
                </Text>
              </View>

              <Pressable
                onPress={closeYearModal}
                hitSlop={10}
                style={styles.modalClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.yearOptions}>
              {YEAR_LEVELS.map((year, index) => {
                const selected = yearLevel === year;

                return (
                  <Pressable
                    key={year}
                    style={[
                      styles.yearOption,
                      selected && styles.optionSelected,
                    ]}
                    onPress={() => {
                      setYearLevel(year);
                      setError(null);
                      closeYearModal();
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <View
                      style={[
                        styles.yearNumber,
                        selected && styles.yearNumberSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.yearNumberText,
                          selected && styles.yearNumberTextSelected,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.yearOptionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {year}
                    </Text>

                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioOuterSelected,
                      ]}
                    >
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={styles.modalCancelButton}
              onPress={closeYearModal}
              accessibilityRole="button"
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
    color: COLORS.textSecondary,
  },
  formCard: {
    backgroundColor: COLORS.card,
<<<<<<< HEAD
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
    marginTop: 17,
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
=======
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
>>>>>>> origin/main
  },
  input: {
    flex: 1,
    minWidth: 0,
<<<<<<< HEAD
    paddingVertical: 11,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  passwordHint: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  selectorField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    minHeight: 69,
    padding: 11,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },
  selectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
  },
  selectorText: {
    flex: 1,
    gap: 4,
  },
  selectorValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  selectorHint: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
  selectionHint: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  blockInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    marginTop: 15,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  blockInfoIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  blockInfoContent: {
    flex: 1,
    gap: 4,
  },
  blockInfoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  blockInfoText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
=======
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  passwordToggle: {
    padding: 5,
    marginLeft: 3,
>>>>>>> origin/main
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
  },
  successCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
<<<<<<< HEAD
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
  registrationSummary: {
    alignSelf: "stretch",
    paddingHorizontal: 13,
    paddingVertical: 5,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "right",
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

  // Selection modal styles
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(30, 20, 45, 0.55)",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    backgroundColor: COLORS.card,
    borderRadius: 25,
    padding: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#21152F",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 18,
  },
  modalHeaderIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderText: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOptionsScroll: {
    flexShrink: 1,
  },
  modalOptionsContent: {
    gap: 10,
    paddingBottom: 4,
  },
  departmentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  optionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconSelected: {
    backgroundColor: COLORS.card,
  },
  optionText: {
    flex: 1,
    gap: 5,
  },
  optionCode: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  optionDescription: {
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.textSecondary,
  },
  optionTextSelected: {
    color: COLORS.primary,
  },
  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  modalCancelButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },
  yearOptions: {
    gap: 10,
  },
  yearOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 61,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.background,
  },
  yearNumber: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  yearNumberSelected: {
    backgroundColor: COLORS.card,
  },
  yearNumberText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textSecondary,
  },
  yearNumberTextSelected: {
    color: COLORS.primary,
  },
  yearOptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
=======
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
>>>>>>> origin/main
  },
});
