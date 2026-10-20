import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import AppButton from "@/components/AppButton";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/lib/auth";
import {
  createEvent,
  getEventsByTeacher,
  updateEvent,
  updateEventStatus,
  type CloudEvent,
  type Event,
  type EventStatus,
} from "@/lib/events";
import { getProfile, type Role } from "@/lib/profiles";
import { buildQRPayload } from "@/lib/qr";

type PickerTarget = "start" | "end" | "editStart" | "editEnd";
type MessageType = "success" | "error";

const QUICK_END_OPTIONS = [
  { label: "+30 min", ms: 30 * 60 * 1000 },
  { label: "+1 hour", ms: 60 * 60 * 1000 },
  { label: "+2 hours", ms: 2 * 60 * 60 * 1000 },
];

const toUtcISO = (date: Date) => date.toISOString();

function formatDateTime(date: Date) {
  const dateText = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timeText = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateText} at ${timeText}`;
}

function safeDate(value: string | null, fallback: Date) {
  if (!value) return new Date(fallback);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(fallback) : parsed;
}

function eventStatus(event: CloudEvent): EventStatus {
  return event.status === "closed" ? "closed" : "open";
}

export default function TeacherScreen() {
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [events, setEvents] = useState<CloudEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000),
  );

  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [pickerPart, setPickerPart] = useState<"date" | "time">("date");

  const [editingEvent, setEditingEvent] = useState<CloudEvent | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStart, setEditStart] = useState(new Date());
  const [editEnd, setEditEnd] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000),
  );

  const [payload, setPayload] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>("success");
  const [saving, setSaving] = useState(false);
  const [busyEventId, setBusyEventId] = useState<string | null>(null);

  const isAndroid = Platform.OS === "android";

  const showMessage = (text: string, type: MessageType) => {
    setMessage(text);
    setMessageType(type);
  };

  const loadEvents = useCallback(async (teacherId: string) => {
    setEventsLoading(true);
    try {
      const rows = await getEventsByTeacher(teacherId);
      setEvents(rows);
    } catch (error) {
      console.error("Unable to load events:", error);
      showMessage("Unable to load your events. Please try again.", "error");
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const now = new Date();
      setStartDate(now);
      setEndDate(new Date(now.getTime() + 60 * 60 * 1000));
      setPayload(null);
      setMessage(null);
      setPickerTarget(null);
      setEditingEvent(null);

      if (!user) {
        setRole(null);
        setRoleLoading(false);
        setEvents([]);
        return () => {
          active = false;
        };
      }

      // Preserve the non-null user value for the async function below.
      const currentUser = user;

      setRoleLoading(true);

      async function initialize() {
        try {
          const profile = await getProfile(currentUser.id);
          if (!active) return;

          const currentRole = profile?.role ?? "student";
          setRole(currentRole);

          if (currentRole === "teacher" || currentRole === "admin") {
            const rows = await getEventsByTeacher(currentUser.id);
            if (active) setEvents(rows);
          } else {
            setEvents([]);
          }
        } catch (error) {
          console.error("Failed to initialize teacher dashboard:", error);
          if (active) setRole("student");
        } finally {
          if (active) setRoleLoading(false);
        }
      }

      void initialize();

      return () => {
        active = false;
      };
    }, [user]),
  );

  const openPicker = (target: PickerTarget) => {
    setPickerTarget(target);
    setPickerPart("date");
    setMessage(null);
  };

  const handlePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (!pickerTarget) return;

    if (event.type === "dismissed" || !selected) {
      setPickerTarget(null);
      setPickerPart("date");
      return;
    }

    const isStart = pickerTarget === "start" || pickerTarget === "editStart";
    const isEditing =
      pickerTarget === "editStart" || pickerTarget === "editEnd";

    const current = isEditing
      ? isStart
        ? editStart
        : editEnd
      : isStart
        ? startDate
        : endDate;

    const next = new Date(current);

    if (isAndroid && pickerPart === "date") {
      next.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );

      if (isEditing) {
        if (isStart) setEditStart(next);
        else setEditEnd(next);
      } else {
        if (isStart) setStartDate(next);
        else setEndDate(next);
      }

      setPickerPart("time");
      return;
    }

    next.setFullYear(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
    );
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);

    if (isEditing) {
      if (isStart) setEditStart(next);
      else setEditEnd(next);
    } else {
      if (isStart) setStartDate(next);
      else setEndDate(next);
    }

    setPickerTarget(null);
    setPickerPart("date");
  };

  const handleCreateEvent = async () => {
    if (saving) return;

    if (!user) {
      showMessage("Please sign in before creating an event.", "error");
      return;
    }

    const eventData: Event = {
      eventId: eventCode.trim(),
      title: title.trim(),
      start: toUtcISO(startDate),
      end: toUtcISO(endDate),
    };

    if (!eventData.eventId || !eventData.title) {
      showMessage("Enter both the event title and event code.", "error");
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      showMessage("The end time must be later than the start time.", "error");
      return;
    }

    setSaving(true);
    setMessage(null);
    setPayload(null);

    try {
      const { error } = await createEvent(eventData);

      if (error) {
        showMessage(`Unable to create event: ${error}`, "error");
        return;
      }

      setPayload(buildQRPayload(eventData));
      setTitle("");
      setEventCode("");
      showMessage(
        "Event created successfully. Your QR code is ready.",
        "success",
      );
      await loadEvents(user.id);
    } catch (error) {
      console.error("Event creation failed:", error);
      showMessage(
        `Unable to create event: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (event: CloudEvent) => {
    const now = new Date();
    setEditingEvent(event);
    setEditTitle(event.title);
    setEditStart(safeDate(event.start_time, now));
    setEditEnd(
      safeDate(event.end_time, new Date(now.getTime() + 60 * 60 * 1000)),
    );
    setPickerTarget(null);
    setMessage(null);
  };

  const saveEdit = async () => {
    if (!editingEvent || saving) return;

    if (!editTitle.trim()) {
      showMessage("Event title is required.", "error");
      return;
    }

    if (editEnd.getTime() <= editStart.getTime()) {
      showMessage("The end time must be later than the start time.", "error");
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateEvent(editingEvent.id, {
        title: editTitle.trim(),
        start: toUtcISO(editStart),
        end: toUtcISO(editEnd),
      });

      if (error) {
        showMessage(`Unable to update event: ${error}`, "error");
        return;
      }

      setEditingEvent(null);
      setPickerTarget(null);
      showMessage("Event details updated successfully.", "success");
      if (user) await loadEvents(user.id);
    } catch (error) {
      showMessage(
        `Unable to update event: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = (event: CloudEvent) => {
    const nextStatus: EventStatus =
      eventStatus(event) === "open" ? "closed" : "open";

    Alert.alert(
      nextStatus === "closed" ? "Close this event?" : "Reopen this event?",
      nextStatus === "closed"
        ? "This changes the event status to closed. The QR scanning code must also check this status to block attendance."
        : "This changes the event status back to open.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: nextStatus === "closed" ? "Close Event" : "Reopen Event",
          style: nextStatus === "closed" ? "destructive" : "default",
          onPress: async () => {
            setBusyEventId(event.id);
            try {
              const { error } = await updateEventStatus(event.id, nextStatus);

              if (error) {
                showMessage(`Unable to update status: ${error}`, "error");
                return;
              }

              showMessage(`${event.title} is now ${nextStatus}.`, "success");
              if (user) await loadEvents(user.id);
            } catch (error) {
              showMessage(
                `Unable to update status: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
                "error",
              );
            } finally {
              setBusyEventId(null);
            }
          },
        },
      ],
    );
  };

  if (roleLoading) {
    return (
      <View style={styles.lockContainer}>
        <Ionicons name="flower-outline" size={38} color={COLORS.primary} />
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 18 }}
        />
        <Text style={styles.lockTitle}>Preparing your dashboard</Text>
        <Text style={styles.lockSubtitle}>
          Just a moment while we verify your account.
        </Text>
      </View>
    );
  }

  if (role !== "teacher" && role !== "admin") {
    return (
      <View style={styles.lockContainer}>
        <Ionicons name="lock-closed-outline" size={42} color={COLORS.primary} />
        <Text style={styles.lockTitle}>Authorized Staff Only</Text>
        <Text style={styles.lockSubtitle}>
          Event management is available to verified teachers and administrators.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="flower" size={25} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandName}>CCTC PETAL PASS</Text>
            <Text style={styles.brandTagline}>Your Pass to Every Event.</Text>
          </View>
        </View>

        <View style={styles.heroLabel}>
          <Ionicons name="sparkles-outline" size={14} color={COLORS.primary} />
          <Text style={styles.heroLabelText}>
            {role === "admin" ? "ADMIN EVENT WORKSPACE" : "TEACHER WORKSPACE"}
          </Text>
        </View>

        <Text style={styles.heroTitle}>Manage school events</Text>
        <Text style={styles.heroSubtitle}>
          Create events, generate QR codes, edit schedules, and open or close
          attendance for your events.
        </Text>
      </View>

      <SectionHeading
        icon="create-outline"
        title="Create an event"
        subtitle="Enter the event details and schedule."
        step="01"
      />

      <View style={styles.formCard}>
        <Text style={styles.label}>Event title</Text>
        <InputField
          icon="calendar-outline"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Founders Day Assembly"
        />

        <Text style={[styles.label, styles.spacedLabel]}>Event code</Text>
        <InputField
          icon="key-outline"
          value={eventCode}
          onChangeText={setEventCode}
          placeholder="e.g. EVT-2026-0002"
          autoCapitalize="characters"
        />

        <Text style={styles.fieldHint}>Event codes must be unique.</Text>

        <Text style={[styles.label, styles.spacedLabel]}>Starts</Text>
        <PickerField
          value={formatDateTime(startDate)}
          icon="sunny-outline"
          onPress={() => openPicker("start")}
        />

        <Text style={[styles.label, styles.spacedLabel]}>Ends</Text>
        <PickerField
          value={formatDateTime(endDate)}
          icon="moon-outline"
          onPress={() => openPicker("end")}
        />

        <Text style={[styles.label, styles.spacedLabel]}>Quick end time</Text>
        <View style={styles.chipRow}>
          {QUICK_END_OPTIONS.map((option) => (
            <Pressable
              key={option.label}
              style={styles.chip}
              onPress={() =>
                setEndDate(new Date(startDate.getTime() + option.ms))
              }
            >
              <Text style={styles.chipText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {pickerTarget && (
        <View style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Choose date and time</Text>
            <Pressable
              onPress={() => {
                setPickerTarget(null);
                setPickerPart("date");
              }}
            >
              <Ionicons
                name="close-circle"
                size={25}
                color={COLORS.textSecondary}
              />
            </Pressable>
          </View>

          <DateTimePicker
            value={
              pickerTarget === "start"
                ? startDate
                : pickerTarget === "end"
                  ? endDate
                  : pickerTarget === "editStart"
                    ? editStart
                    : editEnd
            }
            mode={isAndroid ? pickerPart : "datetime"}
            display={isAndroid ? "default" : "spinner"}
            onChange={handlePickerChange}
            themeVariant="light"
          />
          {isAndroid && pickerPart === "time" && (
            <Text style={styles.fieldHint}>
              Choose the time to finish setting the schedule.
            </Text>
          )}
        </View>
      )}

      {message && (
        <View
          accessibilityRole="alert"
          style={[
            styles.messageCard,
            messageType === "success"
              ? styles.successMessage
              : styles.errorMessage,
          ]}
        >
          <Ionicons
            name={
              messageType === "success" ? "checkmark-circle" : "alert-circle"
            }
            size={21}
            color={messageType === "success" ? COLORS.success : COLORS.danger}
          />
          <Text
            style={[
              styles.messageText,
              {
                color:
                  messageType === "success" ? COLORS.success : COLORS.danger,
              },
            ]}
          >
            {message}
          </Text>
        </View>
      )}

      <AppButton
        theme="primary"
        title={saving ? "Please wait..." : "Create Event & Generate QR"}
        icon="qr-code-outline"
        onPress={handleCreateEvent}
      />

      {saving && (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 12 }} />
      )}

      {payload && (
        <View style={styles.qrCard}>
          <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
          <Text style={styles.qrTitle}>Event QR is ready!</Text>
          <Text style={styles.qrSubtitle}>
            Students can scan this code using Petal Pass.
          </Text>
          <View style={styles.qrBox}>
            <QRCode value={payload} size={210} />
          </View>
          <Text style={styles.payloadLabel}>QR PAYLOAD</Text>
          <Text style={styles.payloadText} selectable>
            {payload}
          </Text>
        </View>
      )}

      <SectionHeading
        icon="list-outline"
        title="Your events"
        subtitle="Edit schedules and manage event status."
        step="02"
      />

      <View style={styles.eventsHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventsCount}>
            {events.length} {events.length === 1 ? "event" : "events"}
          </Text>
          <Text style={styles.fieldHint}>Events created by your account</Text>
        </View>
        <Pressable
          style={styles.refreshButton}
          onPress={() => user && void loadEvents(user.id)}
        >
          <Ionicons name="refresh-outline" size={17} color={COLORS.primary} />
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {eventsLoading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="calendar-clear-outline"
            size={30}
            color={COLORS.primary}
          />
          <Text style={styles.emptyTitle}>No events yet</Text>
          <Text style={styles.emptyText}>
            Create an event above to see it listed here.
          </Text>
        </View>
      ) : (
        events.map((event) => {
          const closed = eventStatus(event) === "closed";
          return (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventIcon}>
                  <Ionicons name="calendar" size={21} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventCode}>{event.event_code}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    closed ? styles.closedBadge : styles.openBadge,
                  ]}
                >
                  <Text
                    style={{
                      color: closed ? COLORS.danger : COLORS.success,
                      fontSize: 9,
                      fontWeight: "900",
                    }}
                  >
                    {closed ? "CLOSED" : "OPEN"}
                  </Text>
                </View>
              </View>

              <View style={styles.eventSchedule}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.eventScheduleText}>
                  {event.start_time
                    ? formatDateTime(new Date(event.start_time))
                    : "Start not set"}
                  {"\n"}to{" "}
                  {event.end_time
                    ? formatDateTime(new Date(event.end_time))
                    : "End not set"}
                </Text>
              </View>

              <View style={styles.eventActions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => beginEdit(event)}
                >
                  <Ionicons
                    name="create-outline"
                    size={17}
                    color={COLORS.primary}
                  />
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.statusButton,
                    closed ? styles.reopenButton : styles.closeButton,
                  ]}
                  disabled={busyEventId === event.id}
                  onPress={() => handleToggleStatus(event)}
                >
                  {busyEventId === event.id ? (
                    <ActivityIndicator
                      size="small"
                      color={closed ? COLORS.success : COLORS.danger}
                    />
                  ) : (
                    <Ionicons
                      name={
                        closed ? "lock-open-outline" : "lock-closed-outline"
                      }
                      size={16}
                      color={closed ? COLORS.success : COLORS.danger}
                    />
                  )}
                  <Text
                    style={[
                      styles.statusButtonText,
                      { color: closed ? COLORS.success : COLORS.danger },
                    ]}
                  >
                    {closed ? "Reopen Event" : "Close Event"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}

      {editingEvent && (
        <View style={styles.editCard}>
          <View style={styles.pickerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.editTitle}>Edit event</Text>
              <Text style={styles.fieldHint}>
                Code: {editingEvent.event_code} (cannot be changed)
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setEditingEvent(null);
                setPickerTarget(null);
              }}
            >
              <Ionicons
                name="close-circle"
                size={25}
                color={COLORS.textSecondary}
              />
            </Pressable>
          </View>

          <Text style={styles.label}>Event title</Text>
          <InputField
            icon="text-outline"
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Event title"
          />

          <Text style={[styles.label, styles.spacedLabel]}>Starts</Text>
          <PickerField
            value={formatDateTime(editStart)}
            icon="sunny-outline"
            onPress={() => openPicker("editStart")}
          />

          <Text style={[styles.label, styles.spacedLabel]}>Ends</Text>
          <PickerField
            value={formatDateTime(editEnd)}
            icon="moon-outline"
            onPress={() => openPicker("editEnd")}
          />

          <View style={styles.editActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setEditingEvent(null);
                setPickerTarget(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.saveButton}
              disabled={saving}
              onPress={() => void saveEdit()}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.bottomBrand}>
        <Ionicons name="flower-outline" size={15} color={COLORS.primary} />
        <Text style={styles.bottomBrandText}>
          CCTC PETAL PASS · YOUR PASS TO EVERY EVENT
        </Text>
      </View>
    </ScrollView>
  );
}

