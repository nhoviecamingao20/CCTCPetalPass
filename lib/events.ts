import { supabase } from "./supabase";

export type Event = {
  eventId: string;
  title: string;
  start: string;
  end: string;
};

<<<<<<< HEAD
export type EventStatus = "open" | "closed";

=======
>>>>>>> origin/main
export type CloudEvent = {
  id: string;
  event_code: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  created_by: string | null;
  created_at: string;
<<<<<<< HEAD
  status: EventStatus;
};

/**
 * Create an event.
 * Prevents accidentally overwriting an existing event code.
 */
export async function createEvent(
  event: Event,
): Promise<{ error: string | null }> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to create an event." };
  }

  const { error } = await supabase.from("events").insert({
    event_code: event.eventId.trim(),
    title: event.title.trim(),
    start_time: event.start || null,
    end_time: event.end || null,
    created_by: user.id,
    status: "open",
  });

  return { error: error?.message ?? null };
}

/**
 * Get events created by a particular teacher.
 */
=======
  venue?: string | null;
  description?: string | null;
  status?: "open" | "closed";
};

/**
 * Convert a Philippine local datetime without a timezone
 * into an ISO UTC timestamp.
 *
 * Example:
 * 2026-10-15T13:30:00
 * becomes
 * 2026-10-15T05:30:00.000Z
 *
 * If the value already contains a timezone, preserve its
 * intended instant instead of converting it a second time.
 */
function toUtcISOString(value: string): string {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);

  if (hasTimezone) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid event date or time.");
    }

    return date.toISOString();
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/,
  );

  if (!match) {
    throw new Error("Invalid event date format. Expected YYYY-MM-DDTHH:mm.");
  }

  const [, year, month, day, hour, minute, second = "0", fraction = ""] = match;

  const parts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };

  const milliseconds = Number(fraction.padEnd(3, "0").slice(0, 3));

  // Validate the supplied calendar date and time.
  const check = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      milliseconds,
    ),
  );

  if (
    check.getUTCFullYear() !== parts.year ||
    check.getUTCMonth() !== parts.month - 1 ||
    check.getUTCDate() !== parts.day ||
    check.getUTCHours() !== parts.hour ||
    check.getUTCMinutes() !== parts.minute ||
    check.getUTCSeconds() !== parts.second
  ) {
    throw new Error("Invalid event date or time.");
  }

  // Philippine time is UTC+8.
  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      milliseconds,
    ) -
      8 * 60 * 60 * 1000,
  ).toISOString();
}

export async function createEvent(
  event: Event,
): Promise<{ error: string | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("events").upsert(
      {
        event_code: event.eventId,
        title: event.title,
        start_time: event.start ? toUtcISOString(event.start) : null,
        end_time: event.end ? toUtcISOString(event.end) : null,
        created_by: user?.id ?? null,
      },
      { onConflict: "event_code" },
    );

    return { error: error?.message ?? null };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to save the event.",
    };
  }
}

>>>>>>> origin/main
export async function getEventsByTeacher(
  teacherId: string,
): Promise<CloudEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", teacherId)
    .order("created_at", { ascending: false });

  if (error || !data) {
<<<<<<< HEAD
=======
    console.log("GET EVENTS BY TEACHER ERROR:", error?.message);
>>>>>>> origin/main
    return [];
  }

  return data as CloudEvent[];
}

<<<<<<< HEAD
/**
 * Get all events.
 * Admin access depends on your Supabase RLS policies.
 */
=======
export async function getEventByCode(code: string): Promise<CloudEvent | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_code", code)
    .maybeSingle();

  if (error) {
    console.log("GET EVENT BY CODE ERROR:", error.message);
    return null;
  }

  return (data as CloudEvent | null) ?? null;
}

>>>>>>> origin/main
export async function getAllEvents(): Promise<CloudEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
<<<<<<< HEAD
=======
    console.log("GET ALL EVENTS ERROR:", error?.message);
>>>>>>> origin/main
    return [];
  }

  return data as CloudEvent[];
}

<<<<<<< HEAD
/**
 * Look up an event by its public event code.
 */
export async function getEventByCode(code: string): Promise<CloudEvent | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_code", code.trim())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CloudEvent;
}

/**
 * Update an event's title and schedule.
 * The event code is kept unchanged.
 */
export async function updateEvent(
  eventId: string,
  changes: {
    title: string;
    start: string;
    end: string;
  },
): Promise<{ error: string | null }> {
  if (!changes.title.trim()) {
    return { error: "Event title is required." };
  }

  if (
    changes.start &&
    changes.end &&
    new Date(changes.end).getTime() <= new Date(changes.start).getTime()
  ) {
    return { error: "The end time must be after the start time." };
  }

  const { error } = await supabase
    .from("events")
    .update({
      title: changes.title.trim(),
      start_time: changes.start || null,
      end_time: changes.end || null,
    })
    .eq("id", eventId);

  return { error: error?.message ?? null };
}

/**
 * Close or reopen an event.
 */
export async function updateEventStatus(
  eventId: string,
  status: EventStatus,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", eventId);

  return { error: error?.message ?? null };
}

/**
 * Convenience function for closing an event.
 */
export async function closeEvent(
  eventId: string,
): Promise<{ error: string | null }> {
  return updateEventStatus(eventId, "closed");
}

/**
 * Convenience function for reopening an event.
 */
export async function reopenEvent(
  eventId: string,
): Promise<{ error: string | null }> {
  return updateEventStatus(eventId, "open");
}

/**
 * Delete an event.
 * Supabase RLS must authorize the current user to do this.
 */
export async function deleteEvent(
  eventId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  return { error: error?.message ?? null };
}
=======
export async function updateEventStatus(
  eventId: string,
  status: "open" | "closed",
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("admin_update_event_status", {
    target_event_id: eventId,
    new_status: status,
  });

  if (error) {
    console.log("UPDATE EVENT STATUS ERROR:", error.message);
    return { error: error.message };
  }

  return { error: null };
}
>>>>>>> origin/main
