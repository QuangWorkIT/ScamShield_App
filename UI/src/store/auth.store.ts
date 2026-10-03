import { User } from "@/types/user"
import { create } from "zustand"

type AuthState = {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
