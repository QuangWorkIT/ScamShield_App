"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useRefreshToken } from "@/hooks/use-refresh-token"
import { UserRole } from "@/types/user"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter()
  const { isLoading, token, role } = useRefreshToken()
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

  useEffect(() => {
    // Wait for the initial refresh token attempt before verifying authorization
    if (isLoading) return

    // 1. If not logged in, redirect to login page
    if (!token) {
      setIsAuthorized(false)
      router.replace("/login")
      return
    }

    // 2. If role is not allowed, redirect to forbidden page
    if (!role || !allowedRoles.includes(role)) {
      setIsAuthorized(false)
      router.replace("/forbidden")
      return
    }

    // 3. Role matches allowed list
    setIsAuthorized(true)
  }, [isLoading, token, role, allowedRoles, router])

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
