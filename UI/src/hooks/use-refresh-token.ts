"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { decodeJwt } from "@/lib/utils/jwtUtil"
import { User, UserRole } from "@/types/user"

const BE_URL = process.env.NEXT_PUBLIC_BE_URL

export interface RefreshTokenResult {
  accessToken: string
  user: User | null
  role: UserRole | null
}

let activeRefreshPromise: Promise<RefreshTokenResult | null> | null = null

export function useRefreshToken() {
  const pathname = usePathname()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  const [isLoading, setIsLoading] = useState<boolean>(!token)
  const [isInitialized, setIsInitialized] = useState<boolean>(Boolean(token))
  const [error, setError] = useState<string | null>(null)
  const initializedRef = useRef(false)

  const refresh = useCallback(async (): Promise<RefreshTokenResult | null> => {
    if (activeRefreshPromise) {
      return activeRefreshPromise
    }

    setIsLoading(true)
    setError(null)

    activeRefreshPromise = (async () => {
      try {
        const refreshUrl = `${BE_URL}/auth/refresh-token`
        const response = await axios.post(
          refreshUrl,
          {},
          { withCredentials: true }
        )

        const accessToken =
          response.data?.data?.accessToken || response.data?.accessToken

        if (!accessToken) {
          throw new Error("No access token returned from refresh API")
        }

        setToken(accessToken)

        let currentUser: User | null = null
        let currentRole: UserRole | null = null

        const decoded = decodeJwt(accessToken)
        if (decoded?.id && decoded?.email && decoded?.role) {
          currentUser = {
            userId: String(decoded.id),
            email: decoded.email,
            role: decoded.role as UserRole,
          }
          currentRole = decoded.role as UserRole
          setUser(currentUser)
        } else if (decoded?.role) {
          currentRole = decoded.role as UserRole
        }

        return {
          accessToken,
          user: currentUser,
          role: currentRole,
        }
      } catch (err: unknown) {
        logout()
        let errMsg = "Failed to refresh token"
        let isCookieMissing = false

        if (axios.isAxiosError(err)) {
          errMsg = err.response?.data?.message || errMsg
          if (errMsg.toLowerCase().includes("cookie is missing")) {
            isCookieMissing = true
          }
        }

        setError(errMsg)

        // Only show session expired toast if the session actually expired,
        // and avoid showing it on auth pages (login/register) or when no cookie was ever present.
        const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register")
        if (!isCookieMissing && !isAuthPage) {
          toast.error("Phiên đã kết thúc, vui lòng đăng nhập lại", {
            toastId: "session-expired",
            position: "top-right",
          })
        }

        return null
      } finally {
        activeRefreshPromise = null
        setIsLoading(false)
        setIsInitialized(true)
      }
    })()

    return activeRefreshPromise
  }, [setToken, setUser, logout, pathname])

  useEffect(() => {
    // Only attempt initial refresh once per page lifecycle
    if (initializedRef.current) {
      return
    }
    initializedRef.current = true

    // If token is already present in store, no need to refresh on initial mount
    if (useAuthStore.getState().token) {
      setIsLoading(false)
      setIsInitialized(true)
      return
    }

    let isMounted = true

    refresh().then(() => {
      if (isMounted) {
        setIsLoading(false)
        setIsInitialized(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [refresh])

  // Resolve role from user object or decoded token
  let role: UserRole | null = (user?.role as UserRole) || null
  if (!role && token) {
    const decoded = decodeJwt(token)
    role = (decoded?.role as UserRole) || null
  }

  return {
    token,
    user,
    role,
    isLoading,
    isInitialized,
    error,
    refresh,
  }
}

