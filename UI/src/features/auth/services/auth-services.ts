import { publicApi } from "@/lib/api/instance";
import { decodeJwt } from "@/lib/utils/jwtUtil";
import { useAuthStore } from "@/store/auth.store";
import axios from "axios";

export const authServices = {
    loginByForm: async function (identifier: string, password: string) {
        try {
            const response = await publicApi.post("/auth/login", {
                usernameOrPhoneNumber: identifier.trim(),
                password,
            })
            const data = response.data

            const { setToken } = useAuthStore.getState()
            const accessToken = data?.data?.accessToken || data?.accessToken
            if (!accessToken) {
                throw new Error("Invalid access token")
            }
            setToken(accessToken)
    
            const decoded = decodeJwt(accessToken)
            return { role: (decoded?.role || "") }
        } catch (error: unknown) {
            let message = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || message
            }
            throw new Error(message)
        }
    }
}