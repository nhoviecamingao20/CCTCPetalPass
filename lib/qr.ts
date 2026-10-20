export type QRPayload = {
  v: 1;
  event: string;
  title?: string;
  start?: string;
  end?: string;
};

export function buildQRPayload(event: {
  eventId: string;
  title: string;
  start?: string;
  end?: string;
}): string {
  const payload: QRPayload = {
    v: 1,
<<<<<<< HEAD
    event: event.eventId.trim(),
  };

  if (event.title.trim()) {
    payload.title = event.title.trim();
  }

  if (event.start) {
    payload.start = event.start;
  }

  if (event.end) {
    payload.end = event.end;
  }
=======
    event: event.eventId,
  };

  if (event.title) payload.title = event.title;
  if (event.start) payload.start = event.start;
  if (event.end) payload.end = event.end;
>>>>>>> origin/main

  return JSON.stringify(payload);
}

export type ParseQRResult =
  | { ok: true; payload: QRPayload }
  | { ok: false; message: string };

<<<<<<< HEAD
function isValidOptionalDate(value: unknown): value is string | undefined {
  if (value === undefined) {
    return true;
  }

  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  return Number.isFinite(new Date(value).getTime());
}

export function parseQRPayload(raw: string): ParseQRResult {
  if (typeof raw !== "string" || !raw.trim()) {
    return {
      ok: false,
      message: "No QR code data was received.",
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      message: "Invalid QR code. Please scan an event QR code.",
    };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return {
      ok: false,
      message: "Not an attendance QR code.",
    };
  }

  const candidate = parsed as Record<string, unknown>;

  if (
    candidate.v !== 1 ||
    typeof candidate.event !== "string" ||
    !candidate.event.trim()
  ) {
    return {
      ok: false,
      message: "Not an attendance QR code.",
    };
  }

  if (
    (candidate.title !== undefined && typeof candidate.title !== "string") ||
    !isValidOptionalDate(candidate.start) ||
    !isValidOptionalDate(candidate.end)
  ) {
    return {
      ok: false,
      message: "The QR code contains invalid event information.",
    };
  }

  return {
    ok: true,
    payload: {
      v: 1,
      event: candidate.event.trim(),
      ...(typeof candidate.title === "string"
        ? { title: candidate.title }
        : {}),
      ...(typeof candidate.start === "string"
        ? { start: candidate.start }
        : {}),
      ...(typeof candidate.end === "string" ? { end: candidate.end } : {}),
    },
  };
}
=======
export function parseQRPayload(raw: string): ParseQRResult {
  const value = raw.trim();

  if (!value) {
    return {
      ok: false,
      message: "Invalid QR code.",
    };
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (typeof parsed !== "object" || parsed === null) {
      return {
        ok: false,
        message: "Not an attendance QR code.",
      };
    }

    const payload = parsed as Record<string, unknown>;

    if (
      payload.v !== 1 ||
      typeof payload.event !== "string" ||
      !payload.event.trim()
    ) {
      return {
        ok: false,
        message: "Not an attendance QR code.",
      };
    }

    return {
      ok: true,
      payload: {
        v: 1,
        event: payload.event,
        ...(typeof payload.title === "string" ? { title: payload.title } : {}),
        ...(typeof payload.start === "string" ? { start: payload.start } : {}),
        ...(typeof payload.end === "string" ? { end: payload.end } : {}),
      },
    };
  } catch {
    // Admin Dashboard QR codes may contain a plain event code,
    // such as "VER - T012" or "HACK - E001".
    return {
      ok: true,
      payload: {
        v: 1,
        event: value,
      },
    };
  }
}
>>>>>>> origin/main
