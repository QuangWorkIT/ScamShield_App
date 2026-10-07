const role = ["ADMINISTRATOR", "REGISTERED_USER", "MODERATOR", "GUEST", "BUSINESS_PARTNER"] as const

export type UserRole = (typeof role)[number]

export interface User {
  userId: string
  email: string
  role: UserRole
}
