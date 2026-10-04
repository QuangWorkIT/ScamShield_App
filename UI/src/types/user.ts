export const USER_ROLES = ["admin", "user", "moderator", "guest"] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface User {
  userId: string
  email: string
  role: UserRole
}
