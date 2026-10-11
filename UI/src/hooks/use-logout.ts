"use client"

import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { authServices } from "@/features/auth/services/auth-services"

export function useLogout() {
  const router = useRouter()

  return async function handleLogout() {
    try {
      await authServices.logout()
      toast.success("Đăng xuất thành công")
      router.push("/login")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Đã có lỗi xảy ra, vui lòng thử lại"
      )
    }
  }
}
