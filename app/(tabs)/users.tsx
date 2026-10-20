import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import AppButton from "@/components/AppButton";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/lib/auth";
import {
    getProfile,
    updateUserRole,
    type Profile,
    type Role,
} from "@/lib/profiles";
import { supabase } from "@/lib/supabase";

const ROLES: Role[] = ["student", "teacher", "admin"];

export default function UsersScreen() {
  const { user } = useAuth();

  const [users, setUsers] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (refresh = false) => {
      if (!user?.id) {
        setUsers([]);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (refresh) setRefreshing(true);
      else setLoading(true);

      try {
        const currentProfile = await getProfile(user.id);

        if (currentProfile?.role !== "admin") {
          setIsAdmin(false);
          setUsers([]);
          return;
        }

        setIsAdmin(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, full_name, role")
          .order("full_name", { ascending: true });

        if (error) {
          Alert.alert("Unable to Load Users", error.message);
          return;
        }

        setUsers((data ?? []) as Profile[]);
      } catch {
        Alert.alert("Error", "Could not load user accounts. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  useFocusEffect(
    useCallback(() => {
      void loadUsers();
    }, [loadUsers]),
  );

  const changeRole = (profile: Profile, newRole: Role) => {
    if (profile.role === newRole) return;

    if (profile.id === user?.id && newRole !== "admin") {
      Alert.alert(
        "Cannot Change Your Own Role",
        "You cannot remove your own administrator access from this screen.",
      );
      return;
    }

    Alert.alert(
      "Change User Role",
      `Change ${profile.full_name || profile.email} from ${profile.role} to ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change Role",
          onPress: async () => {
            setUpdatingId(profile.id);

            const result = await updateUserRole(profile.id, newRole);

            setUpdatingId(null);

            if (result.error) {
              Alert.alert("Update Failed", result.error);
              return;
            }

            Alert.alert("Success", "The user's role has been updated.");
            await loadUsers(true);
          },
        },
      ],
    );
  };

  const renderUser = ({ item }: { item: Profile }) => {
    const isUpdating = updatingId === item.id;

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={22} color={COLORS.primary} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.full_name?.trim() || "Unnamed User"}
            </Text>
            <Text style={styles.email}>
              {item.email || "No email available"}
            </Text>
            <Text style={styles.userId} numberOfLines={1}>
              ID: {item.id}
            </Text>
          </View>
        </View>

        <View style={styles.roleHeader}>
          <Text style={styles.roleTitle}>Account Role</Text>
          <Text style={styles.currentRole}>{item.role.toUpperCase()}</Text>
        </View>

        <View style={styles.roleButtons}>
          {ROLES.map((role) => {
            const selected = item.role === role;

            return (
              <AppButton
                key={role}
                title={role.charAt(0).toUpperCase() + role.slice(1)}
                icon={
                  role === "admin"
                    ? "shield-checkmark-outline"
                    : role === "teacher"
                      ? "school-outline"
                      : "person-outline"
                }
                onPress={() => changeRole(item, role)}
                disabled={isUpdating || selected}
              />
            );
          })}
        </View>

        {isUpdating && (
          <View style={styles.updating}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.updatingText}>Updating role...</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.muted}>Loading user accounts...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={48} color={COLORS.danger} />
        <Text style={styles.deniedTitle}>Administrator Only</Text>
        <Text style={styles.muted}>
          You do not have permission to manage user accounts.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={renderUser}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadUsers(true)}
          tintColor={COLORS.primary}
        />
      }
      ListHeaderComponent={
        <View style={styles.pageHeader}>
          <View style={styles.headerIcon}>
            <Ionicons name="people" size={28} color={COLORS.primary} />
          </View>

          <Text style={styles.pageTitle}>User Management</Text>
          <Text style={styles.pageDescription}>
            View registered accounts and manage their access roles.
          </Text>

          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{users.length}</Text>
            <Text style={styles.statsLabel}>Registered Accounts</Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons
            name="people-outline"
            size={40}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.muted}>Pull down to refresh the user list.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  pageHeader: {
    marginBottom: 18,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  pageTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: "900",
  },
  pageDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  statsCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  userCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  userId: {
    color: COLORS.textSecondary,
    opacity: 0.75,
    fontSize: 10,
    marginTop: 4,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
    marginBottom: 10,
  },
  roleTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "800",
  },
  currentRole: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  roleButtons: {
    gap: 8,
  },
  updating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  updatingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  muted: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  deniedTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 14,
  },
  empty: {
    alignItems: "center",
    padding: 30,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
  },
});
