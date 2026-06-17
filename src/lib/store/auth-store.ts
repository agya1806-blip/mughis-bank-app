"use client";

import { create } from "zustand";
import { createClient } from "@/lib/localDb";

interface LocalUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}

interface AuthState {
  user: LocalUser | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: LocalUser | null) => void;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),

  initialize: async () => {
    try {
      const client = createClient();
      const { data: { user } } = await client.auth.getUser();
      set({ user, initialized: true, loading: false });
    } catch {
      set({ initialized: true, loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      const client = createClient();
      const { error, data } = await client.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      set({ user: data?.user || null });
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  },

  signUp: async (email, password, fullName) => {
    try {
      const client = createClient();
      const { error } = await client.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) return { error: error.message };
      set({ user: null });
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  },

  signInWithGoogle: async () => {
    // Google Login tidak tersedia di mode lokal
  },

  signOut: async () => {
    const client = createClient();
    await client.auth.signOut();
    set({ user: null });
  },

  resetPassword: async (email) => {
    try {
      const client = createClient();
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  },
}));
