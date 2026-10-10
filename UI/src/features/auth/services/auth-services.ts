import { publicApi } from "@/lib/api/instance";
import { decodeJwt } from "@/lib/utils/jwtUtil";
import { useAuthStore } from "@/store/auth.store";
import { User, UserRole } from "@/types/user";
import axios from "axios";

export interface RefreshTokenResult {
    accessToken: string;
    user: User | null;
    role: UserRole | null;
}

let activeRefreshPromise: Promise<RefreshTokenResult> | null = null;

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
            throw new Error("Tài khoản/mật khẩu không chính xác")
        }
    },
    refreshToken: async function (): Promise<RefreshTokenResult> {
        if (activeRefreshPromise) {
            return activeRefreshPromise
        }

        activeRefreshPromise = (async () => {
            try {
                const response = await publicApi.post("/auth/refresh-token", {})
                const data = response.data

                const accessToken = data?.data?.accessToken || data?.accessToken
                if (!accessToken) {
                    throw new Error("No access token returned from refresh API")
                }

                useAuthStore.getState().setToken(accessToken)

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
                    useAuthStore.getState().setUser(currentUser)
                } else if (decoded?.role) {
                    currentRole = decoded.role as UserRole
                }

                return {
                    accessToken,
                    user: currentUser,
                    role: currentRole,
                }
            } finally {
                activeRefreshPromise = null
            }
        })()

        return activeRefreshPromise
    },
    logout: async function () {
        try {
            const response = await publicApi.post("/auth/logout",{})
            const data = response.data
            useAuthStore.getState().logout()
            return {message: data.message}
        } catch (error) {
            let message = "Đăng xuất thất bại."
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || message
            }
            throw new Error(message)
        }
    }
}