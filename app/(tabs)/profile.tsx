<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
=======
import Ionicons from "@expo/vector-icons/Ionicons";
>>>>>>> origin/main
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
<<<<<<< HEAD
=======
  KeyboardAvoidingView,
  Platform,
>>>>>>> origin/main
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppButton from "@/components/AppButton";
import { COLORS } from "@/constants/colors";
import { signOut, useAuth } from "@/lib/auth";
<<<<<<< HEAD
import {
  getMyTeacherVerificationRequest,
  getProfile,
  submitTeacherVerification,
  updateProfile,
  type Profile,
  type TeacherVerificationRequest,
} from "@/lib/profiles";
=======
import { getProfile, updateProfile, type Profile } from "@/lib/profiles";
>>>>>>> origin/main

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draftName, setDraftName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

<<<<<<< HEAD
  const [verificationRequest, setVerificationRequest] =
    useState<TeacherVerificationRequest | null>(null);
  const [teacherDetails, setTeacherDetails] = useState("");
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setVerificationRequest(null);
=======
  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
>>>>>>> origin/main
      setFetchingProfile(false);
      return;
    }

    setFetchingProfile(true);

    try {
<<<<<<< HEAD
      const currentProfile = await getProfile(user.id);

      setProfile(currentProfile);
      setDraftName(currentProfile?.full_name ?? "");

      if (currentProfile?.role === "student") {
        setLoadingVerification(true);

        const result = await getMyTeacherVerificationRequest();

        if (result.error) {
          setVerificationRequest(null);
          Alert.alert("Unable to load teacher verification", result.error);
        } else {
          setVerificationRequest(result.request);
          setTeacherDetails(result.request?.teacher_details ?? "");
        }
      } else {
        setVerificationRequest(null);
        setTeacherDetails("");
      }
    } catch {
      Alert.alert("Unable to load profile", "Please try again.");
    } finally {
      setLoadingVerification(false);
=======
      const p = await getProfile(user.id);
      setProfile(p);
      setDraftName(p?.full_name ?? "");
    } catch {
      Alert.alert("Error", "Unable to load your profile. Please try again.");
    } finally {
>>>>>>> origin/main
      setFetchingProfile(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleSaveName = async () => {
    if (!user) return;

    const trimmedName = draftName.trim();

    if (!trimmedName) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await updateProfile(user.id, {
        full_name: trimmedName,
      });

      if (error) {
        Alert.alert("Unable to save", error);
        return;
      }

<<<<<<< HEAD
      setProfile((previous) =>
        previous ? { ...previous, full_name: trimmedName } : previous,
      );
      setDraftName(trimmedName);
      setEditing(false);

      Alert.alert("Profile updated", "Your name has been saved.");
=======
      setProfile((prev) => (prev ? { ...prev, full_name: trimmedName } : prev));
      setDraftName(trimmedName);
      setEditing(false);
>>>>>>> origin/main
    } catch {
      Alert.alert("Error", "Something went wrong while saving your name.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDraftName(profile?.full_name ?? "");
    setEditing(false);
  };

<<<<<<< HEAD
  const handleSubmitVerification = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in before continuing.");
      return;
    }

    if (profile?.role !== "student") {
      Alert.alert(
        "Student account required",
        "Only student accounts can submit teacher verification requests.",
      );
      return;
    }

    const details = teacherDetails.trim();

    if (!details) {
      Alert.alert(
        "Details required",
        "Please provide information that the administrator can use to verify your teacher status.",
      );
      return;
    }

    if (details.length > 2000) {
      Alert.alert(
        "Details too long",
        "Your verification details cannot exceed 2000 characters.",
      );
      return;
    }

    if (verificationRequest?.status === "pending") {
      Alert.alert(
        "Request already submitted",
        "Your teacher verification request is awaiting administrator review.",
      );
      return;
    }

    if (verificationRequest?.status === "approved") {
      Alert.alert(
        "Already approved",
        "Your teacher verification request has already been approved.",
      );
      return;
    }

    setSubmittingVerification(true);

    try {
      const result = await submitTeacherVerification(details);

      if (result.error) {
        Alert.alert("Submission failed", result.error);
        return;
      }

      if (!result.requestId) {
        Alert.alert(
          "Request submitted",
          "The database accepted the request, but its ID was not returned. Refresh your profile to check its status.",
        );
        await loadProfile();
        return;
      }

      const refreshed = await getMyTeacherVerificationRequest();

      if (refreshed.error) {
        Alert.alert(
          "Request submitted",
          "Your request was submitted successfully. Refresh your profile to view its current status.",
        );
        return;
      }

      setVerificationRequest(refreshed.request);
      setTeacherDetails(refreshed.request?.teacher_details ?? details);

      Alert.alert(
        "Request submitted",
        "Your teacher verification request has been submitted. Your account will remain a student account until an administrator approves it.",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      Alert.alert("Submission failed", message);
    } finally {
      setSubmittingVerification(false);
    }
  };

=======
>>>>>>> origin/main
  const handleSignOut = async () => {
    setLoading(true);

    try {
      await signOut();
      router.replace("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to sign out.";

<<<<<<< HEAD
      Alert.alert("Sign-out failed", message);
=======
      Alert.alert("Sign Out Failed", message);
>>>>>>> origin/main
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const roleLabel =
    profile?.role === "admin"
      ? "Administrator"
      : profile?.role === "teacher"
        ? "Teacher"
        : "Student";

  const initials = (profile?.full_name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
=======
  const role = profile?.role ?? "student";

  const roleLabel =
    role === "admin"
      ? "Administrator"
      : role === "teacher"
        ? "Teacher"
        : "Student";

  const initials = (profile?.full_name || user?.email || "U")
    .trim()
    .split(/\s+/)
>>>>>>> origin/main
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

<<<<<<< HEAD
  const verificationStatus = verificationRequest?.status;

  const verificationColor =
    verificationStatus === "approved"
      ? COLORS.success
      : verificationStatus === "rejected"
        ? COLORS.danger
        : COLORS.warning;

  const canSubmitVerification =
    profile?.role === "student" &&
    verificationStatus !== "pending" &&
    verificationStatus !== "approved";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.pageHeading}>
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.pageTitle}>My Profile</Text>
        <Text style={styles.pageSubtitle}>
          Manage your Petal Pass account information.
        </Text>
      </View>

      {fetchingProfile ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : (
        <>
          <View style={styles.profileCard}>
            <View style={styles.decorativeFlower}>
              <Ionicons
                name="flower-outline"
                size={100}
                color={COLORS.border}
              />
            </View>

            <View style={styles.avatar}>
              {initials ? (
                <Text style={styles.avatarText}>{initials}</Text>
              ) : (
                <Ionicons
                  name="person-outline"
                  size={36}
                  color={COLORS.primary}
                />
              )}

              <View style={styles.avatarFlower}>
                <Ionicons name="flower" size={15} color={COLORS.primary} />
              </View>
            </View>

            <Text style={styles.profileName}>
              {profile?.full_name || "Welcome to Petal Pass"}
            </Text>

            <Text style={styles.profileEmail}>
              {user?.email ?? "No email available"}
            </Text>

            <View style={styles.roleBadge}>
              <Ionicons
                name={
                  profile?.role === "admin"
                    ? "shield-checkmark-outline"
                    : profile?.role === "teacher"
                      ? "school-outline"
                      : "person-outline"
                }
                size={15}
                color={COLORS.primary}
              />
              <Text style={styles.roleBadgeText}>{roleLabel}</Text>
            </View>

            <View style={styles.profileDivider} />

            <Text style={styles.profileTagline}>Your Pass to Every Event.</Text>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="person-circle-outline"
=======
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>My Profile</Text>
          <Text style={styles.pageSubtitle}>
            Manage your account and personal information.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {fetchingProfile ? (
              <ActivityIndicator color={COLORS.primary} size="large" />
            ) : (
              <Text style={styles.avatarText}>{initials || "U"}</Text>
            )}
          </View>

          <Text style={styles.profileName}>
            {fetchingProfile
              ? "Loading profile..."
              : profile?.full_name || "Welcome to QR-ATT"}
          </Text>

          <Text style={styles.profileEmail}>
            {user?.email || "No email available"}
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name={
                role === "admin"
                  ? "shield-checkmark"
                  : role === "teacher"
                    ? "school"
                    : "person"
              }
              size={15}
              color={COLORS.primary}
            />
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.sectionDescription}>
            Your account details registered in QR-ATT.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="person-outline"
>>>>>>> origin/main
                size={21}
                color={COLORS.primary}
              />
            </View>

<<<<<<< HEAD
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>Personal information</Text>
              <Text style={styles.sectionSubtitle}>
                Keep your account details up to date.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.label}>FULL NAME</Text>

            {editing ? (
              <>
=======
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>

              {editing ? (
>>>>>>> origin/main
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholder="Enter your full name"
<<<<<<< HEAD
                  placeholderTextColor={COLORS.textSecondary}
=======
                  placeholderTextColor={COLORS.textMuted}
>>>>>>> origin/main
                  style={styles.nameInput}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!saving}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
<<<<<<< HEAD
                />

                <View style={styles.editActions}>
                  <Pressable
                    onPress={handleCancelEdit}
                    style={styles.cancelButton}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSaveName}
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="checkmark" size={17} color="#FFFFFF" />
                    )}

                    <Text style={styles.saveButtonText}>
                      {saving ? "Saving..." : "Save changes"}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.nameRow}>
                <Text style={styles.infoValue}>
                  {profile?.full_name || "Name not set"}
                </Text>

                <Pressable
                  onPress={() => setEditing(true)}
                  style={styles.editButton}
                  accessibilityRole="button"
                  accessibilityLabel="Edit your full name"
                >
                  <Ionicons
                    name="create-outline"
                    size={17}
                    color={COLORS.primary}
                  />
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.fieldDivider} />

            <Text style={styles.label}>EMAIL ADDRESS</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.detailValue}>
                {user?.email ?? "No email available"}
              </Text>
            </View>

            <View style={styles.fieldDivider} />

            <Text style={styles.label}>ACCOUNT ROLE</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="school-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.detailValue}>{roleLabel}</Text>
            </View>
          </View>

          {profile?.role === "student" && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="ribbon-outline"
                    size={21}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.sectionHeadingText}>
                  <Text style={styles.sectionTitle}>Teacher Verification</Text>
                  <Text style={styles.sectionSubtitle}>
                    Request administrator approval for a teacher account.
                  </Text>
                </View>
              </View>

              <View style={styles.verificationCard}>
                <View style={styles.verificationIntro}>
                  <View style={styles.verificationIcon}>
                    <Ionicons
                      name="school-outline"
                      size={25}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.verificationIntroText}>
                    <Text style={styles.verificationTitle}>
                      Verify your teacher status
                    </Text>
                    <Text style={styles.verificationDescription}>
                      Provide your teaching information for administrator
                      review. Submitting a request does not automatically change
                      your account role.
                    </Text>
                  </View>
                </View>

                {loadingVerification ? (
                  <View style={styles.verificationLoading}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingText}>
                      Checking verification status...
                    </Text>
                  </View>
                ) : (
                  <>
                    {verificationRequest && (
                      <View
                        style={[
                          styles.statusPanel,
                          {
                            borderColor: verificationColor,
                            backgroundColor: `${verificationColor}12`,
                          },
                        ]}
                      >
                        <View style={styles.statusHeader}>
                          <Ionicons
                            name={
                              verificationStatus === "approved"
                                ? "checkmark-circle"
                                : verificationStatus === "rejected"
                                  ? "close-circle"
                                  : "time"
                            }
                            size={21}
                            color={verificationColor}
                          />

                          <Text
                            style={[
                              styles.statusTitle,
                              { color: verificationColor },
                            ]}
                          >
                            {verificationStatus === "approved"
                              ? "Request approved"
                              : verificationStatus === "rejected"
                                ? "Request rejected"
                                : "Awaiting review"}
                          </Text>
                        </View>

                        <Text style={styles.statusDescription}>
                          {verificationStatus === "approved"
                            ? "Your request was approved. Your account role will reflect the administrator's decision after your profile refreshes."
                            : verificationStatus === "rejected"
                              ? "Your request was not approved. Review the administrator's notes below and update your details before resubmitting."
                              : "Your request has been submitted. Your account remains a student account while you wait for the administrator's decision."}
                        </Text>

                        {verificationRequest.review_notes && (
                          <View style={styles.reviewNotes}>
                            <Text style={styles.reviewNotesLabel}>
                              ADMINISTRATOR NOTES
                            </Text>
                            <Text style={styles.reviewNotesText}>
                              {verificationRequest.review_notes}
                            </Text>
                          </View>
                        )}

                        <Text style={styles.requestDate}>
                          Submitted{" "}
                          {new Date(
                            verificationRequest.created_at,
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                    )}

                    {canSubmitVerification && (
                      <>
                        <Text style={styles.label}>
                          {verificationStatus === "rejected"
                            ? "UPDATE YOUR VERIFICATION DETAILS"
                            : "TEACHER VERIFICATION DETAILS"}
                        </Text>

                        <TextInput
                          value={teacherDetails}
                          onChangeText={setTeacherDetails}
                          placeholder={
                            "Describe your teaching role, department, employee or faculty ID (if applicable), and other details that help verify your status."
                          }
                          placeholderTextColor={COLORS.textSecondary}
                          style={styles.verificationInput}
                          multiline
                          textAlignVertical="top"
                          maxLength={2000}
                          editable={!submittingVerification}
                          accessibilityLabel="Teacher verification details"
                        />

                        <Text style={styles.characterCount}>
                          {teacherDetails.length}/2000 characters
                        </Text>

                        <View style={styles.verificationNotice}>
                          <Ionicons
                            name="information-circle-outline"
                            size={18}
                            color={COLORS.primary}
                          />
                          <Text style={styles.verificationNoticeText}>
                            Do not include passwords or other sensitive account
                            credentials. Only an administrator can approve your
                            request.
                          </Text>
                        </View>

                        <AppButton
                          title={
                            submittingVerification
                              ? "Submitting Request..."
                              : verificationStatus === "rejected"
                                ? "Resubmit Verification"
                                : "Submit Verification Request"
                          }
                          icon="paper-plane-outline"
                          onPress={handleSubmitVerification}
                          disabled={submittingVerification}
                        />

                        {submittingVerification && (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.primary}
                          />
                        )}
                      </>
                    )}

                    {verificationStatus === "pending" && (
                      <View style={styles.pendingFooter}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={16}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.pendingFooterText}>
                          Your request cannot be edited while it is awaiting
                          review.
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </>
          )}

          <View style={styles.accountNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={COLORS.primary}
            />

            <View style={styles.noteTextContainer}>
              <Text style={styles.noteTitle}>Account information</Text>
              <Text style={styles.noteText}>
                Your account is used to access school event attendance features.
                Keep your sign-in details private.
=======
                  accessibilityLabel="Full name"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile?.full_name || "Not provided"}
                </Text>
              )}
            </View>

            {!editing && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit full name"
                onPress={() => {
                  setDraftName(profile?.full_name ?? "");
                  setEditing(true);
                }}
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </Pressable>
            )}
          </View>

          {editing && (
            <View style={styles.editActions}>
              <Pressable
                onPress={handleCancelEdit}
                disabled={saving}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveName}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.pressed,
                  saving && styles.disabledButton,
                ]}
              >
                {saving ? (
                  <ActivityIndicator
                    color={COLORS.textOnPrimary}
                    size="small"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color={COLORS.textOnPrimary}
                    />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={21} color={COLORS.primary} />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>
                {user?.email || "Not available"}
>>>>>>> origin/main
              </Text>
            </View>
          </View>

<<<<<<< HEAD
          <View style={styles.signOutSection}>
            <Text style={styles.signOutHeading}>Leaving already?</Text>
            <Text style={styles.signOutDescription}>
              You can sign back in whenever you need Petal Pass.
            </Text>

=======
          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account Role</Text>
              <Text style={styles.infoValue}>{roleLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.accountNote}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={COLORS.primary}
          />
          <Text style={styles.accountNoteText}>
            Your account email and role are managed by the QR-ATT system.
            Contact your administrator if you need assistance with your account
            access.
          </Text>
        </View>

        <View style={styles.signOutSection}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <Text style={styles.sectionDescription}>
            Sign out when you are finished using the app.
          </Text>

          <View style={styles.signOutButton}>
>>>>>>> origin/main
            <AppButton
              title={loading ? "Signing Out..." : "Sign Out"}
              icon="log-out-outline"
              onPress={handleSignOut}
              disabled={loading}
            />
          </View>
<<<<<<< HEAD

          <View style={styles.footer}>
            <Ionicons name="flower-outline" size={15} color={COLORS.primary} />
            <Text style={styles.footerText}>CCTC Petal Pass</Text>
            <Ionicons name="flower-outline" size={15} color={COLORS.primary} />
          </View>
        </>
      )}
    </ScrollView>
