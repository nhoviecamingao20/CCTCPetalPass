import { getEventByCode } from "./events";
import { parseQRPayload } from "./qr";
import { supabase } from "./supabase";

export type RegisterResult = {
  success: boolean;
  message: string;
  eventTitle?: string;
};

export type AttendanceRecord = {
  id: string;
  eventId: string;
  eventTitle: string;
  scannedAt: string;
};

/**
 * Records attendance for an existing event.
 *
 * The event stored in Supabase is the source of truth for its schedule.
 * Scanning an unknown QR code will never create a new event.
 */
export async function registerAttendance(
  rawPayload: string,
  studentId: string,
): Promise<RegisterResult> {
  if (!studentId?.trim()) {
    return {
      success: false,
      message: "Please sign in before recording attendance.",
    };
  }

  if (!rawPayload?.trim()) {
    return {
      success: false,
      message: "No QR code data was received. Please scan again.",
    };
  }

  const parsed = parseQRPayload(rawPayload);

  if (!parsed.ok) {
    return {
      success: false,
      message: parsed.message,
    };
  }

  const payload = parsed.payload;
  const eventCode = payload.event?.trim();

  if (!eventCode) {
    return {
      success: false,
      message: "Invalid QR code: event code is missing.",
    };
  }

  // Only accept events that already exist in Supabase.
  const event = await getEventByCode(eventCode);

  if (!event) {
    return {
      success: false,
      message: "Event not found. Please scan a valid event QR code.",
    };
  }

  // Validate using the actual event schedule stored in Supabase,
  // not timestamps supplied by the QR code.
  const now = Date.now();

  if (event.start_time) {
    const startTime = new Date(event.start_time).getTime();

    if (!Number.isFinite(startTime)) {
      return {
        success: false,
        message:
          "This event has an invalid start time. Please contact your teacher.",
        eventTitle: event.title,
      };
    }

    if (now < startTime) {
      return {
        success: false,
        message: "This event has not started yet.",
        eventTitle: event.title,
      };
    }
  }

  if (event.end_time) {
    const endTime = new Date(event.end_time).getTime();

    if (!Number.isFinite(endTime)) {
      return {
        success: false,
        message:
          "This event has an invalid end time. Please contact your teacher.",
        eventTitle: event.title,
      };
    }

    if (now > endTime) {
      return {
        success: false,
        message: "This event has already ended.",
        eventTitle: event.title,
      };
    }
  }

  // Record attendance against the event's database ID.
  const { error: attendanceError } = await supabase.from("attendance").insert({
    student_id: studentId,
    event_id: event.id,
  });

  if (attendanceError) {
    if (attendanceError.code === "23505") {
      return {
        success: false,
        message: "You have already registered attendance for this event.",
        eventTitle: event.title,
      };
    }

    console.error("Attendance registration failed:", attendanceError);

    return {
      success: false,
      message: "Could not record attendance. Please try again.",
      eventTitle: event.title,
    };
  }

  return {
    success: true,
    message: "Attendance recorded successfully!",
    eventTitle: event.title,
  };
}

export async function getAttendanceHistory(
  studentId: string,
): Promise<AttendanceRecord[]> {
  if (!studentId?.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from("attendance")
    .select("id, scanned_at, events ( event_code, title )")
    .eq("student_id", studentId)
    .order("scanned_at", { ascending: false });

  if (error || !data) {
    console.error("Could not load attendance history:", error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    eventId: row.events?.event_code ?? "",
    eventTitle: row.events?.title ?? "Unknown event",
    scannedAt: row.scanned_at,
  }));
}

export type TeacherEventAttendance = {
  eventId: string;
  eventCode: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  attendeeCount: number;
  attendees: {
    studentId: string;
    scannedAt: string;
    studentName: string | null;
  }[];
};

export type TeacherEventSummary = {
  eventId: string;
  eventCode: string;
  title: string;
  attendeeCount: number;
};

export async function getTeacherEventAttendance(
  teacherId: string,
): Promise<TeacherEventAttendance[]> {
  if (!teacherId?.trim()) {
    return [];
  }

  const { data: events, error: eventError } = await supabase
    .from("events")
    .select("id, event_code, title, start_time, end_time")
    .eq("created_by", teacherId)
    .order("created_at", { ascending: false });

  if (eventError || !events) {
    console.error("Could not load teacher events:", eventError);
    return [];
  }

  if (events.length === 0) {
    return [];
  }

  const eventIds = events.map((event: any) => event.id);

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("student_id, scanned_at, event_id")
    .in("event_id", eventIds)
    .order("scanned_at", { ascending: false });

  if (attendanceError || !attendance) {
    console.error("Could not load event attendance:", attendanceError);

    return events.map((event: any) => ({
      eventId: event.id,
      eventCode: event.event_code,
      title: event.title,
      startTime: event.start_time,
      endTime: event.end_time,
      attendeeCount: 0,
      attendees: [],
    }));
  }

  const studentIds = [
    ...new Set(attendance.map((record: any) => record.student_id)),
  ];

  let profileMap = new Map<string, string | null>();

  if (studentIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", studentIds);

    if (profileError) {
      console.error("Could not load student profiles:", profileError);
    }

    profileMap = new Map(
      (profiles ?? []).map((profile: any) => [
        profile.id,
        profile.full_name ?? null,
      ]),
    );
  }

  return events.map((event: any) => {
    const records = attendance.filter(
      (record: any) => record.event_id === event.id,
    );

    return {
      eventId: event.id,
      eventCode: event.event_code,
      title: event.title,
      startTime: event.start_time,
      endTime: event.end_time,
      attendeeCount: records.length,
      attendees: records.map((record: any) => ({
        studentId: record.student_id,
        studentName: profileMap.get(record.student_id) ?? null,
        scannedAt: record.scanned_at,
      })),
    };
  });
}

export async function getTeacherEventSummary(
  teacherId: string,
): Promise<TeacherEventSummary[]> {
  if (!teacherId?.trim()) {
    return [];
  }

  const { data: events, error: eventError } = await supabase
    .from("events")
    .select("id, event_code, title")
    .eq("created_by", teacherId)
    .order("created_at", { ascending: false });

  if (eventError || !events) {
    console.error("Could not load teacher event summary:", eventError);
    return [];
  }

  if (events.length === 0) {
    return [];
  }

  const eventIds = events.map((event: any) => event.id);

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("event_id")
    .in("event_id", eventIds);

  if (attendanceError || !attendance) {
    console.error("Could not load attendance counts:", attendanceError);
    return [];
  }

  const counts: Record<string, number> = {};

  attendance.forEach((record: any) => {
    counts[record.event_id] = (counts[record.event_id] ?? 0) + 1;
  });

  return events.map((event: any) => ({
    eventId: event.id,
    eventCode: event.event_code,
    title: event.title,
    attendeeCount: counts[event.id] ?? 0,
  }));
}
