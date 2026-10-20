<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
=======
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
>>>>>>> origin/main
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

<<<<<<< HEAD
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
type UserRole = "student" | "teacher" | "admin";

type DashboardAction = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route:
    | "/scan"
    | "/history"
    | "/profile"
    | "/(tabs)/teacher"
    | "/(tabs)/admin";
  primary?: boolean;
};

const ROLE_CONTENT: Record<
  UserRole,
  {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    actions: DashboardAction[];
  }
> = {
  student: {
    eyebrow: "STUDENT DASHBOARD",
    title: "Make every",
    accent: "moment count.",
    description:
      "Check in to campus activities, keep track of your attendance, and stay informed about school events.",
    icon: "school-outline",
    actions: [
      {
        title: "Scan Event QR Code",
        description: "Record your attendance at school activities.",
        icon: "qr-code-outline",
        route: "/scan",
        primary: true,
      },
      {
        title: "My Attendance",
        description: "Review your recorded event attendance.",
=======
import Header from "@/components/Header";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/lib/auth";
import { getProfile, type Role } from "@/lib/profiles";

type HomeAction = {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  route: string;
};

const HOME_CONTENT: Record<
  Role,
  {
    badge: string;
    title: string;
    subtitle: string;
    actions: HomeAction[];
  }
> = {
  student: {
    badge: "STUDENT PORTAL",
    title: "Your attendance, made simple.",
    subtitle: "Scan event QR codes and keep track of your school activities.",
    actions: [
      {
        title: "Scan Event QR",
        description: "Record your attendance at an event.",
        icon: "qr-code-outline",
        route: "/scan",
      },
      {
        title: "Attendance History",
        description: "Review your previous attendance records.",
>>>>>>> origin/main
        icon: "time-outline",
        route: "/history",
      },
      {
<<<<<<< HEAD
        title: "My Profile",
        description: "View your account and student information.",
        icon: "person-circle-outline",
=======
        title: "Teacher Verification",
        description: "Request teacher access if needed.",
        icon: "shield-checkmark-outline",
        route: "/verification",
      },
      {
        title: "My Profile",
        description: "View your account information.",
        icon: "person-outline",
>>>>>>> origin/main
        route: "/profile",
      },
    ],
  },
  teacher: {
<<<<<<< HEAD
    eyebrow: "TEACHER DASHBOARD",
    title: "Guide every",
    accent: "school event.",
    description:
      "Access your teacher workspace to manage assigned activities and support accurate attendance monitoring.",
    icon: "clipboard-outline",
    actions: [
      {
        title: "Teacher Workspace",
        description: "Open your teacher dashboard and event tools.",
        icon: "easel-outline",
        route: "/(tabs)/teacher",
        primary: true,
      },
      {
        title: "Event Attendance",
        description: "Access attendance-related tools in your workspace.",
        icon: "people-outline",
        route: "/(tabs)/teacher",
=======
    badge: "TEACHER PORTAL",
    title: "Manage your school events.",
    subtitle:
      "Create events, display QR codes, manage event status, and review attendance.",
    actions: [
      {
        title: "Event Management",
        description: "Create and manage your events.",
        icon: "calendar-outline",
        route: "/teacher",
      },
      {
        title: "Attendance History",
        description: "View past attendance records for your events.",
        icon: "time-outline",
        route: "/history",
>>>>>>> origin/main
      },
      {
        title: "My Profile",
        description: "View your account information.",
<<<<<<< HEAD
        icon: "person-circle-outline",
=======
        icon: "person-outline",
>>>>>>> origin/main
        route: "/profile",
      },
    ],
  },
  admin: {
<<<<<<< HEAD
    eyebrow: "ADMINISTRATOR DASHBOARD",
    title: "Keep campus",
    accent: "running smoothly.",
    description:
      "Manage user accounts, review teacher verification requests, organize events, and oversee attendance records.",
    icon: "shield-checkmark-outline",
    actions: [
      {
        title: "Administration",
        description: "Manage users, roles, and student information.",
        icon: "settings-outline",
        route: "/(tabs)/admin",
        primary: true,
      },
      {
        title: "Teacher Verification",
        description: "Review verification requests in the admin workspace.",
        icon: "person-add-outline",
        route: "/(tabs)/admin",
      },
      {
        title: "Events & Attendance",
        description: "Manage school events and monitor attendance records.",
        icon: "calendar-outline",
        route: "/(tabs)/admin",
=======
    badge: "ADMINISTRATOR PORTAL",
    title: "Your school, at a glance.",
    subtitle:
      "Manage accounts, events, attendance records, and school reports.",
    actions: [
      {
        title: "Admin Dashboard",
        description: "Open your administrative management tools.",
        icon: "grid-outline",
        route: "/admin",
      },
      {
        title: "My Profile",
        description: "View your account information.",
        icon: "person-outline",
        route: "/profile",
>>>>>>> origin/main
      },
    ],
  },
};

<<<<<<< HEAD
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

  const [role, setRole] = useState<UserRole>("student");
  const [loadingRole, setLoadingRole] = useState(true);
  const [roleError, setRoleError] = useState(false);

  const loadRole = useCallback(async () => {
    setLoadingRole(true);
    setRoleError(false);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        setRole("student");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const fetchedRole = data?.role;

      if (
        fetchedRole === "student" ||
        fetchedRole === "teacher" ||
        fetchedRole === "admin"
      ) {
        setRole(fetchedRole);
      } else {
        setRole("student");
      }
    } catch (error) {
      console.error("Could not load user role:", error);
      setRoleError(true);
    } finally {
      setLoadingRole(false);
    }
  }, []);

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
      void loadRole();
      void loadEvents();
    }, [loadRole, loadEvents]),
  );

  const now = Date.now();

  const availableEvents = events.filter((event) => {
    if (!event.end_time) return true;

    const end = new Date(event.end_time).getTime();

    return !Number.isFinite(end) || end >= now;
  });

  const dashboard = ROLE_CONTENT[role];
=======
export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (!user?.id) {
        if (active) {
          setRole(null);
          setLoadingProfile(false);
        }
        return;
      }

      setLoadingProfile(true);

      try {
        const profile = await getProfile(user.id);

        if (active) {
          setRole(profile?.role ?? "student");
        }
      } catch (error) {
        console.error("HOME ROLE ERROR:", error);

        if (active) {
          setRole("student");
        }
      } finally {
        if (active) {
          setLoadingProfile(false);
        }
      }
    }

    void loadRole();

    return () => {
      active = false;
    };
  }, [user?.id]);

  if (authLoading || loadingProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons
          name="person-circle-outline"
          size={54}
          color={COLORS.primary}
        />
        <Text style={styles.loadingTitle}>Sign in to continue</Text>
        <Text style={styles.loadingText}>
          Log in to access your personalized dashboard.
        </Text>
        <Pressable
          onPress={() => router.replace("/login")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Go to Sign In</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const content = HOME_CONTENT[role ?? "student"];
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "there";
>>>>>>> origin/main

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
<<<<<<< HEAD
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand header */}
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

        {/* Role-based welcome panel */}
        <View style={styles.heroCard}>
          <View style={styles.flowerTopRight}>
            <Ionicons name="flower-outline" size={96} color={COLORS.border} />
          </View>

          <View style={styles.heroBadge}>
            <Ionicons name={dashboard.icon} size={27} color={COLORS.primary} />
            <View style={styles.badgeFlower}>
              <Ionicons name="flower" size={14} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.eyebrow}>
            {loadingRole ? "LOADING YOUR WORKSPACE" : dashboard.eyebrow}
          </Text>

          {roleError ? (
            <View style={styles.roleErrorCard}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={COLORS.danger}
              />
              <View style={styles.roleErrorContent}>
                <Text style={styles.roleErrorTitle}>
                  Unable to verify your role
                </Text>
                <Text style={styles.roleErrorText}>
                  Your dashboard may show the default student view. Try
                  reloading your account information.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadRole()}
                  style={styles.retryButton}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.mainTitle}>
                {dashboard.title}
                {"\n"}
                <Text style={styles.titleAccent}>{dashboard.accent}</Text>
              </Text>

              <Text style={styles.subtitle}>{dashboard.description}</Text>
            </>
          )}

          <View style={styles.decorativeDivider}>
            <View style={styles.dividerLine} />
            <Ionicons name="flower" size={15} color={COLORS.primary} />
            <View style={styles.dividerLine} />
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
              <Text style={styles.featureTitle}>School events</Text>
              <Text style={styles.featureDescription}>
                Stay informed about upcoming campus activities and schedules.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons
                name={
                  role === "student"
                    ? "qr-code-outline"
                    : role === "teacher"
                      ? "clipboard-outline"
                      : "shield-checkmark-outline"
                }
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                {role === "student"
                  ? "Easy attendance check-in"
                  : role === "teacher"
                    ? "Event coordination"
                    : "Centralized administration"}
              </Text>
              <Text style={styles.featureDescription}>
                {role === "student"
                  ? "Scan event QR codes and review your attendance."
                  : role === "teacher"
                    ? "Access teacher tools for your event responsibilities."
                    : "Access user management, verification, events, and attendance."}
              </Text>
            </View>
          </View>
        </View>

        {/* Role-based responsibilities and shortcuts */}
        <View style={styles.actionsSection}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>
                {role === "student"
                  ? "Student Services"
                  : role === "teacher"
                    ? "Teacher Tools"
                    : "Admin Controls"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {role === "student"
                  ? "Manage your attendance and student account."
                  : role === "teacher"
                    ? "Access tools for your teaching responsibilities."
                    : "Manage and monitor school attendance operations."}
              </Text>
            </View>

            <View style={styles.eventHeadingIcon}>
              <Ionicons
                name={dashboard.icon}
                size={23}
                color={COLORS.primary}
              />
            </View>
          </View>

          {loadingRole ? (
            <View style={styles.eventsStateCard}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.stateText}>
                Loading role-specific features...
              </Text>
            </View>
          ) : (
            <View style={styles.actionList}>
              {dashboard.actions.map((action, index) => (
                <Pressable
                  key={`${role}-${action.title}`}
                  accessibilityRole="button"
                  accessibilityLabel={action.title}
                  onPress={() => router.push(action.route as never)}
                  style={({ pressed }) => [
                    styles.roleActionCard,
                    action.primary && styles.roleActionCardPrimary,
                    pressed && styles.roleActionPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.roleActionIcon,
                      action.primary && styles.roleActionIconPrimary,
                    ]}
                  >
                    <Ionicons
                      name={action.icon}
                      size={23}
                      color={
                        action.primary ? COLORS.textOnPrimary : COLORS.primary
                      }
                    />
                  </View>

                  <View style={styles.roleActionText}>
                    <Text
                      style={[
                        styles.roleActionTitle,
                        action.primary && styles.roleActionTitlePrimary,
                      ]}
                    >
                      {action.title}
                    </Text>
                    <Text
                      style={[
                        styles.roleActionDescription,
                        action.primary && styles.roleActionDescriptionPrimary,
                      ]}
                    >
                      {action.description}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={
                      action.primary
                        ? COLORS.textOnPrimary
                        : COLORS.textSecondary
                    }
                  />
                </Pressable>
              ))}
            </View>
          )}
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

                    {role === "student" && (
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
                    )}
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

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Ionicons name="flower-outline" size={16} color={COLORS.primary} />
          <View style={styles.footerDivider} />

          <Text style={styles.footerTagline}>SCAN. ATTEND. BLOOM.</Text>
          <Text style={styles.footerText}>
            CCTC Petal Pass · School Event Attendance
          </Text>
        </View>
