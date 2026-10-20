import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS } from "@/constants/colors";
import {
  getAttendanceHistory,
  getTeacherEventAttendance,
  type AttendanceRecord,
  type TeacherEventAttendance,
} from "@/lib/attendance";
import { useAuth } from "@/lib/auth";
import { getProfile, type Role } from "@/lib/profiles";

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
  const [teacherEvents, setTeacherEvents] = useState<TeacherEventAttendance[]>(
    [],
  );

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profile = await getProfile(user.id);
      const currentRole = profile?.role ?? "student";

      setRole(currentRole);

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
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
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
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name={isTeacher ? "calendar-outline" : "checkmark-done-outline"}
              size={24}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.summaryText}>
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
          <FlatList
            data={teacherEvents}
            keyExtractor={(item) => item.eventId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onRefresh={load}
            refreshing={loading}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name="calendar"
                      size={23}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventCode}>Code: {item.eventCode}</Text>
                  </View>

                  <View style={styles.attendeeBadge}>
                    <Ionicons name="people" size={15} color={COLORS.primary} />
                    <Text style={styles.attendeeCount}>
                      {item.attendeeCount}
                    </Text>
                    <Text style={styles.attendeeLabel}>attendees</Text>
                  </View>
                </View>

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
                      <View
                        key={`${item.eventId}-${attendee.studentId}`}
                        style={styles.attendeeRow}
                      >
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
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString();
}

const styles = StyleSheet.create({
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
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
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
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  },
  list: {
    paddingBottom: 28,
  },
  card: {
    backgroundColor: COLORS.card,
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
    alignItems: "center",
    justifyContent: "center",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  eventCode: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  attendeeBadge: {
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
    marginTop: 2,
  },
  attendeeLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 7,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 42,
  },
  dateValue: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textPrimary,
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
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
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
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
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
  },
  emptyIcon: {
    width: 76,
    height: 76,
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
