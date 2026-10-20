import { useAuth } from "@/lib/auth";
import {
    getProfile,
    updateUserRole,
    type Profile,
    type Role,
} from "@/lib/profiles";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type EventRow = {
  id: string;
  event_code: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  created_by: string | null;
  created_at: string;
};

type AttendanceRow = {
  id: string;
  student_id: string;
  event_id: string;
  scanned_at: string;
};

type Section = "overview" | "users" | "events" | "attendance";

const C = {
  primary: "#E84D87",
  primaryDark: "#C92F6A",
  background: "#FFF5F8",
  card: "#FFFFFF",
  text: "#492333",
  muted: "#936D7D",
  border: "#F4C6D6",
  blush: "#FCE5ED",
  green: "#2E7D5B",
  red: "#B3261E",
};

export default function AdminScreen() {
  const { user } = useAuth();

  const [authorized, setAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<Section>("overview");
  const [users, setUsers] = useState<Profile[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!user?.id) {
      setAuthorized(false);
      setCheckingAccess(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const profile = await getProfile(user.id);

      if (!profile || profile.role !== "admin") {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);

      const [usersResult, eventsResult, attendanceResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, full_name, role")
          .order("email"),
        supabase
          .from("events")
          .select(
            "id, event_code, title, start_time, end_time, created_by, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("attendance")
          .select("id, student_id, event_id, scanned_at")
          .order("scanned_at", { ascending: false }),
      ]);

      const queryError =
        usersResult.error || eventsResult.error || attendanceResult.error;

      if (queryError) {
        setErrorMessage(queryError.message);
        return;
      }

      setUsers((usersResult.data ?? []) as Profile[]);
      setEvents((eventsResult.data ?? []) as EventRow[]);
      setAttendance((attendanceResult.data ?? []) as AttendanceRow[]);
    } catch {
      setErrorMessage("Could not load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setCheckingAccess(true);
    void loadDashboard();
  }, [loadDashboard]);

  const changeRole = (profile: Profile) => {
    if (profile.id === user?.id) {
      Alert.alert(
        "Action unavailable",
        "You cannot change your own role here.",
      );
      return;
    }

    const choices: Role[] = ["student", "teacher", "admin"];
    const nextRoles = choices.filter((role) => role !== profile.role);

    Alert.alert(
      "Change user role",
      `Choose a new role for ${profile.full_name || profile.email}.`,
      [
        { text: "Cancel", style: "cancel" },
        ...nextRoles.map((role) => ({
          text: role.charAt(0).toUpperCase() + role.slice(1),
          onPress: async () => {
            const result = await updateUserRole(profile.id, role);

            if (result.error) {
              Alert.alert("Update failed", result.error);
              return;
            }

            Alert.alert("Role updated", `User is now ${role}.`);
            await loadDashboard();
          },
        })),
      ],
    );
  };

  const formatDate = (value: string | null) => {
    if (!value) return "Not set";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Invalid date"
      : date.toLocaleString();
  };

  if (checkingAccess || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading CCTC Petal Pass...</Text>
      </View>
    );
  }

  if (!authorized) {
    return (
      <View style={styles.center}>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={34} color={C.primary} />
        </View>
        <Text style={styles.deniedTitle}>Restricted Access</Text>
        <Text style={styles.deniedText}>
          This dashboard is available to administrators only.
        </Text>
      </View>
    );
  }

  const tabs: {
    key: Section;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: "overview", label: "Overview", icon: "grid-outline" },
    { key: "users", label: "Users", icon: "people-outline" },
    { key: "events", label: "Events", icon: "calendar-outline" },
    { key: "attendance", label: "Attendance", icon: "clipboard-outline" },
  ];

  const studentCount = users.filter((item) => item.role === "student").length;
  const teacherCount = users.filter((item) => item.role === "teacher").length;
  const adminCount = users.filter((item) => item.role === "admin").length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => void loadDashboard()}
          tintColor={C.primary}
        />
      }
    >
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.brandIcon}>
            <Ionicons name="flower-outline" size={29} color="#FFFFFF" />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>ADMINISTRATION</Text>
            <Text style={styles.heroTitle}>Lavender Attend</Text>
            <Text style={styles.heroSubtitle}>Your Pass to Every Event</Text>
          </View>
        </View>
        <View style={styles.adminPill}>
          <Ionicons name="checkmark-circle" size={15} color="#E9DFFF" />
          <Text style={styles.adminPillText}>Administrator access</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = section === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              onPress={() => setSection(tab.key)}
              style={[styles.tab, active && styles.activeTab]}
            >
              <Ionicons
                name={tab.icon}
                size={19}
                color={active ? C.primaryDark : C.muted}
              />
              <Text style={[styles.tabText, active && styles.activeTabText]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {errorMessage ? (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={21} color={C.red} />
          <View style={{ flex: 1 }}>
            <Text style={styles.errorTitle}>Unable to load some data</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
          <Pressable onPress={() => void loadDashboard()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {section === "overview" && (
        <>
          <Text style={styles.sectionTitle}>Dashboard overview</Text>
          <Text style={styles.sectionSubtitle}>
            Live totals from your Supabase database
          </Text>

          <View style={styles.statsGrid}>
            <StatCard
              icon="people"
              label="Total users"
              value={users.length}
              detail={`${studentCount} students · ${teacherCount} teachers`}
            />
            <StatCard
              icon="calendar"
              label="Total events"
              value={events.length}
              detail="Events in the system"
            />
            <StatCard
              icon="clipboard"
              label="Attendance records"
              value={attendance.length}
              detail="All recorded scans"
            />
            <StatCard
              icon="shield-checkmark"
              label="Administrators"
              value={adminCount}
              detail="Accounts with admin access"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick navigation</Text>
            <QuickLink
              icon="people-outline"
              title="Manage users"
              subtitle="Review accounts and change roles"
              onPress={() => setSection("users")}
            />
            <QuickLink
              icon="calendar-outline"
              title="Review events"
              subtitle="See events created in the system"
              onPress={() => setSection("events")}
            />
            <QuickLink
              icon="clipboard-outline"
              title="Attendance records"
              subtitle="Review attendance across all events"
              onPress={() => setSection("attendance")}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Latest events</Text>
            {events.length === 0 ? (
              <EmptyState text="No events have been created yet." />
            ) : (
              events.slice(0, 5).map((event) => (
                <View
                  key={event.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: C.border,
                    gap: 10,
                  }}
                >
                  <View style={styles.smallIcon}>
                    <Ionicons name="calendar" size={19} color={C.primary} />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{event.title}</Text>
                    <Text style={styles.rowSubtitle}>{event.event_code}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}

      {section === "users" && (
        <>
          <Text style={styles.sectionTitle}>User management</Text>
          <Text style={styles.sectionSubtitle}>
            {users.length} registered account{users.length === 1 ? "" : "s"}
          </Text>
          <View style={styles.card}>
            {users.length === 0 ? (
              <EmptyState text="No profiles found." />
            ) : (
              users.map((profile) => (
                <View key={profile.id} style={styles.userRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(profile.full_name || profile.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>
                      {profile.full_name || "Unnamed user"}
                    </Text>
                    <Text style={styles.rowSubtitle}>{profile.email}</Text>
                    <View
                      style={[
                        styles.roleBadge,
                        profile.role === "admin" && styles.adminRoleBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          profile.role === "admin" && styles.adminRoleText,
                        ]}
                      >
                        {profile.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {profile.id !== user?.id && (
                    <Pressable
                      accessibilityRole="button"
                      style={styles.changeRoleButton}
                      onPress={() => changeRole(profile)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={17}
                        color={C.primaryDark}
                      />
                      <Text style={styles.changeRoleText}>Role</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </View>
          <Text style={styles.note}>
            Registration remains limited to student and teacher roles. Only an
            administrator can promote an account.
          </Text>
        </>
      )}

      {section === "events" && (
        <>
          <Text style={styles.sectionTitle}>Event management</Text>
          <Text style={styles.sectionSubtitle}>
            {events.length} event{events.length === 1 ? "" : "s"} in the system
          </Text>
          <View style={styles.card}>
            {events.length === 0 ? (
              <EmptyState text="No events found." />
            ) : (
              events.map((event) => {
                const count = attendance.filter(
                  (item) => item.event_id === event.id,
                ).length;
                return (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={styles.eventHeader}>
                      <View style={[styles.smallIcon, { marginRight: 10 }]}>
                        <Ionicons name="calendar" size={19} color={C.primary} />
                      </View>
                      <View style={styles.rowBody}>
                        <Text style={styles.rowTitle}>{event.title}</Text>
                        <Text style={styles.rowSubtitle}>
                          {event.event_code}
                        </Text>
                      </View>
                      <View style={styles.countPill}>
                        <Text style={styles.countText}>{count} scans</Text>
                      </View>
                    </View>
                    <Text style={styles.detailText}>
                      Starts: {formatDate(event.start_time)}
                    </Text>
                    <Text style={styles.detailText}>
                      Ends: {formatDate(event.end_time)}
                    </Text>
                    <Text style={styles.detailText}>
                      Created: {formatDate(event.created_at)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
          <Text style={styles.note}>
            This initial version provides system-wide event monitoring. Event
            editing and deletion are not enabled here yet.
          </Text>
        </>
      )}

      {section === "attendance" && (
        <>
          <Text style={styles.sectionTitle}>Attendance records</Text>
          <Text style={styles.sectionSubtitle}>
            {attendance.length} record{attendance.length === 1 ? "" : "s"}{" "}
            across all events
          </Text>
          <View style={styles.card}>
            {attendance.length === 0 ? (
              <EmptyState text="No attendance records found." />
            ) : (
              attendance.map((record) => {
                const event = events.find(
                  (item) => item.id === record.event_id,
                );
                const student = users.find(
                  (item) => item.id === record.student_id,
                );
                return (
                  <View key={record.id} style={styles.attendanceRow}>
                    <View style={styles.smallIcon}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={C.green}
                      />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>
                        {student?.full_name ||
                          student?.email ||
                          "Unknown student"}
                      </Text>
                      <Text style={styles.rowSubtitle}>
                        {event?.title || "Unknown event"} ·{" "}
                        {event?.event_code || "No code"}
                      </Text>
                      <Text style={styles.detailText}>
                        {formatDate(record.scanned_at)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </>
      )}

      <Pressable
        style={styles.refreshButton}
        onPress={() => void loadDashboard()}
      >
        <Ionicons name="refresh" size={18} color={C.primaryDark} />
        <Text style={styles.refreshButtonText}>Refresh dashboard</Text>
      </Pressable>

      <Text style={styles.footer}>
        CCTC Petal Pass · Protected Administration Workspace
      </Text>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={21} color={C.primary} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDetail}>{detail}</Text>
    </View>
  );
}

function QuickLink({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickLink} onPress={onPress}>
      <View style={styles.smallIcon}>
        <Ionicons name={icon} size={21} color={C.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color={C.muted} />
    </Pressable>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="file-tray-outline" size={27} color={C.muted} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.background,
    padding: 28,
  },
  loadingText: { marginTop: 12, color: C.muted, fontSize: 14 },
  lockIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: C.blush,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  deniedTitle: { fontSize: 22, fontWeight: "800", color: C.text },
  deniedText: {
    color: C.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
  hero: {
    backgroundColor: C.primaryDark,
    padding: 20,
    borderRadius: 24,
    gap: 18,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#E84D87",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { flex: 1 },
  eyebrow: {
    color: "#FFE0EB",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  heroSubtitle: { color: "#FFEAF1", fontSize: 12, marginTop: 4 },
  adminPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#B92B60",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },
  adminPillText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  tabBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: C.card,
    borderRadius: 17,
    padding: 5,
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
  },
  tab: {
    flexGrow: 1,
    flexBasis: "22%",
    minWidth: 65,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTab: { backgroundColor: C.blush },
  tabText: { color: C.muted, fontSize: 10, fontWeight: "600" },
  activeTabText: { color: C.primaryDark, fontWeight: "800" },
  sectionTitle: { fontSize: 21, fontWeight: "800", color: C.text },
  sectionSubtitle: { fontSize: 12, color: C.muted, marginTop: -10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "48%",
    flexGrow: 1,
    minWidth: 135,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 19,
    padding: 15,
    gap: 7,
  },
  statIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: C.blush,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: { fontSize: 12, color: C.muted, fontWeight: "600" },
  statValue: { fontSize: 29, fontWeight: "800", color: C.text },
  statDetail: { fontSize: 10, color: C.muted, lineHeight: 15 },
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
  },
  cardTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 11,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  smallIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.blush,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { color: C.text, fontSize: 13, fontWeight: "700" },
  rowSubtitle: { color: C.muted, fontSize: 11, lineHeight: 16 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  avatar: {
    width: 41,
    height: 41,
    borderRadius: 15,
    backgroundColor: C.blush,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, color: C.primaryDark, fontWeight: "800" },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF0F5",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginTop: 3,
  },
  roleText: { fontSize: 9, fontWeight: "800", color: C.muted },
  adminRoleBadge: { backgroundColor: C.blush },
  adminRoleText: { color: C.primaryDark },
  changeRoleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.blush,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 10,
  },
  changeRoleText: { color: C.primaryDark, fontSize: 11, fontWeight: "700" },
  note: { color: C.muted, fontSize: 11, lineHeight: 17, paddingHorizontal: 3 },
  eventCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 7,
  },
  eventHeader: { flexDirection: "row", alignItems: "center" },
  countPill: {
    backgroundColor: C.blush,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countText: { fontSize: 10, color: C.primaryDark, fontWeight: "700" },
  detailText: { color: C.muted, fontSize: 10, lineHeight: 15 },
  attendanceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 13,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  emptyState: { alignItems: "center", paddingVertical: 25, gap: 9 },
  emptyText: { color: C.muted, fontSize: 12, textAlign: "center" },
  errorCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#FFF1F3",
    borderRadius: 15,
    padding: 13,
  },
  errorTitle: { color: C.red, fontSize: 12, fontWeight: "800" },
  errorText: { color: C.red, fontSize: 10, marginTop: 3 },
  retryText: { color: C.primaryDark, fontSize: 12, fontWeight: "800" },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  refreshButtonText: { color: C.primaryDark, fontSize: 12, fontWeight: "700" },
  footer: { color: C.muted, textAlign: "center", fontSize: 10, marginTop: 2 },
});
