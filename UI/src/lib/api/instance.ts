import { decodeJwt } from "@/lib/utils/jwtUtil"
import { useAuthStore } from "@/store/auth.store"
import { UserRole } from "@/types/user"
import axios from "axios"

const BE_URL = process.env.NEXT_PUBLIC_BE_URL

const publicApi = axios.create({
    baseURL: BE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

const authorizeApi = axios.create({
    baseURL: BE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

authorizeApi.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
})

let refreshPromise: Promise<string | null> | null = null

authorizeApi.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config

        const isTokenExpired =
            error.response?.status === 401 &&
            error.response?.data?.message === "Token expired"

        if (isTokenExpired && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                if (!refreshPromise) {
                    refreshPromise = (async () => {
                        const refreshUrl = `${BE_URL}/auth/refresh-token`

                        const response = await axios.post(
                            refreshUrl,
                            {},
                            { withCredentials: true }
                        )

                        const newAccessToken =
                            response.data?.data?.accessToken || response.data?.accessToken

                        if (!newAccessToken) {
                            throw new Error("No access token returned from refresh API")
                        }

                        useAuthStore.getState().setToken(newAccessToken)

                        const decoded = decodeJwt(newAccessToken)
                        if (decoded?.id && decoded?.email && decoded?.role) {
                            useAuthStore.getState().setUser({
                                userId: String(decoded.id),
                                email: decoded.email,
                                role: decoded.role as UserRole,
                            })
                        }

                        return newAccessToken
                    })().finally(() => {
                        refreshPromise = null
                    })
                }

                const newAccessToken = await refreshPromise
                if (newAccessToken) {
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
                    return authorizeApi(originalRequest)
                }
            } catch (refreshError) {
                useAuthStore.getState().logout()
                return Promise.reject(refreshError)
            }
        }

        if (error.response?.status === 401 && !isTokenExpired) {
            useAuthStore.getState().logout()
        }

        return Promise.reject(error)
    }
)

export { publicApi, authorizeApi }