=======
        </View>

        <View style={styles.footer}>
          <Ionicons name="checkmark-circle" size={15} color={COLORS.success} />
          <Text style={styles.footerText}>
            QR-ATT · Smart School Event Attendance
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
>>>>>>> origin/main
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
<<<<<<< HEAD
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  pageHeading: {
    marginBottom: 20,
    gap: 5,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  pageTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },
  loadingCard: {
    minHeight: 230,
=======

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  pageHeader: {
    marginBottom: 22,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },

  pageSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },

  profileCard: {
>>>>>>> origin/main
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
<<<<<<< HEAD
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    marginBottom: 27,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  decorativeFlower: {
    position: "absolute",
    top: -23,
    right: -19,
    opacity: 0.55,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 29,
    fontWeight: "900",
    color: COLORS.primary,
  },
  avatarFlower: {
    position: "absolute",
    right: -6,
    bottom: -5,
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "900",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  profileEmail: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 13,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  profileDivider: {
    height: 1,
    width: "100%",
    backgroundColor: COLORS.border,
    marginTop: 20,
    marginBottom: 14,
  },
  profileTagline: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 13,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeadingText: {
    flex: 1,
    gap: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 27,
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
    marginBottom: 9,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
  },
  editButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  nameInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
=======
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 28,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 3,
    borderColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  avatarText: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.primary,
  },

  profileName: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 7,
  },

  profileEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 15,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 5,
  },

  sectionDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    gap: 12,
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  nameInput: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 14,
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

