import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

let globalSession: Session | null = null;
let globalUser: User | null = null;
let globalLoading = false;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setAuth(session: Session | null) {
  globalSession = session;
  globalUser = session?.user ?? null;
  globalLoading = false;
  notify();
}

export function useAuth(): AuthState {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    session: globalSession,
    user: globalUser,
    loading: globalLoading,
  };
}

export type StudentYearLevel =
  | "1st Year"
  | "2nd Year"
  | "3rd Year"
  | "4th Year";

export type StudentDepartment = "BSIT" | "BSHM" | "BSEntrep";

export type SignUpProfile = {
  full_name: string;
  role: "student";
  department: StudentDepartment;
  year_level: StudentYearLevel;
};

export async function signUp(
  email: string,
  password: string,
  profile?: SignUpProfile,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return { data, error };
  }

  if (!data.user) {
    return {
      data,
      error: new Error("Supabase did not return a user account."),
    };
  }

  // The registration RPC requires an authenticated session.
  if (profile && data.session) {
    const { error: profileError } = await supabase.rpc(
      "set_own_registration_profile",
      {
        target_full_name: profile.full_name.trim(),
        target_role: "student",
        target_department: profile.department,
        target_year_level: profile.year_level,
      },
    );

    if (profileError) {
      console.error("Registration profile setup failed:", profileError);

      return {
        data,
        error: new Error(
          `Your account was created, but profile setup failed: ${profileError.message}`,
        ),
      };
    }
  }

  if (data.session) {
    setAuth(data.session);
  }

  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (!error && data.session) {
    setAuth(data.session);
  }

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (!error) {
    setAuth(null);
  }

  return { error };
}
