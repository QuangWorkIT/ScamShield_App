"use client"

import { useRouter } from "next/navigation"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { useAuthStore } from "@/store/auth.store"
import { UserRole } from "@/types/user"

// Home route for each role (matches folders under src/app/(role)/role)
export const ROLE_HOME: Record<UserRole, string> = {
  guest: "/guest",
  user: "/user",
  moderator: "/moderator",
  admin: "/admin",
}

/**
 * Dev-only helper to switch the current mock user/role and jump to that role's home page.
 * Rendered in the root layout so it's available on every route.
 */
export function RoleSwitcher() {
  const router = useRouter()
  const currentUser = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  return (
    <div className="fixed top-50 left-5 z-50 flex items-center gap-2 rounded-md border bg-background p-2 text-xs shadow-md">
      <span>Current User: {currentUser?.userId ?? "none"}</span>
      <NativeSelect
        size="sm"
        value={currentUser?.userId ?? ""}
        onChange={(e) => {
          const value = e.target.value as UserRole | ""
          if (!value) {
            setUser(null)
            router.push("/")
            return
          }
          setUser({ userId: value, email: "[EMAIL_ADDRESS]", role: value })
          router.push(ROLE_HOME[value])
        }}
      >
        <NativeSelectOption value="">Select user</NativeSelectOption>
        <NativeSelectOption value="guest">Guest</NativeSelectOption>
        <NativeSelectOption value="user">Registered User</NativeSelectOption>
        <NativeSelectOption value="moderator">Moderator</NativeSelectOption>
        <NativeSelectOption value="admin">Admin</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}