>>>>>>> origin/main
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
<<<<<<< HEAD
    gap: 9,
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.65,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  verificationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 27,
    gap: 15,
  },
  verificationIntro: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  verificationIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  verificationIntroText: {
    flex: 1,
    gap: 5,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  verificationDescription: {
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  verificationLoading: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  statusPanel: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 13,
    gap: 9,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  statusDescription: {
    color: COLORS.textPrimary,
    fontSize: 11,
    lineHeight: 18,
  },
  reviewNotes: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    gap: 5,
  },
  reviewNotesLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  reviewNotesText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    lineHeight: 18,
  },
  requestDate: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  verificationInput: {
    minHeight: 135,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    padding: 13,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textPrimary,
  },
  characterCount: {
    marginTop: -9,
    textAlign: "right",
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  verificationNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 11,
  },
  verificationNoticeText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
  },
  pendingFooter: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  pendingFooterText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
  },
  accountNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    padding: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    marginBottom: 27,
  },
  noteTextContainer: {
    flex: 1,
    gap: 5,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  noteText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  signOutSection: {
    gap: 8,
  },
  signOutHeading: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  signOutDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 27,
  },
  footerText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
});
=======
    gap: 10,
    paddingBottom: 14,
  },

  cancelButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
    fontSize: 12,
  },

  saveButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },

  saveButtonText: {
    color: COLORS.textOnPrimary,
    fontWeight: "700",
    fontSize: 12,
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.78,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  accountNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 16,
    padding: 15,
    marginBottom: 28,
  },

  accountNoteText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },

  signOutSection: {
    marginBottom: 8,
  },

  signOutButton: {
    marginTop: 16,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },

  footerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});
>>>>>>> origin/main
