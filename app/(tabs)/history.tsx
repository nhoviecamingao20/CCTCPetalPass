<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
=======
import Ionicons from "@expo/vector-icons/Ionicons";
>>>>>>> origin/main
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
<<<<<<< HEAD
  SafeAreaView,
  StyleSheet,
  Text,
  View,
=======
  StyleSheet,
  Text,
  View
>>>>>>> origin/main
} from "react-native";

import { COLORS } from "@/constants/colors";
import {
<<<<<<< HEAD
  getAttendanceHistory,
  getTeacherEventAttendance,
=======
  getAllAttendance,
  getAttendanceHistory,
  getTeacherEventAttendance,
  type AdminAttendanceRecord,
>>>>>>> origin/main
  type AttendanceRecord,
  type TeacherEventAttendance,
} from "@/lib/attendance";
import { useAuth } from "@/lib/auth";
import { getProfile, type Role } from "@/lib/profiles";

export default function HistoryScreen() {
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
=======
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [adminRecords, setAdminRecords] = useState<AdminAttendanceRecord[]>([]);
>>>>>>> origin/main
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
  const [teacherEvents, setTeacherEvents] = useState<TeacherEventAttendance[]>(
    [],
  );

  const load = useCallback(async () => {
<<<<<<< HEAD
    if (!user) {
=======
    setLoading(true);
    setErrorMessage(null);

    if (!user) {
      setRole(null);
      setAdminRecords([]);
      setStudentRecords([]);
      setTeacherEvents([]);
>>>>>>> origin/main
      setLoading(false);
      return;
    }

<<<<<<< HEAD
    setLoading(true);

=======
>>>>>>> origin/main
    try {
      const profile = await getProfile(user.id);
      const currentRole = profile?.role ?? "student";

      setRole(currentRole);

<<<<<<< HEAD
      if (currentRole === "teacher") {
        const events = await getTeacherEventAttendance(user.id);
        setTeacherEvents(events);
        setStudentRecords([]);
      } else {
        const records = await getAttendanceHistory(user.id);
        setStudentRecords(records);
        setTeacherEvents([]);
      }
    } catch (error) {
      console.error("Failed to load attendance history:", error);
=======
      if (currentRole === "admin") {
        const records = await getAllAttendance();

        setAdminRecords(records);
        setStudentRecords([]);
        setTeacherEvents([]);
      } else if (currentRole === "teacher") {
        const events = await getTeacherEventAttendance(user.id);

        setTeacherEvents(events);
        setStudentRecords([]);
        setAdminRecords([]);
      } else {
        const records = await getAttendanceHistory(user.id);

        setStudentRecords(records);
        setTeacherEvents([]);
        setAdminRecords([]);
      }
    } catch (error) {
      console.error("ATTENDANCE HISTORY ERROR:", error);

      setAdminRecords([]);
      setStudentRecords([]);
      setTeacherEvents([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load attendance history. Please try again.",
      );
>>>>>>> origin/main
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
<<<<<<< HEAD
      load();
    }, [load]),
  );

  const isTeacher = role === "teacher";
  const isEmpty = isTeacher
    ? teacherEvents.length === 0
    : studentRecords.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="flower-outline" size={25} color={COLORS.primary} />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>CCTC • PETAL PASS</Text>
            <Text style={styles.title}>Attendance History</Text>
            <Text style={styles.subtitle}>
              {isTeacher
                ? "Review your events and attendees."
                : "Your attendance journey, all in one place."}
=======
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>

        <Text style={styles.loadingTitle}>Loading attendance</Text>
        <Text style={styles.loadingSubtitle}>
          Please wait while we retrieve your records.
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="person-circle-outline"
          title="Sign in required"
          message="Please sign in to view your attendance history."
        />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.headingIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headingText}>
            <Text style={styles.title}>Attendance History</Text>
            <Text style={styles.subtitle}>
              We couldn't retrieve your attendance records.
            </Text>
          </View>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={36}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>Unable to load history</Text>
          <Text style={styles.emptyText}>{errorMessage}</Text>

          <Text
            onPress={() => {
              void load();
            }}
            style={styles.retryButton}
          >
            Tap here to retry
          </Text>
        </View>
      </View>
    );
  }

  // TEACHER HISTORY
  if (role === "teacher") {
    const totalAttendees = teacherEvents.reduce(
      (total, event) => total + event.attendeeCount,
      0,
    );

    return (
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.headingIcon}>
            <Ionicons
              name="clipboard-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headingText}>
            <Text style={styles.title}>Attendance History</Text>
            <Text style={styles.subtitle}>
              Review your events and their attendees.
>>>>>>> origin/main
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
<<<<<<< HEAD
              name={isTeacher ? "calendar-outline" : "checkmark-done-outline"}
=======
              name="calendar-outline"
>>>>>>> origin/main
              size={24}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.summaryText}>
