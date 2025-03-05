// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  email: string;
  userId: number;
  userNickname: string;
  // Add additional fields as needed
}

interface AuthState {
  isAuthenticated: boolean;
  isOAuth: boolean;
  user: User | null;
  // State update actions
  setUser: (user: User | null, isOAuth: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isAuthenticated: false,
      isOAuth: false,
      user: null,
      setUser: (user: User | null, isOAuth: boolean) =>
        set(() => ({
          user,
          isAuthenticated: !!user,
          isOAuth,
        })),
      logout: () => set({ user: null, isAuthenticated: false, isOAuth: false }),
    }),
    {
      name: "auth-storage", // Key for localStorage
    }
  )
);
