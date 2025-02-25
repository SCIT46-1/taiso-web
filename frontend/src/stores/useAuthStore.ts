// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  email: string;
  userId: number;
  // Add additional fields as needed
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  // State update actions
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setUser: (user: User | null) =>
        set(() => ({
          user,
          isAuthenticated: !!user,
        })),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // Key for localStorage
    }
  )
);
