<<<<<<< HEAD
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
=======
import Ionicons from "@expo/vector-icons/Ionicons";
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import { COLORS } from "@/constants/colors";
import {
  deleteAttendance,
  getAllAttendance,
  updateAttendance,
  type AdminAttendanceRecord,
} from "@/lib/attendance";
import { useAuth } from "@/lib/auth";
import { getAllEvents, updateEventStatus, type CloudEvent } from "@/lib/events";
import {
  getAllProfiles,
  getProfile,
  updateUserRole,
  type AdminProfile,
  type Role,
} from "@/lib/profiles";
import {
  getTeacherVerificationRequests,
  reviewTeacherVerificationRequest,
  type TeacherVerificationRequest,
} from "@/lib/verification";

type DashboardSection =
  | "users"
  | "verification"
  | "events"
  | "attendance"
  | "reports";
type ActiveSection = "home" | DashboardSection;

export default function AdminScreen(): React.JSX.Element {
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const sectionPositions = useRef<Record<DashboardSection, number>>({
    users: 0,
    verification: 0,
    events: 0,
    attendance: 0,
    reports: 0,
  });

  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [selectedQrEvent, setSelectedQrEvent] = useState<CloudEvent | null>(
    null,
  );
  const [showQrModal, setShowQrModal] = useState(false);

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // USER MANAGEMENT
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // TEACHER VERIFICATION
  const [verificationRequests, setVerificationRequests] = useState<
    TeacherVerificationRequest[]
  >([]);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<
    Record<string, string>
  >({});

  // EVENT MANAGEMENT
  const [events, setEvents] = useState<CloudEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [updatingEvent, setUpdatingEvent] = useState<string | null>(null);

  // ATTENDANCE MANAGEMENT
  const [attendance, setAttendance] = useState<AdminAttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [selectedReportEventId, setSelectedReportEventId] = useState("all");

  const [selectedAttendance, setSelectedAttendance] =
    useState<AdminAttendanceRecord | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [updatingAttendance, setUpdatingAttendance] = useState(false);

  const filteredAttendance =
    selectedReportEventId === "all"
      ? attendance
      : attendance.filter((record) => record.eventId === selectedReportEventId);

  // QUICK NAVIGATION
  const recordSectionPosition = useCallback(
    (section: DashboardSection, y: number): void => {
      sectionPositions.current[section] = y;
    },
    [],
  );

  const navigateToSection = useCallback((section: DashboardSection): void => {
    setActiveSection(section);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  // LOAD ADMIN ROLE
  const loadRole = useCallback(async (): Promise<void> => {
    if (!user) {
      setRole(null);
      setLoading(false);
>>>>>>> origin/main
      return;
    }

    setLoading(true);
<<<<<<< HEAD
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
=======

    try {
      const profile = await getProfile(user.id);
      setRole(profile?.role ?? "student");
    } catch (error) {
      console.error("LOAD ROLE ERROR:", error);
      setRole("student");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // LOAD USERS
  const loadUsers = useCallback(async (): Promise<void> => {
    setLoadingUsers(true);

    try {
      setUsers(await getAllProfiles());
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);
      Alert.alert("Error", "Unable to load registered users.");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // LOAD VERIFICATION REQUESTS
  const loadVerificationRequests = useCallback(async (): Promise<void> => {
    setLoadingVerification(true);

    try {
      const result = await getTeacherVerificationRequests();

      if (result.error) {
        console.error("LOAD VERIFICATION REQUESTS ERROR:", result.error);
        Alert.alert("Unable to load requests", result.error.message);
        return;
      }

      setVerificationRequests(result.data);
    } catch (error) {
      console.error("LOAD VERIFICATION REQUESTS ERROR:", error);
      Alert.alert("Error", "Unable to load teacher verification requests.");
    } finally {
      setLoadingVerification(false);
    }
  }, []);

  // LOAD EVENTS
  const loadEvents = useCallback(async (): Promise<void> => {
    setLoadingEvents(true);

    try {
      setEvents(await getAllEvents());
    } catch (error) {
      console.error("LOAD EVENTS ERROR:", error);
      Alert.alert("Error", "Unable to load events.");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  // LOAD ATTENDANCE
  const loadAttendance = useCallback(async (): Promise<void> => {
    setLoadingAttendance(true);

    try {
      setAttendance(await getAllAttendance());
    } catch (error) {
      console.error("LOAD ATTENDANCE ERROR:", error);
      Alert.alert("Error", "Unable to load attendance records.");
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadRole();
    }, [loadRole]),
  );

  useFocusEffect(
    useCallback(() => {
      if (role === "admin") {
        void loadUsers();
        void loadVerificationRequests();
        void loadEvents();
        void loadAttendance();
      }
    }, [role, loadUsers, loadVerificationRequests, loadEvents, loadAttendance]),
  );

  // DATE AND TIME
  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return "Not set";

    const date = new Date(dateString);

    return Number.isNaN(date.getTime()) ? dateString : date.toLocaleString();
  };

  // USER MANAGEMENT
  const handleOpenRoleModal = (profile: AdminProfile): void => {
    setSelectedUser(profile);
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = (): void => {
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const handleChangeRole = async (newRole: Role): Promise<void> => {
    if (!selectedUser) return;

    const userId = selectedUser.id;

    setShowRoleModal(false);
    setUpdatingUser(userId);

    try {
      const { error } = await updateUserRole(userId, newRole);

      if (error) {
        console.error("ROLE UPDATE ERROR:", error);
        Alert.alert("Update failed", "Unable to update this user's role.");
        return;
      }

      setUsers((current) =>
        current.map((profile) =>
          profile.id === userId ? { ...profile, role: newRole } : profile,
        ),
      );

      setSelectedUser(null);
    } catch (error) {
      console.error("ROLE UPDATE ERROR:", error);
      Alert.alert("Update failed", "Unable to update this user's role.");
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleLabel = (userRole: Role): string => {
    if (userRole === "admin") return "Administrator";
    if (userRole === "teacher") return "Teacher";
    return "Student";
  };

  // TEACHER VERIFICATION
  const handleReviewVerification = async (
    request: TeacherVerificationRequest,
    decision: "approved" | "rejected",
  ): Promise<void> => {
    if (reviewingRequest) return;

    const message =
      decision === "approved"
        ? "Approve this request? The database function must update the user's role to teacher."
        : "Reject this teacher verification request?";

    const performReview = async (): Promise<void> => {
      setReviewingRequest(request.id);

      try {
        const result = await reviewTeacherVerificationRequest(
          request.id,
          decision,
          verificationNotes[request.id] ?? "",
        );

        if (result.error || !result.success) {
          console.error("VERIFICATION REVIEW ERROR:", result.error);

          Alert.alert(
            "Review failed",
            result.error?.message ??
              "The verification request could not be reviewed.",
          );
          return;
        }

        Alert.alert(
          decision === "approved" ? "Request approved" : "Request rejected",
          decision === "approved"
            ? "The request was reviewed. Verify that the database function updated the user's role."
            : "The request was rejected.",
        );

        setVerificationNotes((current) => {
          const updated = { ...current };
          delete updated[request.id];
          return updated;
        });

        await Promise.all([loadVerificationRequests(), loadUsers()]);
      } catch (error) {
        console.error("VERIFICATION REVIEW ERROR:", error);

        Alert.alert(
          "Review failed",
          error instanceof Error
            ? error.message
            : "Unable to review this request.",
        );
      } finally {
        setReviewingRequest(null);
      }
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(message)) {
        await performReview();
      }
      return;
    }

    Alert.alert(
      decision === "approved" ? "Approve request" : "Reject request",
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: decision === "approved" ? "Approve" : "Reject",
          style: decision === "rejected" ? "destructive" : "default",
          onPress: () => void performReview(),
        },
      ],
    );
  };

  // EVENT MANAGEMENT
  const handleOpenQrModal = (event: CloudEvent): void => {
    setSelectedQrEvent(event);
    setShowQrModal(true);
  };

  const handleCloseQrModal = (): void => {
    setShowQrModal(false);
    setSelectedQrEvent(null);
  };

  const handleChangeEventStatus = async (
    event: CloudEvent,
    newStatus: "open" | "closed",
  ): Promise<void> => {
    setUpdatingEvent(event.id);

    try {
      const { error } = await updateEventStatus(event.id, newStatus);

      if (error) {
        console.error("EVENT STATUS UPDATE ERROR:", error);
        Alert.alert("Update failed", "Unable to update event status.");
        return;
      }

      setEvents((current) =>
        current.map((item) =>
          item.id === event.id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (error) {
      console.error("EVENT STATUS UPDATE ERROR:", error);
      Alert.alert("Update failed", "Unable to update event status.");
    } finally {
      setUpdatingEvent(null);
    }
  };

  // ATTENDANCE MANAGEMENT
  const performDeleteAttendance = async (
    record: AdminAttendanceRecord,
  ): Promise<void> => {
    try {
      const { error } = await deleteAttendance(record.id);

      if (error) {
        console.error("DELETE ATTENDANCE ERROR:", error);
        Alert.alert(
          "Delete failed",
          "Unable to delete this attendance record.",
>>>>>>> origin/main
        );
        return;
      }

<<<<<<< HEAD
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
=======
      setAttendance((current) =>
        current.filter((item) => item.id !== record.id),
      );
    } catch (error) {
      console.error("DELETE ATTENDANCE ERROR:", error);
      Alert.alert("Delete failed", "Unable to delete this attendance record.");
    }
  };

  const handleDeleteAttendance = (record: AdminAttendanceRecord): void => {
    const message = `Delete the attendance record for ${record.studentName || "this student"}?`;

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(message)) {
        void performDeleteAttendance(record);
      }
      return;
    }

    Alert.alert("Delete attendance", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void performDeleteAttendance(record),
      },
    ]);
  };

  const handleOpenAttendanceModal = (record: AdminAttendanceRecord): void => {
    setSelectedAttendance(record);
    setSelectedStudentId(record.studentId);
    setSelectedEventId(record.eventId);
    setShowAttendanceModal(true);
  };

  const handleCloseAttendanceModal = (): void => {
    setShowAttendanceModal(false);
    setSelectedAttendance(null);
    setSelectedStudentId("");
    setSelectedEventId("");
  };

  const handleUpdateAttendance = async (): Promise<void> => {
    if (!selectedAttendance || !selectedStudentId || !selectedEventId) {
      return;
    }

    setUpdatingAttendance(true);

    try {
      const { error } = await updateAttendance(
        selectedAttendance.id,
        selectedStudentId,
        selectedEventId,
      );

      if (error) {
        console.error("UPDATE ATTENDANCE ERROR:", error);
        Alert.alert(
          "Update failed",
          "Unable to update this attendance record.",
        );
        return;
      }

      await loadAttendance();
      handleCloseAttendanceModal();
    } catch (error) {
      console.error("UPDATE ATTENDANCE ERROR:", error);
      Alert.alert("Update failed", "Unable to update this attendance record.");
    } finally {
      setUpdatingAttendance(false);
    }
  };

  // EXPORT ATTENDANCE REPORT
  const handleExportAttendance = async (): Promise<void> => {
    if (filteredAttendance.length === 0) {
      if (Platform.OS === "web") {
        window.alert("No attendance records available to export.");
      } else {
        Alert.alert("No attendance records", "There are no records to export.");
      }
      return;
    }

    try {
      const headers = [
        "Student Name",
        "Student Email",
        "Event Name",
        "Event Code",
        "Scanned At",
      ];

      const escapeCsv = (value: unknown): string => {
        let text = String(value ?? "");

        if (/^[\t\r ]*[=+\-@]/.test(text)) {
          text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
      };

      const rows = filteredAttendance.map((record) => [
        record.studentName || "Unknown student",
        record.studentEmail || "No email",
        record.eventTitle || "Unknown event",
        record.eventCode || "No event code",
        formatDateTime(record.scannedAt),
      ]);

      const csvContent =
        "\uFEFF" +
        [headers, ...rows]
          .map((row) => row.map(escapeCsv).join(","))
          .join("\r\n");

      const fileName =
        selectedReportEventId === "all"
          ? "qr-attendance-report.csv"
          : "qr-attendance-event-report.csv";

      if (Platform.OS === "web") {
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }

      if (!FileSystem.cacheDirectory) {
        throw new Error("File cache directory is unavailable.");
      }

      const fileUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export attendance report",
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      console.error("CSV EXPORT ERROR:", error);

      if (Platform.OS === "web") {
        window.alert("Unable to export the attendance report.");
      } else {
        Alert.alert("Export failed", "Unable to export the attendance report.");
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.subtitle}>Loading...</Text>
>>>>>>> origin/main
      </View>
    );
  }

<<<<<<< HEAD
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
=======
  if (role !== "admin") {
    return (
      <View style={styles.lockContainer}>
        <View style={styles.lockIconCircle}>
          <Ionicons
            name="shield-checkmark-outline"
            size={42}
            color={COLORS.primary}
          />
          <View style={styles.lockBadge}>
            <Ionicons
              name="lock-closed"
              size={16}
              color={COLORS.textOnPrimary}
            />
          </View>
        </View>

        <Text style={styles.lockEyebrow}>RESTRICTED ACCESS</Text>
        <Text style={styles.lockTitle}>Admin Only</Text>

        <Text style={styles.lockSubtitle}>
          This section is reserved for administrators. Your account does not
          have permission to manage users, teacher verification, events,
          attendance records, or reports.
        </Text>

        <View style={styles.lockNotice}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={COLORS.primary}
          />
          <Text style={styles.lockNoticeText}>
            Contact your school administrator if you need administrator access.
          </Text>
        </View>

        <View style={styles.lockFooter}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color={COLORS.textMuted}
          />
          <Text style={styles.lockFooterText}>
            QR - ATT · Protected Administration Workspace
          </Text>
        </View>
>>>>>>> origin/main
      </View>
    );
  }

<<<<<<< HEAD
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
=======
  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          {activeSection === "home"
            ? "Admin Dashboard"
            : {
                users: "User Management",
                verification: "Teacher Verification",
                events: "Event Management",
                attendance: "Attendance Management",
                reports: "Reports",
              }[activeSection]}
        </Text>
        <Text style={styles.subtitle}>
          {activeSection === "home"
            ? "QR - ATT Management System."
            : "Manage this section of QR - ATT."}
        </Text>

        {activeSection !== "home" && (
          <TouchableOpacity
            style={styles.backToDashboardButton}
            onPress={() => setActiveSection("home")}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
            <Text style={styles.backToDashboardText}>Back to Dashboard</Text>
          </TouchableOpacity>
        )}

        {activeSection === "home" && (
          <View style={styles.quickNavCard}>
            <View style={styles.quickNavHeader}>
              <View>
                <Text style={styles.quickNavTitle}>Quick Navigation</Text>
                <Text style={styles.quickNavSubtitle}>
                  Your administration shortcuts
                </Text>
              </View>

              <View style={styles.quickNavHeaderIcon}>
                <Ionicons
                  name="apps-outline"
                  size={22}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.quickNavGrid}>
              <QuickNavButton
                title="Users"
                subtitle={`${users.length} accounts`}
                icon="people-outline"
                onPress={() => navigateToSection("users")}
              />

              <QuickNavButton
                title="Teacher Verification"
                subtitle={`${verificationRequests.length} pending`}
                icon="shield-checkmark-outline"
                onPress={() => navigateToSection("verification")}
              />

              <QuickNavButton
                title="Events"
                subtitle={`${events.length} events`}
                icon="calendar-outline"
                onPress={() => navigateToSection("events")}
              />

              <QuickNavButton
                title="Attendance"
                subtitle={`${attendance.length} records`}
                icon="clipboard-outline"
                onPress={() => navigateToSection("attendance")}
              />

              <QuickNavButton
                title="Reports"
                subtitle="Analytics & exports"
                icon="stats-chart-outline"
                onPress={() => navigateToSection("reports")}
              />
            </View>
          </View>
        )}

        {activeSection === "users" && (
          <View
            style={styles.card}
            onLayout={(event) =>
              recordSectionPosition("users", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.cardTitle}>User Management</Text>
            <Text style={styles.cardDescription}>
              View and manage student, teacher, and administrator accounts.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              Registered Users ({users.length})
            </Text>

            {loadingUsers ? (
              <Text style={styles.loadingText}>Loading users...</Text>
            ) : users.length === 0 ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : (
              users.map((profile) => (
                <View key={profile.id} style={styles.userItem}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {profile.full_name || "No name"}
                    </Text>
                    <Text style={styles.userEmail}>{profile.email}</Text>
                    <Text style={styles.userId} numberOfLines={1}>
                      ID: {profile.id}
                    </Text>
                  </View>

                  <View style={styles.userActions}>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>
                        {getRoleLabel(profile.role)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.editRoleButton}
                      disabled={updatingUser === profile.id}
                      onPress={() => handleOpenRoleModal(profile)}
                    >
                      <Text style={styles.editRoleButtonText}>
                        {updatingUser === profile.id
                          ? "Updating..."
                          : "Edit Role"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeSection === "verification" && (
          <View
            style={styles.card}
            onLayout={(event) =>
              recordSectionPosition("verification", event.nativeEvent.layout.y)
            }
          >
            <View style={styles.verificationHeader}>
              <View style={styles.verificationHeaderIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={25}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.verificationHeaderText}>
                <Text style={styles.cardTitle}>Teacher Verification</Text>
                <Text style={styles.cardDescription}>
                  Review student requests for teacher access.
                </Text>
              </View>

              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>
                  {verificationRequests.length}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.refreshButton}
              disabled={loadingVerification}
              onPress={() => void loadVerificationRequests()}
            >
              <Ionicons
                name="refresh-outline"
                size={17}
                color={COLORS.primary}
              />
              <Text style={styles.refreshButtonText}>
                {loadingVerification ? "Refreshing..." : "Refresh Requests"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {loadingVerification ? (
              <Text style={styles.loadingText}>
                Loading teacher verification requests...
              </Text>
            ) : verificationRequests.length === 0 ? (
              <View style={styles.emptyVerification}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={35}
                  color={COLORS.success}
                />
                <Text style={styles.emptyVerificationTitle}>
                  No pending requests
                </Text>
                <Text style={styles.emptyVerificationText}>
                  New teacher verification requests will appear here.
                </Text>
              </View>
            ) : (
              verificationRequests.map((request) => {
                const isReviewing = reviewingRequest === request.id;

                return (
                  <View key={request.id} style={styles.verificationItem}>
                    <View style={styles.verificationItemTop}>
                      <View style={styles.verificationItemIcon}>
                        <Ionicons
                          name="person-outline"
                          size={21}
                          color={COLORS.primary}
                        />
                      </View>

                      <View style={styles.verificationItemIdentity}>
                        <Text style={styles.verificationItemTitle}>
                          Teacher Access Request
                        </Text>
                        <Text style={styles.verificationItemDate}>
                          Submitted: {formatDateTime(request.created_at)}
                        </Text>
                      </View>

                      <View style={styles.pendingStatusBadge}>
                        <Text style={styles.pendingStatusText}>Pending</Text>
                      </View>
                    </View>

                    <Text style={styles.verificationLabel}>User ID</Text>
                    <Text style={styles.verificationUserId}>
                      {request.user_id}
                    </Text>

                    <Text style={styles.verificationLabel}>
                      Applicant's details
                    </Text>
                    <Text style={styles.verificationDetails}>
                      {request.details}
                    </Text>

                    <Text style={styles.verificationLabel}>
                      Administrator notes (optional)
                    </Text>

                    <TextInput
                      style={styles.notesInput}
                      value={verificationNotes[request.id] ?? ""}
                      onChangeText={(value) =>
                        setVerificationNotes((current) => ({
                          ...current,
                          [request.id]: value,
                        }))
                      }
                      placeholder="Enter a reason or review note..."
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      editable={!isReviewing}
                    />

                    <View style={styles.verificationActions}>
                      <TouchableOpacity
                        style={[
                          styles.approveButton,
                          isReviewing && styles.disabledButton,
                        ]}
                        disabled={isReviewing || reviewingRequest !== null}
                        onPress={() =>
                          void handleReviewVerification(request, "approved")
                        }
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.reviewButtonText}>
                          {isReviewing ? "Processing..." : "Approve"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.rejectButton,
                          (isReviewing || reviewingRequest !== null) &&
                            styles.disabledButton,
                        ]}
                        disabled={isReviewing || reviewingRequest !== null}
                        onPress={() =>
                          void handleReviewVerification(request, "rejected")
                        }
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={18}
                          color={COLORS.danger}
                        />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeSection === "events" && (
          <View
            style={styles.card}
            onLayout={(event) =>
              recordSectionPosition("events", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.cardTitle}>Event Management</Text>
            <Text style={styles.cardDescription}>
              View all school events and manage their open or closed status.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              Registered Events ({events.length})
            </Text>

            {loadingEvents ? (
              <Text style={styles.loadingText}>Loading events...</Text>
            ) : events.length === 0 ? (
              <Text style={styles.emptyText}>No events found.</Text>
            ) : (
              events.map((event) => {
                const eventStatus = event.status ?? "open";
                const isUpdating = updatingEvent === event.id;

                return (
                  <View key={event.id} style={styles.eventItem}>
                    <Text style={styles.eventTitle}>
                      {event.title || "Untitled event"}
                    </Text>
                    <Text style={styles.eventCode}>
                      Event Code: {event.event_code}
                    </Text>
                    <Text style={styles.eventTime}>
                      Start: {formatDateTime(event.start_time)}
                    </Text>
                    <Text style={styles.eventTime}>
                      End: {formatDateTime(event.end_time)}
                    </Text>

                    {event.venue ? (
                      <Text style={styles.eventVenue}>
                        Venue: {event.venue}
                      </Text>
                    ) : null}

                    {event.description ? (
                      <Text style={styles.eventDescription}>
                        Description: {event.description}
                      </Text>
                    ) : null}

                    <View style={styles.eventBottomRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          eventStatus === "closed"
                            ? styles.closedBadge
                            : styles.openBadge,
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {eventStatus === "closed" ? "Closed" : "Open"}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={
                          eventStatus === "closed"
                            ? styles.reopenButton
                            : styles.closeButton
                        }
                        disabled={isUpdating}
                        onPress={() =>
                          void handleChangeEventStatus(
                            event,
                            eventStatus === "closed" ? "open" : "closed",
                          )
                        }
                      >
                        <Text
                          style={
                            eventStatus === "closed"
                              ? styles.reopenButtonText
                              : styles.closeButtonText
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : eventStatus === "closed"
                              ? "Reopen Event"
                              : "Close Event"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.viewQrButton}
                      onPress={() => handleOpenQrModal(event)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="qr-code-outline"
                        size={18}
                        color={COLORS.primary}
                      />
                      <Text style={styles.viewQrButtonText}>
                        View Event QR Code
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeSection === "attendance" && (
          <View
            style={styles.card}
            onLayout={(event) =>
              recordSectionPosition("attendance", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.cardTitle}>Attendance Management</Text>
            <Text style={styles.cardDescription}>
              View, edit, and delete attendance records across the system.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              Attendance Records ({attendance.length})
            </Text>

            {loadingAttendance ? (
              <Text style={styles.loadingText}>
                Loading attendance records...
              </Text>
            ) : attendance.length === 0 ? (
              <Text style={styles.emptyText}>No attendance records found.</Text>
            ) : (
              attendance.map((record) => (
                <View key={record.id} style={styles.attendanceItem}>
                  <Text style={styles.attendanceStudent}>
                    {record.studentName || "Unknown student"}
                  </Text>
                  <Text style={styles.attendanceEmail}>
                    {record.studentEmail || "No email"}
                  </Text>
                  <Text style={styles.attendanceEvent}>
                    Event: {record.eventTitle || "Unknown event"}
                  </Text>
                  <Text style={styles.attendanceCode}>
                    Code: {record.eventCode || "No event code"}
                  </Text>
                  <Text style={styles.attendanceTime}>
                    Scanned: {formatDateTime(record.scannedAt)}
                  </Text>

                  <View style={styles.attendanceActions}>
                    <TouchableOpacity
                      style={styles.editAttendanceButton}
                      onPress={() => handleOpenAttendanceModal(record)}
                    >
                      <Text style={styles.editAttendanceButtonText}>
                        Edit Attendance
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteAttendanceButton}
                      onPress={() => handleDeleteAttendance(record)}
                    >
                      <Text style={styles.deleteAttendanceButtonText}>
                        Delete Attendance
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeSection === "reports" && (
          <View
            style={styles.card}
            onLayout={(event) =>
              recordSectionPosition("reports", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.cardTitle}>Reports</Text>
            <Text style={styles.cardDescription}>
              Filter attendance by event and export the selected report.
            </Text>

            <View style={styles.reportStatsContainer}>
              <View style={styles.reportStatBox}>
                <Text style={styles.reportStatNumber}>{attendance.length}</Text>
                <Text style={styles.reportStatLabel}>Total Attendance</Text>
              </View>

              <View style={styles.reportStatBox}>
                <Text style={styles.reportStatNumber}>
                  {users.filter((profile) => profile.role === "student").length}
                </Text>
                <Text style={styles.reportStatLabel}>Total Students</Text>
              </View>

              <View style={styles.reportStatBox}>
                <Text style={styles.reportStatNumber}>{events.length}</Text>
                <Text style={styles.reportStatLabel}>Total Events</Text>
              </View>
            </View>

            <Text style={styles.reportSectionTitle}>Filter by Event</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reportFilterList}
            >
              <TouchableOpacity
                style={[
                  styles.reportFilterButton,
                  selectedReportEventId === "all" &&
                    styles.reportFilterButtonSelected,
                ]}
                onPress={() => setSelectedReportEventId("all")}
              >
                <Text
                  style={[
                    styles.reportFilterButtonText,
                    selectedReportEventId === "all" &&
                      styles.reportFilterButtonTextSelected,
                  ]}
                >
                  All Events
                </Text>
              </TouchableOpacity>

              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.reportFilterButton,
                    selectedReportEventId === event.id &&
                      styles.reportFilterButtonSelected,
                  ]}
                  onPress={() => setSelectedReportEventId(event.id)}
                >
                  <Text
                    style={[
                      styles.reportFilterButtonText,
                      selectedReportEventId === event.id &&
                        styles.reportFilterButtonTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {event.title || event.event_code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.exportReportButton,
                filteredAttendance.length === 0 && styles.disabledButton,
              ]}
              onPress={() => void handleExportAttendance()}
              disabled={filteredAttendance.length === 0}
            >
              <Ionicons
                name="download-outline"
                size={19}
                color={COLORS.textOnPrimary}
              />
              <Text style={styles.exportReportButtonText}>
                {filteredAttendance.length === 0
                  ? "No Records to Export"
                  : "Export Filtered Report (CSV)"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.reportSectionTitle}>
              Attendance Records ({filteredAttendance.length})
            </Text>

            {loadingAttendance ? (
              <Text style={styles.loadingText}>
                Loading attendance records...
              </Text>
            ) : filteredAttendance.length === 0 ? (
              <Text style={styles.emptyText}>
                No attendance records found for this selection.
              </Text>
            ) : (
              filteredAttendance.map((record) => (
                <View key={record.id} style={styles.reportEventItem}>
                  <Text style={styles.reportEventTitle}>
                    {record.studentName || "Unknown student"}
                  </Text>
                  <Text style={styles.reportEventDetails}>
                    Email: {record.studentEmail || "No email"}
                  </Text>
                  <Text style={styles.reportEventDetails}>
                    Event: {record.eventTitle || "Unknown event"}
                  </Text>
                  <Text style={styles.reportEventDetails}>
                    Event Code: {record.eventCode || "No event code"}
                  </Text>
                  <Text style={styles.reportEventDetails}>
                    Scanned: {formatDateTime(record.scannedAt)}
                  </Text>
                </View>
              ))
            )}

            <Text style={styles.reportSectionTitle}>
              Event Attendance Summary
            </Text>

            {events.length === 0 ? (
              <Text style={styles.cardDescription}>
                No events available for reporting.
              </Text>
            ) : (
              events
                .filter(
                  (event) =>
                    selectedReportEventId === "all" ||
                    event.id === selectedReportEventId,
                )
                .map((event) => (
                  <View key={event.id} style={styles.reportEventItem}>
                    <Text style={styles.reportEventTitle}>
                      {event.title || "Untitled event"}
                    </Text>
                    <Text style={styles.reportEventDetails}>
                      Event Code: {event.event_code}
                    </Text>
                    <Text style={styles.reportEventDetails}>
                      Attendance Records:{" "}
                      {attendance.filter((r) => r.eventId === event.id).length}
                    </Text>
                    <Text style={styles.reportEventDetails}>
                      Status: {event.status || "Unknown"}
                    </Text>
                  </View>
                ))
            )}
          </View>
        )}
      </ScrollView>

      {/* CHANGE ROLE MODAL */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseRoleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change User Role</Text>
            <Text style={styles.modalSubtitle}>
              {selectedUser?.full_name ||
                selectedUser?.email ||
                "Select a user"}
            </Text>

            {selectedUser && (
              <Text style={styles.currentRole}>
                Current role: {getRoleLabel(selectedUser.role)}
              </Text>
            )}

            {selectedUser?.role !== "student" && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => void handleChangeRole("student")}
              >
                <Text style={styles.modalButtonText}>Student</Text>
              </TouchableOpacity>
            )}

            {selectedUser?.role !== "teacher" && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => void handleChangeRole("teacher")}
              >
                <Text style={styles.modalButtonText}>Teacher</Text>
              </TouchableOpacity>
            )}

            {selectedUser?.role !== "admin" && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => void handleChangeRole("admin")}
              >
                <Text style={styles.modalButtonText}>Administrator</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCloseRoleModal}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
>>>>>>> origin/main
          </View>
        </View>
      </Modal>

<<<<<<< HEAD
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
=======
      {/* EDIT ATTENDANCE MODAL */}
      <Modal
        visible={showAttendanceModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAttendanceModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Attendance</Text>
            <Text style={styles.modalSubtitle}>
              Select the correct student and event.
            </Text>

            <Text style={styles.formLabel}>Student</Text>

            <ScrollView style={styles.selectionList} nestedScrollEnabled>
              {users.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={[
                    styles.selectionButton,
                    selectedStudentId === profile.id &&
                      styles.selectionButtonSelected,
                  ]}
                  onPress={() => setSelectedStudentId(profile.id)}
                >
                  <Text
                    style={[
                      styles.selectionButtonText,
                      selectedStudentId === profile.id &&
                        styles.selectionButtonTextSelected,
                    ]}
                  >
                    {profile.full_name || profile.email}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.formLabel}>Event</Text>

            <ScrollView style={styles.selectionList} nestedScrollEnabled>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.selectionButton,
                    selectedEventId === event.id &&
                      styles.selectionButtonSelected,
                  ]}
                  onPress={() => setSelectedEventId(event.id)}
                >
                  <Text
                    style={[
                      styles.selectionButtonText,
                      selectedEventId === event.id &&
                        styles.selectionButtonTextSelected,
                    ]}
                  >
                    {event.title || "Untitled event"}
                  </Text>
                  <Text style={styles.selectionSecondaryText}>
                    Code: {event.event_code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.modalButton,
                (updatingAttendance ||
                  !selectedStudentId ||
                  !selectedEventId) &&
                  styles.disabledButton,
              ]}
              disabled={
                updatingAttendance || !selectedStudentId || !selectedEventId
              }
              onPress={() => void handleUpdateAttendance()}
            >
              <Text style={styles.modalButtonText}>
                {updatingAttendance ? "Updating..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCloseAttendanceModal}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EVENT QR CODE MODAL */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseQrModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContainer}>
            <View style={styles.qrModalHeader}>
              <View style={styles.qrModalIcon}>
                <Ionicons
                  name="qr-code-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <TouchableOpacity
                onPress={handleCloseQrModal}
                style={styles.qrCloseButton}
                accessibilityLabel="Close QR code"
              >
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.qrModalTitle}>Event QR Code</Text>
            <Text style={styles.qrModalSubtitle}>
              {selectedQrEvent?.title || "Selected event"}
            </Text>

            {selectedQrEvent && (
              <>
                <View style={styles.qrCodeFrame}>
                  <QRCode
                    value={String(
                      selectedQrEvent.event_code || selectedQrEvent.id,
                    )}
                    size={220}
                    backgroundColor="#FFFFFF"
                    color="#17131F"
                  />
                </View>
                <Text style={styles.qrEventCodeLabel}>EVENT CODE</Text>
                <Text selectable style={styles.qrEventCode}>
                  {selectedQrEvent.event_code || selectedQrEvent.id}
                </Text>
                <Text style={styles.qrInstruction}>
                  Ask students to scan this code using QR - ATT.
                </Text>
              </>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseQrModal}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* -------------------- QUICK NAVIGATION BUTTON -------------------- */

type QuickNavButtonProps = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
};

function QuickNavButton({
  title,
  subtitle,
  icon,
  onPress,
}: QuickNavButtonProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.quickNavButton}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.quickNavIconBox}>
        <Ionicons name={icon} size={23} color="#7964D8" />
      </View>

      <Text style={styles.quickNavButtonText}>{title}</Text>
      <Text style={styles.quickNavCount}>{subtitle}</Text>

      <View style={styles.quickNavArrow}>
        <Ionicons name="arrow-forward" size={16} color="#7964D8" />
      </View>
    </TouchableOpacity>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 22,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 17,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    lineHeight: 19,
  },
  disabledButton: {
    opacity: 0.5,
  },

  // QUICK NAVIGATION
  quickNavCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9E2FA",
    shadowColor: "#8B78C9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  quickNavHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quickNavTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#30264A",
    marginBottom: 4,
  },
  quickNavSubtitle: {
    fontSize: 12,
    color: "#8A819F",
  },
  quickNavHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F0EBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  quickNavGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickNavButton: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "40%",
    minHeight: 112,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5DAFA",
    backgroundColor: "#F5F1FF",
    justifyContent: "space-between",
    gap: 8,
  },
  quickNavIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6DEFA",
    alignItems: "center",
    justifyContent: "center",
  },
  quickNavButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#392D57",
    paddingRight: 18,
  },
  quickNavCount: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8779A5",
    lineHeight: 14,
  },
  quickNavArrow: {
    position: "absolute",
    top: 16,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  // DASHBOARD SECTION NAVIGATION
  backToDashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  backToDashboardText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  // EVENT QR CODE
  viewQrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  viewQrButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  qrModalContainer: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrModalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  qrModalIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  qrCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  qrModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: 4,
  },
  qrModalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 18,
  },
  qrCodeFrame: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  qrEventCodeLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },
  qrEventCode: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 5,
  },
  qrInstruction: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 18,
  },

  // ACCESS DENIED
  lockContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  lockIconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    position: "relative",
  },
  lockBadge: {
    position: "absolute",
    right: -3,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  lockEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: COLORS.primary,
    marginBottom: 9,
    textAlign: "center",
  },
  lockTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  lockSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 340,
  },
  lockNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 24,
    maxWidth: 360,
    width: "100%",
  },
  lockNoticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    lineHeight: 19,
  },
  lockFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 28,
  },
  lockFooterText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  // USER MANAGEMENT
  userItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userId: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    width: "100%",
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textOnPrimary,
  },
  editRoleButton: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  editRoleButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },

  // TEACHER VERIFICATION
  verificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  verificationHeaderIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  verificationHeaderText: {
    flex: 1,
  },
  pendingBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
>>>>>>> origin/main
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
<<<<<<< HEAD
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
=======
    gap: 7,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 15,
  },
  refreshButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyVerification: {
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 10,
  },
  emptyVerificationTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  emptyVerificationText: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 5,
  },
  verificationItem: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  verificationItemTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 14,
  },
  verificationItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  verificationItemIdentity: {
    flex: 1,
  },
  verificationItemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  verificationItemDate: {
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  pendingStatusBadge: {
    backgroundColor: "#FFF2D8",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  pendingStatusText: {
    color: "#986817",
    fontSize: 10,
    fontWeight: "800",
  },
  verificationLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 5,
  },
  verificationUserId: {
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  verificationDetails: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    padding: 11,
  },
  notesInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 11,
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  verificationActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 14,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  reviewButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.dangerBackground,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.danger,
  },

  // EVENT MANAGEMENT
  eventItem: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  eventCode: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 9,
  },
  eventTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 3,
  },
  eventVenue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  eventDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 5,
  },
  eventBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 13,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  openBadge: {
    backgroundColor: COLORS.successBackground,
  },
  closedBadge: {
    backgroundColor: COLORS.surface,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  closeButton: {
    backgroundColor: COLORS.dangerBackground,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  closeButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.danger,
  },
  reopenButton: {
    backgroundColor: COLORS.successBackground,
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  reopenButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.success,
  },

  // ATTENDANCE MANAGEMENT
  attendanceItem: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  attendanceStudent: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  attendanceEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 9,
  },
  attendanceEvent: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  attendanceCode: {
    fontSize: 11,
    color: COLORS.primary,
    marginBottom: 4,
  },
  attendanceTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  attendanceActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 13,
  },
  editAttendanceButton: {
    flex: 1,
    minWidth: 110,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editAttendanceButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  deleteAttendanceButton: {
    flex: 1,
    minWidth: 110,
    backgroundColor: COLORS.dangerBackground,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAttendanceButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.danger,
  },

  // REPORTS
  exportReportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  exportReportButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  reportStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 16,
    marginBottom: 22,
  },
  reportStatBox: {
    flex: 1,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  reportStatNumber: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.primary,
  },
  reportStatLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 5,
    lineHeight: 15,
  },
  reportSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 6,
  },
  reportFilterList: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    gap: 8,
  },
  reportFilterButton: {
    maxWidth: 200,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reportFilterButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  reportFilterButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  reportFilterButtonTextSelected: {
    color: COLORS.textOnPrimary,
  },
  reportEventItem: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },
  reportEventTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  reportEventDetails: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(39, 33, 59, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "90%",
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 7,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  currentRole: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 5,
  },
  selectionList: {
    maxHeight: 130,
    marginBottom: 14,
  },
  selectionButton: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 7,
  },
  selectionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  selectionButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  selectionButtonTextSelected: {
    color: COLORS.primary,
  },
  selectionSecondaryText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  modalButton: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textOnPrimary,
  },
  cancelButton: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 3,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textSecondary,
  },
});
>>>>>>> origin/main
