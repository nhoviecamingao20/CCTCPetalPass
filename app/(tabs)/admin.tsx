import { useAuth } from "@/lib/auth";
import {
    getProfile,
    getTeacherVerificationRequests,
    reviewTeacherVerificationRequest,
    updateStudentAcademicDetails,
    updateUserRole,
    type Profile,
    type Role,
    type StudentBlock,
    type StudentDepartment,
    type StudentYearLevel,
    type TeacherVerificationRequest,
} from "@/lib/profiles";
import { buildQRPayload } from "@/lib/qr";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

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

type Section = "overview" | "users" | "verification" | "events" | "attendance";

type EditorMode = "event" | "attendance" | null;
type ReviewDecision = "approved" | "rejected";

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
  warning: "#C97A2B",
};

const roleOptions: Role[] = ["student", "teacher", "admin"];
const departmentOptions: StudentDepartment[] = ["BSIT", "BSHM", "BSEntrep"];
const yearLevelOptions: StudentYearLevel[] = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];
const blockOptions: StudentBlock[] = ["A", "B", "C"];

export default function AdminScreen() {
  const { user } = useAuth();

  const [authorized, setAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<Section>("overview");

  const [users, setUsers] = useState<Profile[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<
    TeacherVerificationRequest[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const [academicModalVisible, setAcademicModalVisible] = useState(false);
  const [academicStudent, setAcademicStudent] = useState<Profile | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<StudentDepartment>("BSIT");
  const [selectedYearLevel, setSelectedYearLevel] =
    useState<StudentYearLevel>("1st Year");
  const [selectedBlock, setSelectedBlock] = useState<StudentBlock>("A");

  const [qrEvent, setQrEvent] = useState<EventRow | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [editingAttendance, setEditingAttendance] =
    useState<AttendanceRow | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [attendanceTime, setAttendanceTime] = useState("");

  const [reviewingRequest, setReviewingRequest] =
    useState<TeacherVerificationRequest | null>(null);
  const [reviewDecision, setReviewDecision] =
    useState<ReviewDecision>("approved");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

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

      const [usersResult, eventsResult, attendanceResult, verificationResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, email, full_name, role, department, year_level, block")
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
          getTeacherVerificationRequests(),
        ]);

      const queryError =
        usersResult.error ||
        eventsResult.error ||
        attendanceResult.error ||
        verificationResult.error;

      if (queryError) {
        setErrorMessage(
          typeof queryError === "string" ? queryError : queryError.message,
        );
        return;
      }

      setUsers((usersResult.data ?? []) as Profile[]);
      setEvents((eventsResult.data ?? []) as EventRow[]);
      setAttendance((attendanceResult.data ?? []) as AttendanceRow[]);
      setVerificationRequests(verificationResult.requests);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load dashboard data.",
      );
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setCheckingAccess(true);
    void loadDashboard();
  }, [loadDashboard]);

  const formatDate = (value: string | null) => {
    if (!value) return "Not set";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Invalid date"
      : date.toLocaleString();
  };

  const closeRoleModal = () => {
    if (saving) return;
    setRoleModalVisible(false);
    setSelectedProfile(null);
  };

  const changeRole = (profile: Profile) => {
    if (profile.id === user?.id) {
      Alert.alert("Action unavailable", "You cannot change your own role.");
      return;
    }
    setSelectedProfile(profile);
    setRoleModalVisible(true);
  };

  const saveRole = async (newRole: Role) => {
    if (!selectedProfile || saving) return;
    if (selectedProfile.id === user?.id) {
      Alert.alert("Action unavailable", "You cannot change your own role.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateUserRole(selectedProfile.id, newRole);
      if (result.error) {
        Alert.alert("Role update failed", result.error);
        return;
      }

      const name = selectedProfile.full_name || selectedProfile.email;
      setRoleModalVisible(false);
      setSelectedProfile(null);
      await loadDashboard();
      Alert.alert("Role updated", `${name} is now ${newRole}.`);
    } catch (error) {
      Alert.alert(
        "Role update failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openAcademicEditor = (profile: Profile) => {
    if (profile.role !== "student") {
      Alert.alert(
        "Students only",
        "Academic details can only be edited for student accounts.",
      );
      return;
    }

    setAcademicStudent(profile);
    setSelectedDepartment(
      profile.department &&
        departmentOptions.includes(profile.department as StudentDepartment)
        ? (profile.department as StudentDepartment)
        : "BSIT",
    );
    setSelectedYearLevel(
      profile.year_level && yearLevelOptions.includes(profile.year_level)
        ? profile.year_level
        : "1st Year",
    );
    setSelectedBlock(
      profile.block && blockOptions.includes(profile.block)
        ? profile.block
        : "A",
    );
    setAcademicModalVisible(true);
  };

  const closeAcademicEditor = () => {
    if (saving) return;
    setAcademicModalVisible(false);
    setAcademicStudent(null);
  };

  const saveAcademicDetails = async () => {
    if (!academicStudent || saving) return;

    setSaving(true);
    try {
      const result = await updateStudentAcademicDetails(
        academicStudent.id,
        selectedDepartment,
        selectedYearLevel,
        selectedBlock,
      );

      if (result.error) {
        Alert.alert("Student update failed", result.error);
        return;
      }

      const name = academicStudent.full_name || academicStudent.email;
      setAcademicModalVisible(false);
      setAcademicStudent(null);
      await loadDashboard();
      Alert.alert(
        "Student details updated",
        `${name}: ${selectedDepartment}, ${selectedYearLevel}, Block ${selectedBlock}.`,
      );
    } catch (error) {
      Alert.alert(
        "Student update failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openReviewModal = (
    request: TeacherVerificationRequest,
    decision: ReviewDecision,
  ) => {
    setReviewingRequest(request);
    setReviewDecision(decision);
    setReviewNotes("");
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    if (saving) return;
    setReviewModalVisible(false);
    setReviewingRequest(null);
    setReviewNotes("");
  };

  const submitReview = async () => {
    if (!reviewingRequest || saving) return;

    if (reviewNotes.trim().length > 2000) {
      Alert.alert(
        "Notes too long",
        "Review notes cannot exceed 2000 characters.",
      );
      return;
    }

    setSaving(true);
    try {
      const result = await reviewTeacherVerificationRequest(
        reviewingRequest.id,
        reviewDecision,
        reviewNotes.trim() || undefined,
      );

      if (result.error) {
        Alert.alert("Review failed", result.error);
        return;
      }

      const name =
        users.find((item) => item.id === reviewingRequest.user_id)?.full_name ||
        users.find((item) => item.id === reviewingRequest.user_id)?.email ||
        "The applicant";

      setReviewModalVisible(false);
      setReviewingRequest(null);
      setReviewNotes("");
      await loadDashboard();

      Alert.alert(
        reviewDecision === "approved" ? "Request approved" : "Request rejected",
        reviewDecision === "approved"
          ? `${name} has been approved. Their account role should now be Teacher.`
          : `${name}'s teacher verification request was rejected.`,
      );
    } catch (error) {
      Alert.alert(
        "Review failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openQr = (event: EventRow) => {
    setQrEvent(event);
    setQrModalVisible(true);
  };

  const openEventEditor = (event: EventRow) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventStart(event.start_time ?? "");
    setEventEnd(event.end_time ?? "");
    setEditorMode("event");
    setEditorVisible(true);
  };

  const openAttendanceEditor = (record: AttendanceRow) => {
    setEditingAttendance(record);
    setAttendanceTime(record.scanned_at);
    setEditorMode("attendance");
    setEditorVisible(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditorVisible(false);
    setEditorMode(null);
    setEditingEvent(null);
    setEditingAttendance(null);
  };

  const saveEvent = async () => {
    if (!editingEvent || saving) return;
    const title = eventTitle.trim();

    if (!title) {
      Alert.alert("Missing title", "Please enter an event title.");
      return;
    }

    const start = eventStart.trim() || null;
    const end = eventEnd.trim() || null;

    if (start && !Number.isFinite(Date.parse(start))) {
      Alert.alert("Invalid start time", "Enter a valid ISO date and time.");
      return;
    }
    if (end && !Number.isFinite(Date.parse(end))) {
      Alert.alert("Invalid end time", "Enter a valid ISO date and time.");
      return;
    }
    if (start && end && Date.parse(end) <= Date.parse(start)) {
      Alert.alert(
        "Invalid schedule",
        "End time must be later than start time.",
      );
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({ title, start_time: start, end_time: end })
        .eq("id", editingEvent.id);

      if (error) {
        Alert.alert("Event update failed", error.message);
        return;
      }

      setEditorVisible(false);
      setEditorMode(null);
      setEditingEvent(null);
      await loadDashboard();
      Alert.alert("Event updated", "The event details were saved.");
    } catch (error) {
      Alert.alert(
        "Event update failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (event: EventRow) => {
    if (saving) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (error) {
        Alert.alert("Event deletion failed", error.message);
        return;
      }

      await loadDashboard();
      Alert.alert("Event deleted", event.title);
    } catch (error) {
      Alert.alert(
        "Event deletion failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteEvent = (event: EventRow) => {
    Alert.alert(
      "Delete event?",
      `Delete "${event.title}" (${event.event_code})? The database may reject deletion if attendance records reference this event.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete event",
          style: "destructive",
          onPress: () => void deleteEvent(event),
        },
      ],
    );
  };

  const saveAttendance = async () => {
    if (!editingAttendance || saving) return;
    const timestamp = attendanceTime.trim();

    if (!timestamp || !Number.isFinite(Date.parse(timestamp))) {
      Alert.alert("Invalid date and time", "Enter a valid timestamp.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("attendance")
        .update({ scanned_at: new Date(timestamp).toISOString() })
        .eq("id", editingAttendance.id);

      if (error) {
        Alert.alert("Attendance update failed", error.message);
        return;
      }

      setEditorVisible(false);
      setEditorMode(null);
      setEditingAttendance(null);
      await loadDashboard();
      Alert.alert("Attendance updated", "The timestamp was saved.");
    } catch (error) {
      Alert.alert(
        "Attendance update failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAttendance = async (record: AttendanceRow) => {
    if (saving) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("id", record.id);

      if (error) {
        Alert.alert("Attendance deletion failed", error.message);
        return;
      }

      await loadDashboard();
      Alert.alert("Record deleted", "The attendance record was removed.");
    } catch (error) {
      Alert.alert(
        "Attendance deletion failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAttendance = (record: AttendanceRow) => {
    const student = users.find((item) => item.id === record.student_id);
    const event = events.find((item) => item.id === record.event_id);

    Alert.alert(
      "Delete attendance record?",
      `Remove ${student?.full_name || student?.email || "this student's"} attendance for ${event?.title || "this event"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete record",
          style: "destructive",
          onPress: () => void deleteAttendance(record),
        },
      ],
    );
  };

  if (checkingAccess || (loading && !authorized)) {
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
    {
      key: "verification",
      label: "Verification",
      icon: "shield-checkmark-outline",
    },
    { key: "events", label: "Events", icon: "calendar-outline" },
    { key: "attendance", label: "Attendance", icon: "clipboard-outline" },
  ];

  const studentCount = users.filter((item) => item.role === "student").length;
  const teacherCount = users.filter((item) => item.role === "teacher").length;
  const adminCount = users.filter((item) => item.role === "admin").length;
  const pendingCount = verificationRequests.filter(
    (item) => item.status === "pending",
  ).length;

  const qrPayload = qrEvent
    ? buildQRPayload({
        eventId: qrEvent.event_code,
        title: qrEvent.title,
        start: qrEvent.start_time ?? undefined,
        end: qrEvent.end_time ?? undefined,
      })
    : "";

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
              <Text style={styles.heroTitle}>CCTC Petal Pass</Text>
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
                <View style={styles.tabIconRow}>
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={active ? C.primaryDark : C.muted}
                  />
                  {tab.key === "verification" && pendingCount > 0 && (
                    <View style={styles.notificationDot} />
                  )}
                </View>
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
            <Pressable onPress={() => void loadDashboard}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {section === "overview" && (
          <>
            <Text style={styles.sectionTitle}>Dashboard overview</Text>
            <Text style={styles.sectionSubtitle}>
              Live totals from Supabase
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
                detail="Recorded scans"
              />
              <StatCard
                icon="shield-checkmark"
                label="Pending verification"
                value={pendingCount}
                detail={`${adminCount} administrator accounts`}
              />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Quick navigation</Text>
              <QuickLink
                icon="people-outline"
                title="Manage users"
                subtitle="Accounts, academic details, and roles"
                onPress={() => setSection("users")}
              />
              <QuickLink
                icon="shield-checkmark-outline"
                title="Teacher verification"
                subtitle={
                  pendingCount
                    ? `${pendingCount} request(s) waiting for review`
                    : "Review teacher applications"
                }
                onPress={() => setSection("verification")}
              />
              <QuickLink
                icon="calendar-outline"
                title="Manage events"
                subtitle="Edit events and display QR codes"
                onPress={() => setSection("events")}
              />
              <QuickLink
                icon="clipboard-outline"
                title="Attendance records"
                subtitle="Edit or delete attendance records"
                onPress={() => setSection("attendance")}
              />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Latest events</Text>
              {events.length === 0 ? (
                <EmptyState text="No events have been created yet." />
              ) : (
                events.slice(0, 5).map((event) => (
                  <View key={event.id} style={styles.quickEvent}>
                    <View style={styles.smallIcon}>
                      <Ionicons name="calendar" size={19} color={C.primary} />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{event.title}</Text>
                      <Text style={styles.rowSubtitle}>{event.event_code}</Text>
                    </View>
                    <Pressable
                      onPress={() => openQr(event)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="qr-code-outline"
                        size={20}
                        color={C.primaryDark}
                      />
                    </Pressable>
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
              {users.length} registered account(s)
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
                      {profile.role === "student" && (
                        <Text style={styles.academicInfoText}>
                          {profile.department || "No department"} ·{" "}
                          {profile.year_level || "Year not set"} · Block{" "}
                          {profile.block || "Not assigned"}
                        </Text>
                      )}
                    </View>
                    <View style={styles.userActions}>
                      {profile.role === "student" && (
                        <ActionButton
                          icon="school-outline"
                          label="Academic"
                          onPress={() => openAcademicEditor(profile)}
                        />
                      )}
                      {profile.id !== user?.id ? (
                        <ActionButton
                          icon="create-outline"
                          label="Role"
                          onPress={() => changeRole(profile)}
                        />
                      ) : (
                        <Text style={styles.youLabel}>You</Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
            <Text style={styles.note}>
              Student academic details can be edited here. Teacher verification
              requests are reviewed in the Verification tab.
            </Text>
          </>
        )}

        {section === "verification" && (
          <>
            <Text style={styles.sectionTitle}>Teacher verification</Text>
            <Text style={styles.sectionSubtitle}>
              Review applications before granting teacher access.
            </Text>
            <View style={styles.summaryPill}>
              <Ionicons name="time-outline" size={17} color={C.warning} />
              <Text style={styles.summaryPillText}>
                {pendingCount} pending request{pendingCount === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={styles.card}>
              {verificationRequests.length === 0 ? (
                <EmptyState text="No teacher verification requests have been submitted." />
              ) : (
                verificationRequests.map((request) => {
                  const applicant = users.find(
                    (item) => item.id === request.user_id,
                  );
                  const pending = request.status === "pending";
                  return (
                    <View key={request.id} style={styles.requestCard}>
                      <View style={styles.requestHeader}>
                        <View style={styles.avatar}>
                          <Ionicons
                            name="person-outline"
                            size={21}
                            color={C.primaryDark}
                          />
                        </View>
                        <View style={styles.rowBody}>
                          <Text style={styles.rowTitle}>
                            {applicant?.full_name ||
                              applicant?.email ||
                              "Unknown applicant"}
                          </Text>
                          <Text style={styles.rowSubtitle}>
                            {applicant?.email || request.user_id}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            pending
                              ? styles.pendingBadge
                              : request.status === "approved"
                                ? styles.approvedBadge
                                : styles.rejectedBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              pending
                                ? styles.pendingText
                                : request.status === "approved"
                                  ? styles.approvedText
                                  : styles.rejectedText,
                            ]}
                          >
                            {request.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.fieldLabel}>Applicant's details</Text>
                      <Text style={styles.requestDetails}>
                        {request.teacher_details}
                      </Text>
                      <Text style={styles.detailText}>
                        Submitted: {formatDate(request.created_at)}
                      </Text>
                      {request.reviewed_at && (
                        <Text style={styles.detailText}>
                          Reviewed: {formatDate(request.reviewed_at)}
                        </Text>
                      )}
                      {request.review_notes ? (
                        <View style={styles.reviewNote}>
                          <Text style={styles.reviewNoteTitle}>
                            Administrator notes
                          </Text>
                          <Text style={styles.requestDetails}>
                            {request.review_notes}
                          </Text>
                        </View>
                      ) : null}
                      {pending && (
                        <View style={styles.actionRow}>
                          <ActionButton
                            icon="checkmark-circle-outline"
                            label="Approve"
                            onPress={() => openReviewModal(request, "approved")}
                          />
                          <ActionButton
                            icon="close-circle-outline"
                            label="Reject"
                            danger
                            onPress={() => openReviewModal(request, "rejected")}
                          />
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
            <Text style={styles.note}>
              Approving a pending request calls the protected Supabase function,
              which changes the applicant's role to teacher. Rejected applicants
              can submit a new request from their profile.
            </Text>
          </>
        )}

        {section === "events" && (
          <>
            <Text style={styles.sectionTitle}>Event management</Text>
            <Text style={styles.sectionSubtitle}>{events.length} event(s)</Text>
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
                        <View style={styles.smallIcon}>
                          <Ionicons
                            name="calendar"
                            size={19}
                            color={C.primary}
                          />
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
                      <View style={styles.actionRow}>
                        <ActionButton
                          icon="qr-code-outline"
                          label="View QR"
                          onPress={() => openQr(event)}
                        />
                        <ActionButton
                          icon="create-outline"
                          label="Edit"
                          onPress={() => openEventEditor(event)}
                        />
                        <ActionButton
                          icon="trash-outline"
                          label="Delete"
                          danger
                          onPress={() => confirmDeleteEvent(event)}
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}

        {section === "attendance" && (
          <>
            <Text style={styles.sectionTitle}>Attendance records</Text>
            <Text style={styles.sectionSubtitle}>
              {attendance.length} record(s)
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
                        <View style={styles.actionRow}>
                          <ActionButton
                            icon="create-outline"
                            label="Edit time"
                            onPress={() => openAttendanceEditor(record)}
                          />
                          <ActionButton
                            icon="trash-outline"
                            label="Delete"
                            danger
                            onPress={() => confirmDeleteAttendance(record)}
                          />
                        </View>
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

      {/* Teacher verification review */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeReviewModal}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.editorScroll}
            contentContainerStyle={styles.editorScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeadingRow}>
                <View style={styles.modalHeadingIcon}>
                  <Ionicons
                    name={
                      reviewDecision === "approved"
                        ? "checkmark-circle-outline"
                        : "close-circle-outline"
                    }
                    size={24}
                    color={reviewDecision === "approved" ? C.green : C.red}
                  />
                </View>
                <View style={styles.modalHeadingBody}>
                  <Text style={styles.modalTitle}>
                    {reviewDecision === "approved"
                      ? "Approve teacher request?"
                      : "Reject teacher request?"}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {users.find((item) => item.id === reviewingRequest?.user_id)
                      ?.full_name ||
                      users.find(
                        (item) => item.id === reviewingRequest?.user_id,
                      )?.email ||
                      "Teacher applicant"}
                  </Text>
                </View>
              </View>
              <Text style={styles.note}>
                {reviewDecision === "approved"
                  ? "Approval grants this account the Teacher role."
                  : "The applicant will be able to submit a new request after rejection."}
              </Text>
              <Text style={styles.fieldLabel}>Review notes (optional)</Text>
              <TextInput
                value={reviewNotes}
                onChangeText={setReviewNotes}
                placeholder="Explain your decision or provide feedback..."
                placeholderTextColor={C.muted}
                style={[styles.textInput, styles.multilineInput]}
                multiline
                textAlignVertical="top"
                maxLength={2000}
                editable={!saving}
              />
              <Text style={styles.characterCount}>
                {reviewNotes.length}/2000
              </Text>
              <Pressable
                disabled={saving}
                onPress={() => void submitReview()}
                style={[
                  styles.primaryButton,
                  reviewDecision === "rejected" && styles.rejectButton,
                  saving && styles.disabledButton,
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={
                        reviewDecision === "approved"
                          ? "checkmark-circle-outline"
                          : "close-circle-outline"
                      }
                      size={19}
                      color="#FFFFFF"
                    />
                    <Text style={styles.primaryButtonText}>
                      {reviewDecision === "approved"
                        ? "Confirm approval"
                        : "Confirm rejection"}
                    </Text>
                  </>
                )}
              </Pressable>
              <Pressable
                disabled={saving}
                onPress={closeReviewModal}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Student academic details editor */}
      <Modal
        visible={academicModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAcademicEditor}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.editorScroll}
            contentContainerStyle={styles.editorScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeadingRow}>
                <View style={styles.modalHeadingIcon}>
                  <Ionicons
                    name="school-outline"
                    size={23}
                    color={C.primaryDark}
                  />
                </View>
                <View style={styles.modalHeadingBody}>
                  <Text style={styles.modalTitle}>Student details</Text>
                  <Text style={styles.modalSubtitle}>
                    Edit department, year level, and block
                  </Text>
                </View>
              </View>
              <Text style={styles.studentName}>
                {academicStudent?.full_name ||
                  academicStudent?.email ||
                  "Student"}
              </Text>
              <Text style={styles.fieldLabel}>Department</Text>
              <View style={styles.optionColumn}>
                {departmentOptions.map((value) => (
                  <OptionRow
                    key={value}
                    label={value}
                    selected={selectedDepartment === value}
                    disabled={saving}
                    onPress={() => setSelectedDepartment(value)}
                  />
                ))}
              </View>
              <Text style={styles.fieldLabel}>Year level</Text>
              <View style={styles.optionColumn}>
                {yearLevelOptions.map((value) => (
                  <OptionRow
                    key={value}
                    label={value}
                    selected={selectedYearLevel === value}
                    disabled={saving}
                    onPress={() => setSelectedYearLevel(value)}
                  />
                ))}
              </View>
              <Text style={styles.fieldLabel}>Block</Text>
              <View style={styles.blockOptionRow}>
                {blockOptions.map((value) => (
                  <Pressable
                    key={value}
                    disabled={saving}
                    onPress={() => setSelectedBlock(value)}
                    style={[
                      styles.blockOption,
                      selectedBlock === value && styles.academicOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.blockOptionText,
                        selectedBlock === value &&
                          styles.academicOptionTextSelected,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.previewCard}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={C.primaryDark}
                />
                <View style={styles.previewBody}>
                  <Text style={styles.previewTitle}>New assignment</Text>
                  <Text style={styles.previewText}>
                    {selectedDepartment} · {selectedYearLevel} · Block{" "}
                    {selectedBlock}
                  </Text>
                </View>
              </View>
              <Pressable
                disabled={saving}
                onPress={() => void saveAcademicDetails()}
                style={[styles.primaryButton, saving && styles.disabledButton]}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Save student details
                  </Text>
                )}
              </Pressable>
              <Pressable
                disabled={saving}
                onPress={closeAcademicEditor}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Role selector */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeRoleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change user role</Text>
            <Text style={styles.modalSubtitle}>
              {selectedProfile?.full_name || selectedProfile?.email}
            </Text>
            {roleOptions
              .filter((role) => role !== selectedProfile?.role)
              .map((role) => (
                <Pressable
                  key={role}
                  disabled={saving}
                  onPress={() => void saveRole(role)}
                  style={[
                    styles.modalRoleButton,
                    saving && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.modalRoleText}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={C.primaryDark}
                  />
                </Pressable>
              ))}
            {saving && <ActivityIndicator color={C.primary} />}
            <Pressable
              disabled={saving}
              onPress={closeRoleModal}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Event QR modal */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Event QR code</Text>
            <Text style={styles.modalSubtitle}>{qrEvent?.title || ""}</Text>
            {qrEvent && qrPayload ? (
              <View style={styles.qrBox}>
                <QRCode value={qrPayload} size={220} />
              </View>
            ) : (
              <Text style={styles.note}>No event selected.</Text>
            )}
            <Text style={styles.qrCodeText}>
              Event code: {qrEvent?.event_code || ""}
            </Text>
            <Text style={styles.note}>
              Students must scan this QR code using CCTC Petal Pass. Attendance
              is validated against the event in the database.
            </Text>
            <Pressable
              onPress={() => setQrModalVisible(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Event and attendance editor */}
      <Modal
        visible={editorVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditor}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.editorScroll}
            contentContainerStyle={styles.editorScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {editorMode === "event" ? "Edit event" : "Edit attendance time"}
              </Text>
              {editorMode === "event" && editingEvent && (
                <>
                  <Text style={styles.fieldLabel}>Event code</Text>
                  <Text style={styles.readOnlyField}>
                    {editingEvent.event_code}
                  </Text>
                  <Text style={styles.fieldLabel}>Event title</Text>
                  <TextInput
                    value={eventTitle}
                    onChangeText={setEventTitle}
                    placeholder="Event title"
                    placeholderTextColor={C.muted}
                    style={styles.textInput}
                    editable={!saving}
                  />
                  <Text style={styles.fieldLabel}>Start time (ISO format)</Text>
                  <TextInput
                    value={eventStart}
                    onChangeText={setEventStart}
                    placeholder="2026-10-20T09:00:00+08:00"
                    placeholderTextColor={C.muted}
                    style={styles.textInput}
                    autoCapitalize="none"
                    editable={!saving}
                  />
                  <Text style={styles.fieldLabel}>End time (ISO format)</Text>
                  <TextInput
                    value={eventEnd}
                    onChangeText={setEventEnd}
                    placeholder="2026-10-20T10:00:00+08:00"
                    placeholderTextColor={C.muted}
                    style={styles.textInput}
                    autoCapitalize="none"
                    editable={!saving}
                  />
                  <Text style={styles.note}>
                    Include +08:00 for Philippine local time. Leave a field
                    blank to clear it.
                  </Text>
                  <Pressable
                    disabled={saving}
                    onPress={() => void saveEvent()}
                    style={[
                      styles.primaryButton,
                      saving && styles.disabledButton,
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Save event</Text>
                    )}
                  </Pressable>
                </>
              )}
              {editorMode === "attendance" && editingAttendance && (
                <>
                  <Text style={styles.fieldLabel}>Attendance timestamp</Text>
                  <TextInput
                    value={attendanceTime}
                    onChangeText={setAttendanceTime}
                    placeholder="2026-10-20T09:00:00+08:00"
                    placeholderTextColor={C.muted}
                    style={styles.textInput}
                    autoCapitalize="none"
                    editable={!saving}
                  />
                  <Text style={styles.note}>
                    This edits the recorded scan time only.
                  </Text>
                  <Pressable
                    disabled={saving}
                    onPress={() => void saveAttendance()}
                    style={[
                      styles.primaryButton,
                      saving && styles.disabledButton,
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        Save attendance
                      </Text>
                    )}
                  </Pressable>
                </>
              )}
              <Pressable
                disabled={saving}
                onPress={closeEditor}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function OptionRow({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.academicOption, selected && styles.academicOptionSelected]}
    >
      <Text
        style={[
          styles.academicOptionText,
          selected && styles.academicOptionTextSelected,
        ]}
      >
        {label}
      </Text>
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={19}
        color={selected ? C.primaryDark : C.muted}
      />
    </Pressable>
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
    <Pressable
      accessibilityRole="button"
      style={styles.quickLink}
      onPress={onPress}
    >
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

function ActionButton({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.actionButton, danger && styles.dangerActionButton]}
    >
      <Ionicons name={icon} size={15} color={danger ? C.red : C.primaryDark} />
      <Text
        style={[styles.actionButtonText, danger && styles.dangerActionText]}
      >
        {label}
      </Text>
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
    backgroundColor: C.primary,
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
    flexBasis: "18%",
    minWidth: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 12,
  },
  tabIconRow: { position: "relative" },
  notificationDot: {
    position: "absolute",
    top: -3,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.red,
  },
  activeTab: { backgroundColor: C.blush },
  tabText: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
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
  rowBody: { flex: 1, gap: 4, minWidth: 0 },
  rowTitle: { color: C.text, fontSize: 13, fontWeight: "700" },
  rowSubtitle: { color: C.muted, fontSize: 11, lineHeight: 16 },
  quickEvent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.blush,
  },
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
  academicInfoText: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },
  userActions: { alignItems: "flex-end", gap: 7, maxWidth: 135 },
  youLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  note: { color: C.muted, fontSize: 11, lineHeight: 17, paddingHorizontal: 3 },
  eventCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 7,
  },
  eventHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  countPill: {
    backgroundColor: C.blush,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countText: { fontSize: 10, color: C.primaryDark, fontWeight: "700" },
  detailText: { color: C.muted, fontSize: 10, lineHeight: 15 },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 7,
    marginTop: 8,
  },
  actionButton: {
    minHeight: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: C.blush,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionButtonText: { color: C.primaryDark, fontSize: 10, fontWeight: "800" },
  dangerActionButton: { backgroundColor: "#FFF0F0" },
  dangerActionText: { color: C.red },
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
  errorText: { color: C.red, fontSize: 10, marginTop: 3, flex: 1 },
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(45, 15, 30, 0.50)",
    padding: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  modalHeadingRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  modalHeadingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.blush,
  },
  modalHeadingBody: { flex: 1, gap: 3 },
  modalTitle: { color: C.text, fontSize: 21, fontWeight: "800" },
  modalSubtitle: { color: C.muted, fontSize: 13, lineHeight: 19 },
  studentName: { color: C.text, fontSize: 14, fontWeight: "800", marginTop: 3 },
  modalRoleButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: C.blush,
  },
  modalRoleText: { color: C.primaryDark, fontSize: 14, fontWeight: "700" },
  modalCancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    minHeight: 42,
  },
  modalCancelText: { color: C.muted, fontSize: 13, fontWeight: "700" },
  qrBox: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginVertical: 6,
  },
  qrCodeText: {
    color: C.text,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 13,
  },
  editorScroll: { width: "100%", flexGrow: 0, maxHeight: "90%" },
  editorScrollContent: { flexGrow: 1, justifyContent: "center" },
  fieldLabel: { color: C.text, fontSize: 12, fontWeight: "800", marginTop: 3 },
  textInput: {
    width: "100%",
    minHeight: 46,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#FFFAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.text,
    fontSize: 13,
  },
  multilineInput: { minHeight: 110, maxHeight: 180 },
  characterCount: {
    alignSelf: "flex-end",
    color: C.muted,
    fontSize: 10,
    marginTop: -8,
  },
  readOnlyField: {
    backgroundColor: C.blush,
    borderRadius: 12,
    padding: 12,
    color: C.muted,
    fontSize: 13,
  },
  optionColumn: { gap: 8 },
  academicOption: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#FFFAFC",
  },
  academicOptionSelected: { backgroundColor: C.blush, borderColor: C.primary },
  academicOptionText: { color: C.text, fontSize: 12, fontWeight: "600" },
  academicOptionTextSelected: { color: C.primaryDark, fontWeight: "800" },
  blockOptionRow: { flexDirection: "row", gap: 8 },
  blockOption: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 7,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#FFFAFC",
  },
  blockOptionText: { color: C.text, fontSize: 12, fontWeight: "700" },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF0F5",
    borderRadius: 13,
    padding: 12,
    marginTop: 2,
  },
  previewBody: { flex: 1, gap: 4 },
  previewTitle: { color: C.primaryDark, fontSize: 11, fontWeight: "800" },
  previewText: { color: C.text, fontSize: 11, lineHeight: 16 },
  primaryButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primaryDark,
    borderRadius: 13,
    padding: 13,
    marginTop: 4,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  rejectButton: { backgroundColor: C.red },
  disabledButton: { opacity: 0.55 },
  requestCard: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  requestHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  requestDetails: { color: C.text, fontSize: 12, lineHeight: 19 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  statusBadgeText: { fontSize: 9, fontWeight: "800" },
  pendingBadge: { backgroundColor: "#FFF1D9" },
  pendingText: { color: C.warning },
  approvedBadge: { backgroundColor: "#E5F5EB" },
  approvedText: { color: C.green },
  rejectedBadge: { backgroundColor: "#FFF0F0" },
  rejectedText: { color: C.red },
  reviewNote: {
    backgroundColor: "#FFF7FA",
    padding: 10,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  reviewNoteTitle: { color: C.primaryDark, fontSize: 11, fontWeight: "800" },
  summaryPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF1D9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  summaryPillText: { color: C.warning, fontSize: 11, fontWeight: "800" },
});
