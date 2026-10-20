import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
import { createEvent } from "@/lib/events";
import { getProfile, type Role } from "@/lib/profiles";
import { buildQRPayload } from "@/lib/qr";

function toLocalISO(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

function formatDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });

  return `${month} ${pad(date.getDate())}, ${date.getFullYear()} at ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

const QUICK_END_OPTIONS = [
  { label: "+30 min", ms: 30 * 60 * 1000 },
  { label: "+1 hour", ms: 60 * 60 * 1000 },
  { label: "+2 hours", ms: 2 * 60 * 60 * 1000 },
];

type EditTarget = "start" | "end";
type MessageType = "success" | "error";

export default function TeacherScreen() {
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [eventId, setEventId] = useState("");
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000),
  );

  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editingPart, setEditingPart] = useState<"date" | "time">("date");
  const [payload, setPayload] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>("success");
  const [creating, setCreating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (!user) {
        setRole(null);
        setRoleLoading(false);

        return () => {
          active = false;
        };
      }

      setRoleLoading(true);

      getProfile(user.id)
        .then((profile) => {
          if (!active) return;
          setRole(profile?.role ?? "student");
        })
        .catch((error) => {
          console.error("Failed to verify teacher role:", error);

          if (active) {
            setRole("student");
          }
        })
        .finally(() => {
          if (active) {
            setRoleLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, [user]),
  );

  const isAndroid = Platform.OS === "android";

  const showMessage = (text: string, type: MessageType) => {
    setMessage(text);
    setMessageType(type);
  };

  const openPicker = (target: EditTarget) => {
    setMessage(null);
    setEditTarget(target);
    setEditingPart("date");
  };

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (!editTarget) return;

    if (event.type === "dismissed" || !selected) {
      setEditTarget(null);
      setEditingPart("date");
      return;
    }

    const current = editTarget === "start" ? startDate : endDate;
    const next = new Date(current);

    if (isAndroid && editingPart === "date") {
      next.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );

      if (editTarget === "start") {
        setStartDate(next);
      } else {
        setEndDate(next);
      }

      setEditingPart("time");
      return;
    }

    next.setFullYear(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
    );
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);

    if (editTarget === "start") {
      setStartDate(next);
    } else {
      setEndDate(next);
    }

    setEditTarget(null);
    setEditingPart("date");
  };

  const handleQuickEnd = (ms: number) => {
    setMessage(null);
    setEndDate(new Date(startDate.getTime() + ms));
  };

  const handleCreateEvent = async () => {
    const eventData = {
      eventId: eventId.trim(),
      title: title.trim(),
      start: toLocalISO(startDate),
      end: toLocalISO(endDate),
    };

    if (!eventData.title || !eventData.eventId) {
      showMessage("Please enter both the event title and event code.", "error");
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      showMessage("The end time must be later than the start time.", "error");
      return;
    }

    setCreating(true);
    setMessage(null);
    setPayload(null);

    try {
      const { error } = await createEvent(eventData);

      if (error) {
        showMessage(
          "We couldn't save this event. Please check your details and try again.",
          "error",
        );
        return;
      }

      setPayload(buildQRPayload(eventData));
      showMessage(
        "Your event has been saved successfully. Its QR code is ready below.",
        "success",
      );
    } catch (error) {
      console.error("Failed to create event:", error);

      showMessage(
        "Something went wrong while saving the event. Please try again.",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  if (roleLoading) {
    return (
      <View style={styles.lockContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons name="flower-outline" size={30} color={COLORS.primary} />
        </View>

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loadingSpinner}
        />

        <Text style={styles.lockTitle}>Preparing your dashboard</Text>
        <Text style={styles.lockSubtitle}>
          Just a moment while we verify your account.
        </Text>
      </View>
    );
  }

  if (role !== "teacher") {
    return (
      <View style={styles.lockContainer}>
        <View style={styles.lockIcon}>
          <Ionicons
            name="lock-closed-outline"
            size={34}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.lockTitle}>Teachers Only</Text>

        <Text style={styles.lockSubtitle}>
          Event creation is available to verified teacher accounts.
        </Text>

        <View style={styles.lockNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.lockNoteText}>
            Your account permissions protect this workspace.
          </Text>
        </View>
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
        <View style={styles.heroDecorationOne} />
        <View style={styles.heroDecorationTwo} />

        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="flower" size={25} color={COLORS.primary} />
          </View>

          <View style={styles.brandText}>
            <Text style={styles.brandName}>CCTC PETAL PASS</Text>
            <Text style={styles.brandTagline}>Your Pass to Every Event.</Text>
          </View>
        </View>

        <View style={styles.heroLabel}>
          <Ionicons name="sparkles-outline" size={14} color={COLORS.primary} />
          <Text style={styles.heroLabelText}>TEACHER WORKSPACE</Text>
        </View>

        <Text style={styles.heroTitle}>Create an event</Text>

        <Text style={styles.heroSubtitle}>
          Set up your school event, choose its schedule, and generate a QR code
          for student attendance.
        </Text>

        <View style={styles.heroFooter}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.heroFooterText}>
            Designed for CCTC school events
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <View style={styles.sectionIcon}>
          <Ionicons name="create-outline" size={21} color={COLORS.primary} />
        </View>

        <View style={styles.sectionHeadingText}>
          <Text style={styles.sectionTitle}>Event details</Text>
          <Text style={styles.sectionSubtitle}>
            Enter the information students will use.
          </Text>
        </View>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>01</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Event title</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={19} color={COLORS.primary} />

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Founders Day Assembly"
            placeholderTextColor={COLORS.textSecondary}
            returnKeyType="next"
            maxLength={120}
          />
        </View>

        <Text style={styles.fieldHint}>
          Choose a clear name students will recognize.
        </Text>

        <Text style={[styles.label, styles.spacedLabel]}>Event code</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={19} color={COLORS.primary} />

          <TextInput
            style={styles.input}
            value={eventId}
            onChangeText={setEventId}
            placeholder="e.g. EVT-2026-0002"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={60}
          />
        </View>

        <Text style={styles.fieldHint}>Use a unique code for this event.</Text>
      </View>

      <View style={styles.sectionHeading}>
        <View style={styles.sectionIcon}>
          <Ionicons name="time-outline" size={21} color={COLORS.primary} />
        </View>

        <View style={styles.sectionHeadingText}>
          <Text style={styles.sectionTitle}>Event schedule</Text>
          <Text style={styles.sectionSubtitle}>
            Set when attendance scanning is allowed.
          </Text>
        </View>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>02</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Starts</Text>

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

        <View style={styles.quickTimeHeader}>
          <Ionicons name="flash-outline" size={17} color={COLORS.primary} />
          <Text style={styles.quickTimeTitle}>Quick end time</Text>
        </View>

        <View style={styles.chipRow}>
          {QUICK_END_OPTIONS.map((option) => (
            <Pressable
              key={option.label}
              style={({ pressed }) => [
                styles.chip,
                pressed && styles.chipPressed,
              ]}
              onPress={() => handleQuickEnd(option.ms)}
              accessibilityRole="button"
              accessibilityLabel={`Set event end time to ${option.label} after the start`}
            >
              <Text style={styles.chipText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.scheduleHint}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color={COLORS.textSecondary}
          />
          <Text style={styles.scheduleHintText}>
            Quick options calculate the end time from the selected start time.
          </Text>
        </View>
      </View>

      {message && (
        <View
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
              messageType === "success"
                ? styles.successMessageText
                : styles.errorMessageText,
            ]}
          >
            {message}
          </Text>
        </View>
      )}

      <View style={styles.createSection}>
        <AppButton
          theme="primary"
          title={creating ? "Creating Event..." : "Create Event & Generate QR"}
          icon="qr-code-outline"
          onPress={handleCreateEvent}
        />

        {creating && (
          <View style={styles.creatingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.creatingText}>
              Saving your event securely...
            </Text>
          </View>
        )}

        <Text style={styles.createFootnote}>
          Check the event details and schedule before creating the QR code.
        </Text>
      </View>

      {editTarget && (
        <View style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <View style={styles.pickerHeaderIcon}>
              <Ionicons name="calendar" size={19} color={COLORS.primary} />
            </View>

            <View style={styles.pickerHeaderText}>
              <Text style={styles.pickerTitle}>
                {editTarget === "start" ? "Event start" : "Event end"}
              </Text>
              <Text style={styles.pickerSubtitle}>
                Choose the {isAndroid ? editingPart : "date and time"}.
              </Text>
            </View>

            <Pressable
              onPress={() => {
                setEditTarget(null);
                setEditingPart("date");
              }}
              accessibilityRole="button"
              accessibilityLabel="Close date picker"
              hitSlop={10}
            >
              <Ionicons
                name="close-circle"
                size={25}
                color={COLORS.textSecondary}
              />
            </Pressable>
          </View>

          <DateTimePicker
            value={editTarget === "start" ? startDate : endDate}
            mode={isAndroid ? editingPart : "datetime"}
            display={isAndroid ? "default" : "spinner"}
            onChange={onPickerChange}
            themeVariant="light"
          />

          {isAndroid && editingPart === "time" && (
            <Text style={styles.pickerHint}>
              Choose the time to finish setting your schedule.
            </Text>
          )}
        </View>
      )}

      {payload && (
        <View style={styles.resultCard}>
          <View style={styles.resultTop}>
            <View style={styles.resultIcon}>
              <Ionicons
                name="checkmark-circle"
                size={23}
                color={COLORS.success}
              />
            </View>

            <View style={styles.resultHeading}>
              <Text style={styles.resultEyebrow}>EVENT CREATED</Text>
              <Text style={styles.resultTitle}>Your QR is ready!</Text>
              <Text style={styles.resultSubtitle}>
                Students can scan this code using Petal Pass.
              </Text>
            </View>
          </View>

          <View style={styles.qrPanel}>
            <View style={styles.qrDecorationTopLeft} />
            <View style={styles.qrDecorationBottomRight} />

            <View style={styles.qrBox}>
              <QRCode value={payload} size={210} />
            </View>

            <View style={styles.qrCaption}>
              <Ionicons name="scan-outline" size={17} color={COLORS.primary} />
              <Text style={styles.qrCaptionText}>
                CCTC PETAL PASS · EVENT CHECK-IN
              </Text>
            </View>
          </View>

          <View style={styles.qrInstruction}>
            <Ionicons
              name="phone-portrait-outline"
              size={21}
              color={COLORS.primary}
            />
            <Text style={styles.qrInstructionText}>
              Open the Scan tab and scan this QR to test the event.
            </Text>
          </View>

          <View style={styles.payloadSection}>
            <Text style={styles.payloadLabel}>QR PAYLOAD</Text>
            <Text style={styles.payloadText} selectable>
              {payload}
            </Text>
          </View>

          <View style={styles.resultFooter}>
            <Ionicons name="heart" size={15} color={COLORS.primary} />
            <Text style={styles.resultFooterText}>
              Made for every CCTC event.
            </Text>
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

type PickerFieldProps = {
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function PickerField({ value, icon, onPress }: PickerFieldProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pickerField,
        pressed && styles.pickerFieldPressed,
      ]}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 38,
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 25,
    padding: 20,
    marginBottom: 27,
  },
  heroDecorationOne: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.surface,
    right: -45,
    top: -50,
    opacity: 0.8,
  },
  heroDecorationTwo: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: COLORS.border,
    right: 15,
    top: 30,
    opacity: 0.65,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
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
  brandText: {
    flex: 1,
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
    letterSpacing: -0.6,
    marginTop: 13,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 7,
    maxWidth: 330,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 18,
    paddingTop: 13,
  },
  heroFooterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 13,
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
  sectionHeadingText: {
    flex: 1,
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
    marginBottom: 26,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },
  spacedLabel: {
    marginTop: 19,
  },
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
    lineHeight: 15,
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
  pickerFieldPressed: {
    backgroundColor: COLORS.surface,
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
  quickTimeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 21,
    marginBottom: 10,
  },
  quickTimeTitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chipPressed: {
    opacity: 0.7,
    backgroundColor: COLORS.border,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  scheduleHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  scheduleHintText: {
    flex: 1,
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 16,
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
  successMessage: {
    backgroundColor: "#EAF5EE",
    borderColor: "#C7E5D1",
  },
  errorMessage: {
    backgroundColor: "#FFF0F0",
    borderColor: "#F1CDCD",
  },
  messageText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
  },
  successMessageText: {
    color: COLORS.success,
  },
  errorMessageText: {
    color: COLORS.danger,
  },

  createSection: {
    marginTop: 1,
    marginBottom: 24,
  },
  creatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  creatingText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  createFootnote: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 11,
    paddingHorizontal: 8,
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
  pickerHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerHeaderText: {
    flex: 1,
  },
  pickerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  pickerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  pickerHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 17,
  },

  resultCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 25,
    padding: 17,
    marginTop: 4,
    marginBottom: 22,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  resultTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 17,
  },
  resultIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#EAF5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  resultHeading: {
    flex: 1,
  },
  resultEyebrow: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  resultTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 3,
  },
  resultSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  qrPanel: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
    alignItems: "center",
    paddingVertical: 21,
    paddingHorizontal: 12,
  },
  qrDecorationTopLeft: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: COLORS.border,
    left: -17,
    top: -17,
  },
  qrDecorationBottomRight: {
    position: "absolute",
    width: 75,
    height: 75,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: COLORS.border,
    right: -25,
    bottom: -25,
  },
  qrBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrCaption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 16,
  },
  qrCaptionText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  qrInstruction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  qrInstructionText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },
  payloadSection: {
    marginTop: 17,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payloadLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.textSecondary,
    letterSpacing: 1.3,
    marginBottom: 7,
  },
  payloadText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textPrimary,
    textAlign: "center",
    overflow: "hidden",
  },
  resultFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 17,
  },
  resultFooterText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },

  lockContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  loadingIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    marginTop: 20,
  },
  lockIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
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
  lockNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: 13,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockNoteText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  bottomBrand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingTop: 5,
    paddingBottom: 8,
  },
  bottomBrandText: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
  },
});
