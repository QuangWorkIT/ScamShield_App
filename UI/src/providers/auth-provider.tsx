"use client"

import * as React from "react"
import { useRefreshToken } from "@/hooks/use-refresh-token"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useRefreshToken()
  return <>{children}</>
}
