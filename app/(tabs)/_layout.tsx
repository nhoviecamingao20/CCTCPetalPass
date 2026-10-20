import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
<<<<<<< HEAD
import { useCallback, useEffect, useState } from "react";

import { COLORS } from "@/constants/colors";
import { useAuth } from "@/lib/auth";
import { getProfile, type Role } from "@/lib/profiles";

export default function TabLayout() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const loadRole = useCallback(async () => {
    if (!user?.id) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);

    try {
      const profile = await getProfile(user.id);
      setRole(profile?.role ?? null);
    } catch (error) {
      console.error("Failed to load navigation role:", error);
      setRole(null);
    } finally {
      setRoleLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadRole();
  }, [loadRole]);

  const commonScreenOptions = {
    headerStyle: {
      backgroundColor: COLORS.background,
    },
    headerShadowVisible: false,
    headerTintColor: COLORS.textPrimary,
    headerTitleStyle: {
      fontWeight: "800" as const,
      fontSize: 18,
    },
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.textSecondary,
    tabBarStyle: {
      backgroundColor: COLORS.card,
      borderTopColor: COLORS.border,
      borderTopWidth: 1,
      height: 64,
      paddingTop: 7,
      paddingBottom: 7,
      elevation: 0,
    },
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: "700" as const,
      marginTop: 2,
    },
    tabBarItemStyle: {
      paddingVertical: 1,
    },
  };

  const icon = (
    focused: boolean,
    active: keyof typeof Ionicons.glyphMap,
    inactive: keyof typeof Ionicons.glyphMap,
    color: string,
  ) => <Ionicons name={focused ? active : inactive} color={color} size={23} />;

  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  return (
    <Tabs
      key={role ?? (roleLoading ? "loading" : "unknown")}
      screenOptions={{
        ...commonScreenOptions,
        // Keep tabs hidden until the user's role has been checked.
        tabBarStyle: [
          commonScreenOptions.tabBarStyle,
          roleLoading ? { display: "none" } : undefined,
        ],
=======

import { COLORS } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerShadowVisible: false,
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 20,
        },

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          borderRadius: 14,
          paddingTop: 4,
        },
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 7,
          paddingBottom: 8,
          elevation: 8,
          shadowColor: COLORS.shadow,
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
>>>>>>> origin/main
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
<<<<<<< HEAD
          title: "Petal Pass",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) =>
            icon(focused, "flower", "flower-outline", color),
=======
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={23}
            />
          ),
>>>>>>> origin/main
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
<<<<<<< HEAD
          title: "Scan Event",
          href: isStudent ? undefined : null,
          tabBarLabel: "Scan QR",
          tabBarIcon: ({ color, focused }) =>
            icon(focused, "qr-code", "qr-code-outline", color),
=======
          title: "Scan",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "qr-code" : "qr-code-outline"}
              color={color}
              size={23}
            />
          ),
>>>>>>> origin/main
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
<<<<<<< HEAD
          title: isTeacher ? "Event Attendance" : "Attendance History",
          href: isStudent || isTeacher ? undefined : null,
          tabBarLabel: isTeacher ? "Attendance" : "History",
          tabBarIcon: ({ color, focused }) =>
            icon(focused, "time", "time-outline", color),
=======
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              color={color}
              size={23}
            />
          ),
>>>>>>> origin/main
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
<<<<<<< HEAD
          title: "My Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, focused }) =>
            icon(focused, "person", "person-outline", color),
=======
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={23}
            />
          ),
>>>>>>> origin/main
        }}
      />

      <Tabs.Screen
        name="teacher"
        options={{
<<<<<<< HEAD
          title: "Events",
          // Teachers and admins can access the event screen.
          href: isTeacher || isAdmin ? undefined : null,
          // Admin sees "Event"; teacher keeps "Events".
          tabBarLabel: isAdmin ? "Event" : "Events",
          tabBarIcon: ({ color, focused }) =>
            icon(focused, "calendar", "calendar-outline", color),
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: "User Management",
          // Admin-only screen; hidden from the bottom navigation for other roles.
          href: isAdmin ? null : null,
          tabBarLabel: "Users",
          tabBarIcon: ({ color, focused }) =>
            icon(focused, "people", "people-outline", color),
=======
          title: "Teacher",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "clipboard" : "clipboard-outline"}
              color={color}
              size={23}
            />
          ),
>>>>>>> origin/main
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
<<<<<<< HEAD
          title: "Admin Dashboard",
          href: isAdmin ? undefined : null,
          tabBarLabel: "Admin",
          tabBarIcon: ({ color, focused }) =>
            icon(
              focused,
              "shield-checkmark",
              "shield-checkmark-outline",
              color,
            ),
=======
          title: "Admin",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "shield-checkmark" : "shield-checkmark-outline"}
              color={color}
              size={23}
            />
          ),
>>>>>>> origin/main
        }}
      />
    </Tabs>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/main
