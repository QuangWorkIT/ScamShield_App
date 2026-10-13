import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth, RecaptchaVerifier } from "firebase/auth"

function getFirebaseApp() {
  if (getApps().length > 0) return getApp()
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
}

/**
 * Solves a Firebase reCAPTCHA challenge and returns a one-time token for
 * the backend `send-phone-otp` endpoint. reCAPTCHA tokens cannot be reused and
 * a cleared verifier leaves its container unusable, so every call renders into
 * a fresh child element that is removed afterwards.
 */
export async function getRecaptchaToken(containerId: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error("Thiếu cấu hình Firebase (NEXT_PUBLIC_FIREBASE_*).")
  }
  const parent = document.getElementById(containerId)
  if (!parent) {
    throw new Error("Không tìm thấy vùng xác thực reCAPTCHA.")
  }
  const mount = document.createElement("div")
  parent.appendChild(mount)

  const verifier = new RecaptchaVerifier(getAuth(getFirebaseApp()), mount, {
    size: "invisible",
  })
  try {
    return await verifier.verify()
  } finally {
    verifier.clear()
    mount.remove()
  }
}