function SectionHeading({
  icon,
  title,
  subtitle,
  step,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  step: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={21} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{step}</Text>
      </View>
    </View>
  );
}

function InputField({
  icon,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={19} color={COLORS.primary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        autoCapitalize={autoCapitalize ?? "sentences"}
        autoCorrect={false}
        maxLength={120}
      />
    </View>
  );
}

function PickerField({
  value,
  icon,
  onPress,
}: {
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.pickerField}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Choose date and time: ${value}`}
    >
      <View style={styles.pickerFieldIcon}>
        <Ionicons name={icon} size={19} color={COLORS.primary} />
      </View>
      <Text style={styles.pickerValue}>{value}</Text>
      <Ionicons name="chevron-forward" size={19} color={COLORS.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 38 },
  hero: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 25,
    padding: 20,
    marginBottom: 27,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: COLORS.primary,
  },
  brandTagline: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  heroLabel: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 24,
  },
  heroLabelText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 13,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 7,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 13,
    marginTop: 8,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  stepBadge: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "900",
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 17,
    marginBottom: 23,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },
  spacedLabel: { marginTop: 19 },
  inputContainer: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    minHeight: 49,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  fieldHint: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 6,
  },
  pickerField: {
    minHeight: 59,
    backgroundColor: COLORS.background,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pickerFieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  pickerCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 15,
    marginBottom: 22,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  pickerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 15,
    padding: 13,
    marginBottom: 16,
    borderWidth: 1,
  },
  successMessage: { backgroundColor: "#EAF5EE", borderColor: "#C7E5D1" },
  errorMessage: { backgroundColor: "#FFF0F0", borderColor: "#F1CDCD" },
  messageText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
  },
  qrCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  qrTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
  },
  qrSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 17,
  },
  qrBox: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  payloadLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.textSecondary,
    letterSpacing: 1.3,
    marginTop: 17,
    marginBottom: 7,
  },
  payloadText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  eventsCount: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  refreshText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  eventCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  eventTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  eventCode: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  openBadge: { backgroundColor: "#EAF5EE" },
  closedBadge: { backgroundColor: "#FFF0F0" },
  eventSchedule: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 13,
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  eventScheduleText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  eventActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  editButtonText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "900",
  },
  statusButton: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  closeButton: { borderColor: "#F1CDCD", backgroundColor: "#FFF0F0" },
  reopenButton: { borderColor: "#C7E5D1", backgroundColor: "#EAF5EE" },
  statusButtonText: { fontSize: 10, fontWeight: "900" },
  editCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 17,
    marginTop: 12,
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: "900",
  },
  editActions: { flexDirection: "row", gap: 9, marginTop: 18 },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  saveButton: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  bottomBrand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingTop: 20,
    paddingBottom: 8,
  },
  bottomBrandText: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  lockContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  lockTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginTop: 17,
    textAlign: "center",
  },
  lockSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
});
