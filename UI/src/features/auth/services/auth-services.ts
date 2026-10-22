import { publicApi } from "@/lib/api/instance";
import { decodeJwt } from "@/lib/utils/jwtUtil";
import { useAuthStore } from "@/store/auth.store";
import { User, UserRole } from "@/types/user";
import axios from "axios";
import { RegisterGoogleRequest } from "@/features/auth/types/auth.types";

export interface RefreshTokenResult {
    accessToken: string;
    user: User | null;
    role: UserRole | null;
}

let activeRefreshPromise: Promise<RefreshTokenResult> | null = null;

export interface VerifyContactsResult {
    verificationToken: string;
    expiresAt: string;
}

export interface RegisterPersonalPayload {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    verificationToken: string;
    agreeTerms: boolean;
    receiveAlerts: boolean;
}

export interface RegisterPartnerPayload {
    legalName: string;
    taxCode: string;
    corporateEmail: string;
    verificationToken: string;
    password?: string;
    representativeNameAndTitle: string;
    contactPhone: string;
    officialDomains: string;
    officialHotlines: string;
    smsBrandNames: string;
    legalRepresentative: boolean;
    agreeTerms: boolean;
}

export interface RegisterPartnerFiles {
    businessLicenseFiles: File[];
    ownershipProofFiles: File[];
    authorizationFiles: File[];
}

export interface RegisterPartnerResponseData {
    registrationId: number;
    userId: number;
    verificationStatus: string;
    submittedAt: string;
}

function extractErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data
        return data?.message || data?.error || fallback
    }
    return error instanceof Error ? error.message : fallback
}

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
    },
    sendPhoneOtp: async function (phoneNumber: string, recaptchaToken: string) {
        try {
            // Backend uses @RequestParam, so send form-urlencoded (token is too long for a query string)
            const body = new URLSearchParams({ phoneNumber, recaptchaToken })
            const response = await publicApi.post("/auth/send-phone-otp", body, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            })
            return { message: response.data?.message as string }
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Không thể gửi mã OTP."))
        }
    },
    verifyContacts: async function (
        phoneNumber: string,
        phoneOtp: string
    ): Promise<VerifyContactsResult> {
        try {
            const response = await publicApi.post("/auth/verify-contacts", {
                phoneNumber,
                phoneOtp,
            })
            return response.data.data as VerifyContactsResult
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Xác thực OTP thất bại."))
        }
    },
    registerPersonal: async function (payload: RegisterPersonalPayload) {
        try {
            const response = await publicApi.post("/auth/register/personal", payload)
            return { message: response.data?.message as string }
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Đăng ký thất bại."))
        }
    },
    registerPartner: async function (
        requestData: RegisterPartnerPayload,
        files: RegisterPartnerFiles
    ) {
        try {
            const formData = new FormData()
            formData.append(
                "request",
                new Blob([JSON.stringify(requestData)], { type: "application/json" })
            )
            files.businessLicenseFiles.forEach((file) => {
                formData.append("businessLicenseFiles", file)
            })
            files.ownershipProofFiles.forEach((file) => {
                formData.append("ownershipProofFiles", file)
            })
            files.authorizationFiles.forEach((file) => {
                formData.append("authorizationFiles", file)
            })

            const response = await publicApi.post("/partners/registrations", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            return response.data
        } catch (error) {
            throw new Error(extractErrorMessage(error, "Đăng ký đối tác thất bại."))
        }
    },
    loginGoogle: async function (idToken: string) {
        try {
            const response = await publicApi.post("/auth/login/google", {
                idToken: idToken.trim(),
            })
            const data = response.data
            const accessToken = data?.data?.accessToken || data?.accessToken
            if (!accessToken) {
                throw new Error("Không nhận được access token từ máy chủ")
            }
            useAuthStore.getState().setToken(accessToken)
            const decoded = decodeJwt(accessToken)
            return {
                role: (decoded?.role || ""),
                message: data?.message || "Đăng nhập Google thành công",
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                const msg = error.response?.data?.message || error.response?.data?.error
                if (status === 404) {
                    throw new Error(msg || "Tài khoản Google này chưa được đăng ký trong hệ thống. Vui lòng đăng ký trước.")
                }
                if (status === 401 || status === 403) {
                    throw new Error(msg || "Tài khoản bị tạm khóa hoặc không có quyền truy cập.")
                }
                if (msg) {
                    throw new Error(msg)
                }
            }
            throw new Error(error instanceof Error ? error.message : "Đăng nhập Google thất bại.")
        }
    },
    registerGoogle: async function (payload: RegisterGoogleRequest) {
        try {
            const response = await publicApi.post("/auth/register/google", payload)
            const data = response.data
            const accessToken = data?.data?.accessToken || data?.accessToken
            if (accessToken) {
                useAuthStore.getState().setToken(accessToken)
            }
            return {
                message: data?.message || "Đăng ký tài khoản qua Google thành công",
                accessToken,
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const msg = error.response?.data?.message || error.response?.data?.error
                if (msg) {
                    throw new Error(msg)
                }
            }
            throw new Error(error instanceof Error ? error.message : "Đăng ký tài khoản qua Google thất bại.")
        }
    },
}
