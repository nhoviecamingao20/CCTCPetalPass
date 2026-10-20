import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { getProfile, updateProfile, type Profile } from "@/lib/profiles";

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draftName, setDraftName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setFetchingProfile(false);
      return;
    }

    setFetchingProfile(true);

    try {
      const p = await getProfile(user.id);
      setProfile(p);
      setDraftName(p?.full_name ?? "");
    } catch {
      Alert.alert("Unable to load profile", "Please try again.");
    } finally {
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

      setProfile((previous) =>
        previous ? { ...previous, full_name: trimmedName } : previous,
      );
      setDraftName(trimmedName);
      setEditing(false);
      Alert.alert("Profile updated", "Your name has been saved.");
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

  const handleSignOut = async () => {
    setLoading(true);

    try {
      await signOut();
      router.replace("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to sign out.";
      Alert.alert("Sign-out failed", message);
    } finally {
      setLoading(false);
    }
  };

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
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

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
                size={21}
                color={COLORS.primary}
              />
            </View>
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
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.nameInput}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!saving}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
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
              </Text>
            </View>
          </View>

          <View style={styles.signOutSection}>
            <Text style={styles.signOutHeading}>Leaving already?</Text>
            <Text style={styles.signOutDescription}>
              You can sign back in whenever you need Petal Pass.
            </Text>

            <AppButton
              title={loading ? "Signing Out..." : "Sign Out"}
              icon="log-out-outline"
              onPress={handleSignOut}
              disabled={loading}
            />
          </View>

          <View style={styles.footer}>
            <Ionicons name="flower-outline" size={15} color={COLORS.primary} />
            <Text style={styles.footerText}>CCTC Petal Pass</Text>
            <Ionicons name="flower-outline" size={15} color={COLORS.primary} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 17,
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
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
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
