const role = ["admin", "user", "moderator","guest"] as const

export type UserRole = (typeof role)[number]

export interface User {
    userId: string
    email: string
    role: UserRole
}