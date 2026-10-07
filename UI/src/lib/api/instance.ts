import { useAuthStore } from "@/store/auth.store"
import axios from "axios"

const BE_URL = process.env.NEXT_PUBLIC_BE_URL

const publicApi = axios.create({
    baseURL: BE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
})

const authorizeApi = axios.create({
    baseURL: BE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    }
})

authorizeApi.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
})


export { publicApi, authorizeApi }