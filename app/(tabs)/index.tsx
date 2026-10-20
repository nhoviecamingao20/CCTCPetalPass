import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "@/components/AppButton";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

type SchoolEvent = {
  id: string;
  event_code: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
};

type EventSchedule = "Upcoming" | "Ongoing" | "Schedule TBA";

function getEventSchedule(event: SchoolEvent): EventSchedule {
  const now = Date.now();
  const start = event.start_time ? new Date(event.start_time).getTime() : null;
  const end = event.end_time ? new Date(event.end_time).getTime() : null;

  if (start !== null && !Number.isFinite(start)) {
    return "Schedule TBA";
  }

  if (end !== null && !Number.isFinite(end)) {
    return "Schedule TBA";
  }

  if (start !== null && now < start) {
    return "Upcoming";
  }

  if (end !== null && now > end) {
    return "Upcoming";
  }

  if (start !== null && now >= start) {
    return "Ongoing";
  }

  return "Schedule TBA";
}

function formatEventDate(value: string | null): string {
  if (!value) return "Schedule to be announced";

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "Schedule to be announced";
  }

  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Index() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    setEventError(null);

    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, event_code, title, start_time, end_time")
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Could not load school events:", error);
        setEventError("Unable to load school events. Please try again.");
        setEvents([]);
        return;
      }

      setEvents((data ?? []) as SchoolEvent[]);
    } catch (error) {
      console.error("Unexpected event loading error:", error);
      setEventError("Something went wrong while loading school events.");
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadEvents();
    }, [loadEvents]),
  );

  const now = Date.now();

  const availableEvents = events.filter((event) => {
    if (!event.end_time) return true;

    const end = new Date(event.end_time).getTime();

    return !Number.isFinite(end) || end >= now;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandHeader}>
          <View style={styles.brandIcon}>
            <Ionicons name="flower-outline" size={27} color={COLORS.primary} />
          </View>

          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName}>CCTC Petal Pass</Text>
            <Text style={styles.brandSubtitle}>
              CONSOLATRIX COLLEGE OF TOLEDO CITY
            </Text>
          </View>

          <View style={styles.headerFlower}>
            <Ionicons name="flower" size={20} color={COLORS.primary} />
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.flowerTopRight}>
            <Ionicons name="flower-outline" size={96} color={COLORS.border} />
          </View>

          <View style={styles.heroBadge}>
            <Ionicons name="qr-code-outline" size={27} color={COLORS.primary} />
            <View style={styles.badgeFlower}>
              <Ionicons name="flower" size={14} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.eyebrow}>YOUR CAMPUS, CONNECTED</Text>

          <Text style={styles.mainTitle}>
            Your Pass to{"\n"}
            <Text style={styles.titleAccent}>Every Event.</Text>
          </Text>

          <Text style={styles.subtitle}>
            Check in at school programs, seminars, and campus activities with a
            quick QR scan. Your attendance records are always within reach.
          </Text>

          <View style={styles.decorativeDivider}>
            <View style={styles.dividerLine} />
            <Ionicons name="flower" size={15} color={COLORS.primary} />
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="scan-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Quick event check-in</Text>
              <Text style={styles.featureDescription}>
                Scan the event QR code to record your attendance.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Your attendance history</Text>
              <Text style={styles.featureDescription}>
                Review your recorded school event participation.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>One school account</Text>
              <Text style={styles.featureDescription}>
                Access your attendance features after signing in.
              </Text>
            </View>
          </View>
        </View>

        {/* School events loaded from Supabase */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>School Events</Text>
              <Text style={styles.sectionSubtitle}>
                Discover upcoming campus activities.
              </Text>
            </View>

            <View style={styles.eventHeadingIcon}>
              <Ionicons name="calendar" size={23} color={COLORS.primary} />
            </View>
          </View>

          {loadingEvents ? (
            <View style={styles.eventsStateCard}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.stateText}>Loading school events...</Text>
            </View>
          ) : eventError ? (
            <View style={styles.eventsStateCard}>
              <Ionicons
                name="cloud-offline-outline"
                size={29}
                color={COLORS.danger}
              />
              <Text style={styles.stateTitle}>Events unavailable</Text>
              <Text style={styles.stateText}>{eventError}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void loadEvents()}
                style={styles.retryButton}
              >
                <Ionicons
                  name="refresh-outline"
                  size={17}
                  color={COLORS.primary}
                />
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : availableEvents.length === 0 ? (
            <View style={styles.eventsStateCard}>
              <View style={styles.emptyEventIcon}>
                <Ionicons
                  name="flower-outline"
                  size={30}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.stateTitle}>No upcoming events</Text>
              <Text style={styles.stateText}>
                New school activities will appear here when they are added.
              </Text>
            </View>
          ) : (
            <View style={styles.eventList}>
              {availableEvents.map((event) => {
                const schedule = getEventSchedule(event);

                return (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={styles.eventCardTop}>
                      <View style={styles.eventIcon}>
                        <Ionicons
                          name="calendar-outline"
                          size={23}
                          color={COLORS.primary}
                        />
                      </View>

                      <View style={styles.eventTitleContainer}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventCode}>
                          EVENT CODE: {event.event_code}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          schedule === "Ongoing"
                            ? styles.ongoingBadge
                            : styles.upcomingBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            schedule === "Ongoing"
                              ? styles.ongoingText
                              : styles.upcomingText,
                          ]}
                        >
                          {schedule}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.eventDateRow}>
                      <Ionicons
                        name="time-outline"
                        size={17}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.eventDate}>
                        Starts: {formatEventDate(event.start_time)}
                      </Text>
                    </View>

                    <View style={styles.eventDateRow}>
                      <Ionicons
                        name="hourglass-outline"
                        size={17}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.eventDate}>
                        Ends: {formatEventDate(event.end_time)}
                      </Text>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push("/scan")}
                      style={styles.scanEventButton}
                    >
                      <Ionicons
                        name="qr-code-outline"
                        size={17}
                        color={COLORS.textOnPrimary}
                      />
                      <Text style={styles.scanEventButtonText}>
                        Scan Event QR
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={COLORS.textOnPrimary}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => void loadEvents()}
            style={styles.refreshEventsButton}
          >
            <Ionicons name="refresh-outline" size={17} color={COLORS.primary} />
            <Text style={styles.retryText}>Refresh events</Text>
          </Pressable>
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>Ready to check in?</Text>
              <Text style={styles.sectionSubtitle}>
                Choose your next destination.
              </Text>
            </View>
            <Ionicons name="flower-outline" size={28} color={COLORS.border} />
          </View>

          <View style={styles.buttonContainer}>
            <AppButton
              theme="primary"
              title="Scan Event QR Code"
              icon="qr-code-outline"
              onPress={() => router.push("/scan")}
            />

            <AppButton
              title="Attendance History"
              icon="time-outline"
              onPress={() => router.push("/history")}
            />

            <AppButton
              title="My Profile"
              icon="person-outline"
              onPress={() => router.push("/profile")}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Ionicons name="flower-outline" size={16} color={COLORS.primary} />
          <View style={styles.footerDivider} />

          <Text style={styles.footerTagline}>SCAN. ATTEND. BLOOM.</Text>
          <Text style={styles.footerText}>
            CCTC Petal Pass · School Event Attendance
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
  },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 22,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextContainer: {
    flex: 1,
    gap: 4,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: 0.1,
  },
  brandSubtitle: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: COLORS.textSecondary,
  },
  headerFlower: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.card,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 21,
    marginBottom: 26,
    gap: 13,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  flowerTopRight: {
    position: "absolute",
    top: -16,
    right: -17,
    opacity: 0.55,
  },
  heroBadge: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeFlower: {
    position: "absolute",
    right: -5,
    bottom: -5,
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: COLORS.primary,
    marginTop: 5,
  },
  mainTitle: {
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.7,
  },
  titleAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  decorativeDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 3,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 5,
  },
  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTextContainer: {
    flex: 1,
    gap: 3,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  featureDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  eventsSection: {
    gap: 13,
    marginBottom: 26,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  sectionHeadingText: {
    flex: 1,
    gap: 5,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  eventHeadingIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventsStateCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 23,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  stateText: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  emptyEventIcon: {
    width: 57,
    height: 57,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginTop: 3,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  eventList: {
    gap: 13,
  },
  eventCard: {
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 1,
  },
  eventCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  eventIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  eventTitleContainer: {
    flex: 1,
    gap: 5,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  eventCode: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
    alignSelf: "flex-start",
  },
  upcomingBadge: {
    backgroundColor: COLORS.surface,
  },
  ongoingBadge: {
    backgroundColor: "#EAF5EF",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "900",
  },
  upcomingText: {
    color: COLORS.primary,
  },
  ongoingText: {
    color: COLORS.success,
  },
  eventDateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  eventDate: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  scanEventButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
  },
  scanEventButtonText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textOnPrimary,
  },
  refreshEventsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  actionsSection: {
    gap: 12,
  },
  buttonContainer: {
    gap: 12,
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginTop: 27,
  },
  footerDivider: {
    width: 35,
    height: 1,
    backgroundColor: COLORS.border,
  },
  footerTagline: {
    width: "100%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: COLORS.primary,
    marginTop: 4,
  },
  footerText: {
    width: "100%",
    textAlign: "center",
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});
