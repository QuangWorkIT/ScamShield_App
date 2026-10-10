import { User } from "@/types/user"
import { create } from "zustand"

type AuthState = {
  token: string | null
  user: User | null
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  clearUser: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null, token: null }),
  logout: () => set({ user: null, token: null }),
}))