=======
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Header title="" />
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.badge}>
            <Ionicons
              name={
                role === "admin"
                  ? "shield-checkmark"
                  : role === "teacher"
                    ? "school"
                    : "person"
              }
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.badgeText}>{content.badge}</Text>
          </View>

          <Text style={styles.greeting}>Welcome, {displayName}!</Text>
          <Text style={styles.welcomeTitle}>{content.title}</Text>
          <Text style={styles.welcomeSubtitle}>{content.subtitle}</Text>

          <View style={styles.heroIcon}>
            <Ionicons
              name={
                role === "admin"
                  ? "shield-checkmark-outline"
                  : role === "teacher"
                    ? "easel-outline"
                    : "qr-code-outline"
              }
              size={44}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.decorativeCircle} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Dashboard</Text>
          <Text style={styles.sectionSubtitle}>
            Choose what you would like to do.
          </Text>
        </View>

        <View style={styles.actions}>
          {content.actions.map((action) => (
            <Pressable
              key={action.title}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              onPress={() => router.push(action.route as never)}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={26} color={COLORS.primary} />
              </View>

              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>
                  {action.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={21}
                color={COLORS.primary}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={23}
            color={COLORS.primary}
          />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>QR - ATT</Text>
            <Text style={styles.infoDescription}>
              Your school attendance companion. Available features depend on
              your assigned account role.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          QR - ATT · Smart School Event Attendance
        </Text>
>>>>>>> origin/main
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
<<<<<<< HEAD
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
  roleErrorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleErrorContent: {
    flex: 1,
    gap: 6,
  },
  roleErrorTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  roleErrorText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  actionsSection: {
    gap: 13,
    marginBottom: 26,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
    lineHeight: 18,
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
  actionList: {
    gap: 11,
  },
  roleActionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 15,
    backgroundColor: COLORS.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 6,
    elevation: 1,
  },
  roleActionCardPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleActionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  roleActionIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  roleActionIconPrimary: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.35)",
  },
  roleActionText: {
    flex: 1,
    gap: 5,
  },
  roleActionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  roleActionTitlePrimary: {
    color: COLORS.textOnPrimary,
  },
  roleActionDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  roleActionDescriptionPrimary: {
    color: COLORS.textOnPrimary,
    opacity: 0.92,
  },
  eventsSection: {
    gap: 13,
    marginBottom: 26,
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
=======
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
    gap: 12,
  },
  loadingTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 13,
    marginTop: 8,
  },
  primaryButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  headerContainer: {
    paddingHorizontal: 4,
    paddingTop: 4,
    marginBottom: 12,
  },
  welcomeCard: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 28,
    padding: 22,
    overflow: "hidden",
    position: "relative",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.card,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    marginBottom: 17,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },
  welcomeTitle: {
    color: COLORS.textPrimary,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "800",
    marginBottom: 9,
    maxWidth: 280,
  },
  welcomeSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 290,
    paddingRight: 8,
  },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 21,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  decorativeCircle: {
    position: "absolute",
    width: 175,
    height: 175,
    borderRadius: 90,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.2,
    right: -65,
    bottom: -75,
  },
  sectionHeader: {
    paddingHorizontal: 22,
    marginBottom: 15,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 5,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  actions: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    gap: 13,
  },
  actionIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },
  actionDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 20,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },
  infoDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },
  footer: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 20,
  },
});
>>>>>>> origin/main
