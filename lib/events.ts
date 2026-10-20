import { supabase } from "./supabase";

export type Event = {
  eventId: string;
  title: string;
  start: string;
  end: string;
};

export type EventStatus = "open" | "closed";

export type CloudEvent = {
  id: string;
  event_code: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  created_by: string | null;
  created_at: string;
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
export async function getEventsByTeacher(
  teacherId: string,
): Promise<CloudEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", teacherId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as CloudEvent[];
}

/**
 * Get all events.
 * Admin access depends on your Supabase RLS policies.
 */
export async function getAllEvents(): Promise<CloudEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as CloudEvent[];
}

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