<<<<<<< HEAD
            <Text style={styles.summaryLabel}>
              {isTeacher ? "Events created" : "Recorded attendance"}
            </Text>
            <Text style={styles.summaryDescription}>
              {loading
                ? "Refreshing your records..."
                : isTeacher
                  ? `${teacherEvents.length} event${teacherEvents.length === 1 ? "" : "s"}`
                  : `${studentRecords.length} record${studentRecords.length === 1 ? "" : "s"}`}
            </Text>
          </View>

          <Ionicons name="heart" size={18} color={COLORS.border} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isTeacher ? "Your Events" : "Recent Records"}
          </Text>
          <View style={styles.sectionAccent} />
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateTitle}>Gathering your records</Text>
            <Text style={styles.stateDescription}>
              Just a moment while we load your history.
            </Text>
          </View>
        ) : isEmpty ? (
          <View style={styles.centerState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={isTeacher ? "calendar-outline" : "qr-code-outline"}
                size={36}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.stateTitle}>
              {isTeacher ? "No events yet" : "A fresh start"}
            </Text>
            <Text style={styles.stateDescription}>
              {isTeacher
                ? "Events you create and their attendance summaries will appear here."
                : "Your attendance records will appear here after you scan an event QR code."}
            </Text>
          </View>
        ) : isTeacher ? (
=======
            <Text style={styles.summaryLabel}>Events Created</Text>
            <Text style={styles.summaryValue}>{teacherEvents.length}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Total Attendees</Text>
            <Text style={styles.summaryValue}>{totalAttendees}</Text>
          </View>
        </View>

        {teacherEvents.length === 0 ? (
          <EmptyState
            icon="calendar-clear-outline"
            title="No events yet"
            message="Events you create and their attendance records will appear here."
          />
        ) : (
>>>>>>> origin/main
          <FlatList
            data={teacherEvents}
            keyExtractor={(item) => item.eventId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
<<<<<<< HEAD
            onRefresh={load}
            refreshing={loading}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name="calendar"
                      size={23}
=======
            refreshing={loading}
            onRefresh={() => {
              void load();
            }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.eventCardHeader}>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name="calendar"
                      size={22}
>>>>>>> origin/main
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventCode}>Code: {item.eventCode}</Text>
                  </View>

                  <View style={styles.attendeeBadge}>
<<<<<<< HEAD
                    <Ionicons name="people" size={15} color={COLORS.primary} />
=======
                    <Ionicons
                      name="people-outline"
                      size={17}
                      color={COLORS.primary}
                    />
>>>>>>> origin/main
                    <Text style={styles.attendeeCount}>
                      {item.attendeeCount}
                    </Text>
                    <Text style={styles.attendeeLabel}>attendees</Text>
                  </View>
                </View>

<<<<<<< HEAD
                <View style={styles.divider} />

                <View style={styles.dateRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.dateLabel}>Starts</Text>
                  <Text style={styles.dateValue}>
                    {item.startTime ? formatDate(item.startTime) : "N/A"}
                  </Text>
                </View>

                <View style={styles.dateRow}>
                  <Ionicons
                    name="flag-outline"
                    size={16}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.dateLabel}>Ends</Text>
                  <Text style={styles.dateValue}>
                    {item.endTime ? formatDate(item.endTime) : "N/A"}
                  </Text>
                </View>

                {item.attendees.length > 0 && (
                  <View style={styles.attendeeList}>
                    <View style={styles.attendeeHeading}>
                      <Ionicons
                        name="people-outline"
                        size={17}
                        color={COLORS.primary}
                      />
                      <Text style={styles.attendeeListTitle}>
                        Attendees ({item.attendees.length})
                      </Text>
                    </View>

                    {item.attendees.map((attendee) => (
=======
                <View style={styles.dateSection}>
                  <View style={styles.dateRow}>
                    <Ionicons
                      name="play-circle-outline"
                      size={17}
                      color={COLORS.success}
                    />
                    <Text style={styles.dateLabel}>Start</Text>
                    <Text style={styles.dateValue}>
                      {item.startTime ? formatDate(item.startTime) : "N/A"}
                    </Text>
                  </View>

                  <View style={styles.dateRow}>
                    <Ionicons
                      name="stop-circle-outline"
                      size={17}
                      color={COLORS.danger}
                    />
                    <Text style={styles.dateLabel}>End</Text>
                    <Text style={styles.dateValue}>
                      {item.endTime ? formatDate(item.endTime) : "N/A"}
                    </Text>
                  </View>
                </View>

                <View style={styles.attendeeSection}>
                  <View style={styles.attendeeSectionHeader}>
                    <Text style={styles.attendeeSectionTitle}>
                      Attendee List
                    </Text>
                    <Text style={styles.attendeeSectionCount}>
                      {item.attendees.length} listed
                    </Text>
                  </View>

                  {item.attendees.length === 0 ? (
                    <Text style={styles.noAttendees}>
                      No attendees recorded for this event yet.
                    </Text>
                  ) : (
                    item.attendees.map((attendee) => (
>>>>>>> origin/main
                      <View
                        key={`${item.eventId}-${attendee.studentId}`}
                        style={styles.attendeeRow}
                      >
<<<<<<< HEAD
                        <View style={styles.avatar}>
                          <Ionicons
                            name="person"
                            size={15}
                            color={COLORS.primary}
                          />
                        </View>
                        <Text style={styles.attendeeName}>
                          {attendee.studentName ?? "Unknown student"}
                        </Text>
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color={COLORS.success}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          />
        ) : (
          <FlatList
            data={studentRecords}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onRefresh={load}
            refreshing={loading}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.studentRecord}>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name="checkmark-done"
                      size={23}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.studentRecordInfo}>
                    <Text style={styles.eventTitle}>{item.eventTitle}</Text>
                    <Text style={styles.eventCode}>
                      Event ID: {item.eventId}
                    </Text>
                    <View style={styles.dateRow}>
                      <Ionicons
                        name="time-outline"
                        size={15}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.recordDate}>
                        {formatDate(item.scannedAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.checkedBadge}>
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={COLORS.success}
                    />
                  </View>
                </View>

                <View style={styles.recordFooter}>
                  <Ionicons name="heart" size={13} color={COLORS.primary} />
                  <Text style={styles.recordFooterText}>
                    Attendance recorded
                  </Text>
=======
                        <View style={styles.attendeeAvatar}>
                          <Text style={styles.attendeeInitial}>
                            {(attendee.studentName || "U")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>

                        <View style={styles.attendeeInfo}>
                          <Text style={styles.attendeeName}>
                            {attendee.studentName || "Unknown student"}
                          </Text>
                          <Text style={styles.attendeeId}>
                            ID: {attendee.studentId}
                          </Text>
                        </View>

                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={COLORS.success}
                        />
                      </View>
                    ))
                  )}
>>>>>>> origin/main
                </View>
              </View>
            )}
          />
        )}
      </View>
<<<<<<< HEAD
    </SafeAreaView>
=======
    );
  }

  // ADMIN HISTORY
  if (role === "admin") {
    return (
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.headingIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headingText}>
            <Text style={styles.title}>Attendance History</Text>
            <Text style={styles.subtitle}>
              Review attendance records across the system.
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="people-outline" size={24} color={COLORS.primary} />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Attendance Records</Text>
            <Text style={styles.summaryValue}>{adminRecords.length}</Text>
          </View>
        </View>

        {adminRecords.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No attendance records"
            message="Attendance records will appear here after students successfully register their attendance."
          />
        ) : (
          <FlatList
            data={adminRecords}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={() => {
              void load();
            }}
            renderItem={({ item }) => (
              <View style={styles.studentRecordCard}>
                <Text style={styles.eventTitle}>{item.eventTitle}</Text>
                <Text style={styles.eventCode}>
                  Student: {item.studentName}
                </Text>
                <Text style={styles.recordDateText}>
                  {formatDate(item.scannedAt)}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    );
  }

  // STUDENT HISTORY
  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <View style={styles.headingIcon}>
          <Ionicons name="time-outline" size={25} color={COLORS.primary} />
        </View>

        <View style={styles.headingText}>
          <Text style={styles.title}>Attendance History</Text>
          <Text style={styles.subtitle}>
            Keep track of the school events you attended.
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="checkmark-done-outline"
            size={24}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Recorded Attendance</Text>
          <Text style={styles.summaryValue}>{studentRecords.length}</Text>
        </View>
      </View>

      {studentRecords.length === 0 ? (
        <EmptyState
          icon="qr-code-outline"
          title="No records yet"
          message="Scan a school event's QR code to register your attendance. Your successful attendance records will appear here."
        />
      ) : (
        <FlatList
          data={studentRecords}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => {
            void load();
          }}
          renderItem={({ item }) => (
            <View style={styles.studentRecord}>
              <View style={styles.timeline}>
                <View style={styles.timelineIcon}>
                  <Ionicons name="checkmark" size={19} color={COLORS.success} />
                </View>
                <View style={styles.timelineLine} />
              </View>

              <View style={styles.studentRecordCard}>
                <View style={styles.studentRecordHeader}>
                  <View style={styles.studentRecordText}>
                    <Text style={styles.eventTitle}>{item.eventTitle}</Text>
                    <Text style={styles.eventCode}>
                      Event ID: {item.eventId}
                    </Text>
                  </View>

                  <View style={styles.presentBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={COLORS.success}
                    />
                    <Text style={styles.presentText}>Recorded</Text>
                  </View>
                </View>

                <View style={styles.recordDate}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.recordDateText}>
                    {formatDate(item.scannedAt)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function EmptyState({
  icon,
  title,
  message,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  message: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={36} color={COLORS.primary} />
      </View>

      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
>>>>>>> origin/main
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
<<<<<<< HEAD
    return "Invalid date";
=======
    return "Date unavailable";
>>>>>>> origin/main
  }

  return date.toLocaleString();
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 13,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 4,
=======
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  loadingTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 7,
  },
  loadingSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 13,
  },
  headingIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headingText: {
    flex: 1,
>>>>>>> origin/main
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.textPrimary,
<<<<<<< HEAD
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
=======
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
>>>>>>> origin/main
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
<<<<<<< HEAD
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
=======
    padding: 17,
    marginBottom: 22,
    gap: 13,
  },
  summaryIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
>>>>>>> origin/main
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
<<<<<<< HEAD
    fontWeight: "600",
  },
  summaryDescription: {
    fontSize: 19,
    color: COLORS.textPrimary,
    fontWeight: "800",
    marginTop: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  sectionAccent: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
=======
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  summaryDivider: {
    width: 1,
    height: 45,
    backgroundColor: COLORS.border,
    marginHorizontal: 3,
>>>>>>> origin/main
  },
  list: {
    paddingBottom: 28,
  },
  card: {
    backgroundColor: COLORS.card,
<<<<<<< HEAD
    borderRadius: 20,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
=======
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
  },
  eventCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },
  eventIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
>>>>>>> origin/main
    alignItems: "center",
    justifyContent: "center",
  },
  eventInfo: {
    flex: 1,
<<<<<<< HEAD
=======
    paddingTop: 2,
>>>>>>> origin/main
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
<<<<<<< HEAD
    marginBottom: 4,
=======
    marginBottom: 5,
>>>>>>> origin/main
  },
  eventCode: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  attendeeBadge: {
<<<<<<< HEAD
    minWidth: 72,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  attendeeCount: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "800",
=======
    minWidth: 65,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  attendeeCount: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.primary,
>>>>>>> origin/main
    marginTop: 2,
  },
  attendeeLabel: {
    fontSize: 9,
<<<<<<< HEAD
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
=======
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dateSection: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 11,
    backgroundColor: COLORS.background,
    borderRadius: 13,
    gap: 10,
>>>>>>> origin/main
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
<<<<<<< HEAD
    marginTop: 7,
    gap: 7,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 42,
=======
    gap: 8,
  },
  dateLabel: {
    width: 34,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
>>>>>>> origin/main
  },
  dateValue: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textPrimary,
<<<<<<< HEAD
    textAlign: "right",
  },
  attendeeList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 14,
    paddingTop: 13,
  },
  attendeeHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 9,
  },
  attendeeListTitle: {
=======
  },
  attendeeSection: {
    marginTop: 16,
  },
  attendeeSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  attendeeSectionTitle: {
>>>>>>> origin/main
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
<<<<<<< HEAD
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    gap: 9,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
=======
  attendeeSectionCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  noAttendees: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textSecondary,
    paddingVertical: 7,
  },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  attendeeAvatar: {
    width: 31,
    height: 31,
    borderRadius: 11,
>>>>>>> origin/main
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
<<<<<<< HEAD
  attendeeName: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  studentRecord: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  studentRecordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  checkedBadge: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#E5F4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  recordFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  recordFooterText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 45,
=======
  attendeeInitial: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  attendeeId: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 35,
    marginTop: 4,
>>>>>>> origin/main
  },
  emptyIcon: {
    width: 76,
    height: 76,
<<<<<<< HEAD
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  stateTitle: {
    fontSize: 17,
    color: COLORS.textPrimary,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 14,
  },
  stateDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});
=======
    borderRadius: 25,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 18,
    padding: 8,
  },
  studentRecord: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  timeline: {
    alignItems: "center",
    width: 35,
  },
  timelineIcon: {
    width: 35,
    height: 35,
    borderRadius: 13,
    backgroundColor: COLORS.successBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    minHeight: 20,
    backgroundColor: COLORS.border,
  },
  studentRecordCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
  },
  studentRecordHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  studentRecordText: {
    flex: 1,
  },
  presentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.successBackground,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 7,
  },
  presentText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.success,
  },
  recordDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 13,
    paddingTop: 11,
  },
  recordDateText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
});
>>>>>>> origin/main
