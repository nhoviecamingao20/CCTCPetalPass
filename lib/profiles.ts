import { supabase } from "./supabase";

export type Role = "student" | "teacher" | "admin";

export type StudentYearLevel =
  | "1st Year"
  | "2nd Year"
  | "3rd Year"
  | "4th Year";

export type StudentBlock = "A" | "B" | "C";

export type StudentDepartment = "BSIT" | "BSHM" | "BSEntrep";

export type TeacherVerificationStatus = "pending" | "approved" | "rejected";

export type TeacherVerificationRequest = {
  id: string;
  user_id: string;
  teacher_details: string;
  status: TeacherVerificationStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  department?: StudentDepartment | string | null;
  year_level?: StudentYearLevel | null;
  block?: StudentBlock | null;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, department, year_level, block")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: { full_name?: string },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  return { error: error?.message ?? null };
}

export async function updateUserRole(
  targetUserId: string,
  newRole: Role,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("update_user_role", {
    target_user_id: targetUserId,
    new_role: newRole,
  });

  return { error: error?.message ?? null };
}

export async function updateStudentAcademicDetails(
  studentId: string,
  department: StudentDepartment,
  yearLevel: StudentYearLevel,
  block: StudentBlock,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc(
    "admin_update_student_academic_details",
    {
      target_student_id: studentId,
      target_department: department,
      target_year_level: yearLevel,
      target_block: block,
    },
  );

  return { error: error?.message ?? null };
}

/**
 * Submit a teacher-verification request.
 * Only signed-in student accounts are accepted by the database.
 */
export async function submitTeacherVerification(
  teacherDetails: string,
): Promise<{ requestId: string | null; error: string | null }> {
  const details = teacherDetails.trim();

  if (!details) {
    return {
      requestId: null,
      error: "Please provide your teacher verification details.",
    };
  }

  if (details.length > 2000) {
    return {
      requestId: null,
      error: "Details cannot exceed 2000 characters.",
    };
  }

  const { data, error } = await supabase.rpc("submit_teacher_verification", {
    teacher_details: details,
  });

  if (error) {
    return { requestId: null, error: error.message };
  }

  return {
    requestId: typeof data === "string" ? data : null,
    error: null,
  };
}

/**
 * Retrieve the current user's own verification request.
 * RLS restricts access to the user's own row or admin-visible rows.
 */
export async function getMyTeacherVerificationRequest(): Promise<{
  request: TeacherVerificationRequest | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("teacher_verification_requests")
    .select(
      "id, user_id, teacher_details, status, review_notes, reviewed_by, created_at, updated_at, reviewed_at",
    )
    .maybeSingle();

  if (error) {
    return { request: null, error: error.message };
  }

  return {
    request: data as TeacherVerificationRequest | null,
    error: null,
  };
}

/**
 * Retrieve verification requests for the admin dashboard.
 * The database RLS policy determines which rows are visible.
 */
export async function getTeacherVerificationRequests(): Promise<{
  requests: TeacherVerificationRequest[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("teacher_verification_requests")
    .select(
      "id, user_id, teacher_details, status, review_notes, reviewed_by, created_at, updated_at, reviewed_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { requests: [], error: error.message };
  }

  return {
    requests: (data ?? []) as TeacherVerificationRequest[],
    error: null,
  };
}

/**
 * Approve or reject a pending request.
 * The database function checks admin privileges and changes the
 * profile role to teacher only when a request is approved.
 */
export async function reviewTeacherVerificationRequest(
  requestId: string,
  decision: "approved" | "rejected",
  notes?: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("admin_review_teacher_verification", {
    target_request_id: requestId,
    decision,
    notes: notes?.trim() || null,
  });

  return { error: error?.message ?? null };
}
