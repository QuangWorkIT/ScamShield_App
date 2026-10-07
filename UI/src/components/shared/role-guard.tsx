"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { decodeJwt } from "@/lib/utils/jwtUtil"
import { UserRole } from "@/types/user"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

  useEffect(() => {
    // 1. If not logged in, redirect to login page
    if (!token) {
      setIsAuthorized(false)
      router.replace("/login")
      return
    }

    // 2. Resolve user role from auth store or decoded JWT
    let currentRole: UserRole | null = (user?.role as UserRole) || null
    if (!currentRole && token) {
      const decoded = decodeJwt(token)
      currentRole = (decoded?.role as UserRole) || null
    }

    // 3. If role is not allowed, redirect to fobidden page
    if (!currentRole || !allowedRoles.includes(currentRole)) {
      setIsAuthorized(false)
      router.replace("/fobidden")
      return
    }

    // 4. Role matches allowed list
    setIsAuthorized(true)
  }, [token, user, allowedRoles, router])

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
