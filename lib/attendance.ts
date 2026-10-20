import { getEventByCode } from "./events";
import { parseQRPayload } from "./qr";
import { supabase } from "./supabase";

<<<<<<< HEAD
=======
/* -------------------- TYPES -------------------- */

>>>>>>> origin/main
export type RegisterResult = {
  success: boolean;
  message: string;
  eventTitle?: string;
};

export type AttendanceRecord = {
  id: string;
  eventId: string;
  eventTitle: string;
<<<<<<< HEAD
  scannedAt: string;
};

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

  const eventCode = parsed.payload.event?.trim();

  if (!eventCode) {
    return {
      success: false,
      message: "Invalid QR code: event code is missing.",
    };
  }

  let event;

  try {
    event = await getEventByCode(eventCode);
  } catch (error) {
    console.error("Could not retrieve event:", error);

    return {
      success: false,
      message: "Could not load the event. Please try again.",
    };
  }

  if (!event) {
    return {
      success: false,
      message: "Event not found. Please scan a valid event QR code.",
    };
  }

  // Validate against the event schedule stored in Supabase.
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

  // Save attendance against the existing database event ID.
  const { error: attendanceError } = await supabase.from("attendance").insert({
    student_id: studentId,
    event_id: event.id,
  });

  if (attendanceError) {
    console.error("Attendance registration failed:", {
      code: attendanceError.code,
      message: attendanceError.message,
      details: attendanceError.details,
      hint: attendanceError.hint,
    });

    if (attendanceError.code === "23505") {
      return {
        success: false,
        message: "You have already registered attendance for this event.",
        eventTitle: event.title,
      };
    }

    const detail = [attendanceError.message, attendanceError.details]
      .filter(Boolean)
      .join(" ");

    return {
      success: false,
      message: `Attendance could not be saved: ${
        detail || "Unknown database error."
      }`,
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

export type StudentAttendanceProfile = {
  full_name: string | null;
  department: string | null;
  year_level: string | null;
  block: string | null;
=======
  studentId: string;
  scannedAt: string;
};

export type AdminAttendanceRecord = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  scannedAt: string;
>>>>>>> origin/main
};

export type TeacherEventAttendance = {
  eventId: string;
  eventCode: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  attendeeCount: number;
  attendees: {
    studentId: string;
<<<<<<< HEAD
    scannedAt: string;
    studentName: string | null;
    department: string | null;
    yearLevel: string | null;
    block: string | null;
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
=======
    studentName: string;
  }[];
};

/* -------------------- DATE HANDLING -------------------- */

// Treat timestamps without a timezone as Philippine time (UTC+8).
// Explicit timezone timestamps are parsed normally.
function parseEventDate(value: string | null): Date | null {
  if (!value) return null;

  const localMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/,
  );

  if (localMatch) {
    const year = Number(localMatch[1]);
    const month = Number(localMatch[2]);
    const day = Number(localMatch[3]);
    const hour = Number(localMatch[4]);
    const minute = Number(localMatch[5]);
    const second = Number(localMatch[6] ?? 0);
    const fraction = localMatch[7] ?? "";
    const millisecond = Number(fraction.padEnd(3, "0").slice(0, 3));

    const utcTime =
      Date.UTC(year, month - 1, day, hour, minute, second, millisecond) -
      8 * 60 * 60 * 1000;

    return new Date(utcTime);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/* -------------------- REGISTER ATTENDANCE -------------------- */

export async function registerAttendance(
  rawPayload: string,
  studentId: string,
): Promise<RegisterResult> {
  try {
    if (!studentId) {
      return {
        success: false,
        message:
          "Student account could not be identified. Please log in again.",
      };
    }

    // Supports JSON attendance payloads and plain event-code QR values,
    // provided parseQRPayload in lib/qr.ts supports both formats.
    const parsed = parseQRPayload(rawPayload);

    if (!parsed.ok) {
      return {
        success: false,
        message: parsed.message || "Invalid QR code.",
      };
    }

    // Look up the event using its event code.
    const event = await getEventByCode(parsed.payload.event);

    if (!event) {
      return {
        success: false,
        message: "Event not found. Please scan a valid event QR code.",
      };
    }

    // Reject closed events before schedule validation and database insertion.
    if (event.status === "closed") {
      return {
        success: false,
        message: "This event is closed. Attendance is not available.",
        eventTitle: event.title,
      };
    }

    const now = new Date();
    const start = parseEventDate(event.start_time);
    const end = parseEventDate(event.end_time);

    console.log("ATTENDANCE TIME CHECK:", {
      eventTitle: event.title,
      eventStatus: event.status ?? "unknown",
      nowISO: now.toISOString(),
      rawStart: event.start_time,
      parsedStartISO: start?.toISOString() ?? null,
      rawEnd: event.end_time,
      parsedEndISO: end?.toISOString() ?? null,
    });

    // Reject invalid event schedules.
    if ((event.start_time && !start) || (event.end_time && !end)) {
      return {
        success: false,
        message:
          "The event schedule is invalid. Please contact the administrator.",
        eventTitle: event.title,
      };
    }

    // Reject attendance before the event starts.
    if (start && now < start) {
      return {
        success: false,
        message: "This event has not started yet.",
        eventTitle: event.title,
      };
    }

    // Reject attendance after the event ends.
    if (end && now > end) {
      return {
        success: false,
        message: "This event has already ended.",
        eventTitle: event.title,
      };
    }

    // Insert the attendance record only after all checks pass.
    const { error } = await supabase.from("attendance").insert({
      student_id: studentId,
      event_id: event.id,
      scanned_at: now.toISOString(),
    });

    if (error) {
      // Preserve duplicate-attendance protection.
      if (error.code === "23505") {
        return {
          success: false,
          message: "You have already attended this event.",
          eventTitle: event.title,
        };
      }

      console.error("REGISTER ATTENDANCE ERROR:", error);

      return {
        success: false,
        message: error.message || "Failed to register attendance.",
        eventTitle: event.title,
      };
    }

    return {
      success: true,
      message: "Attendance registered successfully!",
      eventTitle: event.title,
    };
  } catch (error) {
    console.error("REGISTER ATTENDANCE ERROR:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to register attendance.",
    };
  }
}

/* -------------------- GET STUDENT ATTENDANCE HISTORY -------------------- */

export async function getAttendanceHistory(
  studentId: string,
): Promise<AttendanceRecord[]> {
  if (!studentId) {
    return [];
  }

  const { data: rows, error } = await supabase
    .from("attendance")
    .select("id, student_id, event_id, scanned_at")
    .eq("student_id", studentId)
    .order("scanned_at", { ascending: false });

  if (error) {
    console.error("GET STUDENT HISTORY ERROR:", error);
    throw error;
  }

  if (!rows || rows.length === 0) {
    return [];
  }

  const eventIds = [...new Set(rows.map((row) => row.event_id))];

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, title")
    .in("id", eventIds);

  if (eventsError) {
    console.error("GET STUDENT HISTORY EVENTS ERROR:", eventsError);
    throw eventsError;
  }

  const eventMap = new Map(
    (events ?? []).map((event) => [event.id, event.title]),
  );

  return rows.map((row) => ({
    id: String(row.id),
    eventId: row.event_id,
    eventTitle: eventMap.get(row.event_id) ?? "Unknown event",
    studentId: row.student_id,
    scannedAt: row.scanned_at,
  }));
}

/* -------------------- PROFILE LOOKUP HELPER -------------------- */

type StudentProfile = {
  id: string;
  full_name: string | null;
  email?: string | null;
};

async function getStudentProfiles(
  studentIds: string[],
): Promise<Map<string, StudentProfile>> {
  const profileMap = new Map<string, StudentProfile>();

  const uniqueIds = [...new Set(studentIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return profileMap;
  }

  // Fetch all student profiles in one query.
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", uniqueIds);

  if (profilesError) {
    console.error(
      "PROFILE BULK QUERY ERROR:",
      profilesError.message,
      profilesError.code,
    );
  } else {
    for (const profile of profiles ?? []) {
      profileMap.set(String(profile.id), profile);
    }
  }

  // Retry missing profiles individually.
  const missingIds = uniqueIds.filter((id) => !profileMap.has(id));

  for (const studentId of missingIds) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", studentId)
      .maybeSingle();

    if (error) {
      console.error("INDIVIDUAL PROFILE QUERY ERROR:", {
        studentId,
        message: error.message,
        code: error.code,
      });
      continue;
    }

    if (profile) {
      profileMap.set(String(profile.id), profile);
    } else {
      console.warn("PROFILE NOT VISIBLE TO APP SESSION:", studentId);
    }
  }

  console.log("PROFILE LOOKUP SUMMARY:", {
    requestedIds: uniqueIds,
    returnedIds: [...profileMap.keys()],
    missingIds: uniqueIds.filter((id) => !profileMap.has(id)),
  });

  return profileMap;
}

/* -------------------- GET TEACHER EVENT ATTENDANCE -------------------- */

export async function getTeacherEventAttendance(
  teacherId: string,
): Promise<TeacherEventAttendance[]> {
  if (!teacherId) {
    return [];
  }

  // 1. Fetch events created by this teacher.
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, title, event_code, start_time, end_time")
    .eq("created_by", teacherId)
    .order("start_time", { ascending: false });

  if (eventsError) {
    console.error("GET TEACHER EVENTS ERROR:", eventsError);
    throw eventsError;
  }

  if (!events || events.length === 0) {
    return [];
  }

  const eventIds = events.map((event) => event.id);

  // 2. Fetch attendance records for the teacher's events.
  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("id, student_id, event_id, scanned_at")
    .in("event_id", eventIds)
    .order("scanned_at", { ascending: false });

  if (attendanceError) {
    console.error("GET TEACHER ATTENDANCE ERROR:", attendanceError);
    throw attendanceError;
  }

  if (!attendance || attendance.length === 0) {
    return events.map((event) => ({
>>>>>>> origin/main
      eventId: event.id,
      eventCode: event.event_code,
      title: event.title,
      startTime: event.start_time,
      endTime: event.end_time,
      attendeeCount: 0,
      attendees: [],
    }));
  }

<<<<<<< HEAD
  const studentIds = [
    ...new Set(attendance.map((record: any) => record.student_id as string)),
  ];

  const profileMap = new Map<string, StudentAttendanceProfile>();

  if (studentIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, department, year_level, block")
      .in("id", studentIds);

    if (profileError) {
      console.error("Could not load student profiles:", profileError);
    }

    for (const profile of profiles ?? []) {
      profileMap.set(profile.id, {
        full_name: profile.full_name ?? null,
        department: profile.department ?? null,
        year_level: profile.year_level ?? null,
        block: profile.block ?? null,
      });
    }
  }

  return events.map((event: any) => {
    const records = attendance.filter(
      (record: any) => record.event_id === event.id,
    );

=======
  // 3. Fetch profiles for the student IDs in these records.
  const studentIds = [
    ...new Set(attendance.map((record) => String(record.student_id))),
  ];

  const profileMap = await getStudentProfiles(studentIds);

  // 4. Build the attendance list for each event.
  return events.map((event) => {
    const eventAttendance = attendance.filter(
      (record) => record.event_id === event.id,
    );

    // One student should appear only once per event.
    const uniqueStudents = new Map<
      string,
      { studentId: string; studentName: string }
    >();

    for (const record of eventAttendance) {
      const studentId = String(record.student_id);

      if (!uniqueStudents.has(studentId)) {
        const profile = profileMap.get(studentId);

        uniqueStudents.set(studentId, {
          studentId,
          studentName: profile?.full_name?.trim() || "Unknown student",
        });
      }
    }

>>>>>>> origin/main
    return {
      eventId: event.id,
      eventCode: event.event_code,
      title: event.title,
      startTime: event.start_time,
      endTime: event.end_time,
<<<<<<< HEAD
      attendeeCount: records.length,
      attendees: records.map((record: any) => {
        const profile = profileMap.get(record.student_id);

        return {
          studentId: record.student_id,
          studentName: profile?.full_name ?? null,
          department: profile?.department ?? null,
          yearLevel: profile?.year_level ?? null,
          block: profile?.block ?? null,
          scannedAt: record.scanned_at,
        };
      }),
=======
      attendeeCount: uniqueStudents.size,
      attendees: Array.from(uniqueStudents.values()),
>>>>>>> origin/main
    };
  });
}

<<<<<<< HEAD
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
=======
/* -------------------- GET ALL ATTENDANCE (ADMIN) -------------------- */

export async function getAllAttendance(): Promise<AdminAttendanceRecord[]> {
  try {
    const { data: attendanceRows, error: attendanceError } = await supabase
      .from("attendance")
      .select("id, student_id, event_id, scanned_at")
      .order("scanned_at", { ascending: false });

    if (attendanceError) {
      console.error("GET ATTENDANCE ERROR:", attendanceError);
      throw attendanceError;
    }

    if (!attendanceRows || attendanceRows.length === 0) {
      console.log("GET ATTENDANCE: No rows returned.");
      return [];
    }

    const studentIds = [
      ...new Set(attendanceRows.map((row) => String(row.student_id))),
    ];

    const eventIds = [...new Set(attendanceRows.map((row) => row.event_id))];

    const profileMap = await getStudentProfiles(studentIds);

    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title, event_code")
      .in("id", eventIds);

    if (eventsError) {
      console.error("GET ATTENDANCE EVENTS ERROR:", eventsError);
      throw eventsError;
    }

    const eventMap = new Map((events ?? []).map((event) => [event.id, event]));

    const records: AdminAttendanceRecord[] = attendanceRows.map((row) => {
      const studentId = String(row.student_id);
      const profile = profileMap.get(studentId);
      const event = eventMap.get(row.event_id);

      return {
        id: String(row.id),
        studentId,
        studentName: profile?.full_name?.trim() || "Unknown student",
        studentEmail: profile?.email || "No email",
        eventId: row.event_id,
        eventTitle: event?.title || "Unknown event",
        eventCode: event?.event_code || "Unknown code",
        scannedAt: row.scanned_at,
      };
    });

    console.log("GET ATTENDANCE: Loaded records:", records.length);

    return records;
  } catch (error) {
    console.error("GET ALL ATTENDANCE ERROR:", error);
    throw error;
  }
}

/* -------------------- UPDATE ATTENDANCE -------------------- */

export async function updateAttendance(
  attendanceId: string,
  studentId: string,
  eventId: string,
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from("attendance")
      .update({
        student_id: studentId,
        event_id: eventId,
      })
      .eq("id", attendanceId);

    if (error) {
      console.error("UPDATE ATTENDANCE ERROR:", error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error("UPDATE ATTENDANCE ERROR:", error);

    return {
      error:
        error instanceof Error
          ? error
          : new Error("Failed to update attendance."),
    };
  }
}

/* -------------------- DELETE ATTENDANCE -------------------- */

export async function deleteAttendance(
  attendanceId: string,
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("id", attendanceId);

    if (error) {
      console.error("DELETE ATTENDANCE ERROR:", error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error("DELETE ATTENDANCE ERROR:", error);

    return {
      error:
        error instanceof Error
          ? error
          : new Error("Failed to delete attendance."),
    };
  }
}
>>>>>>> origin/main
