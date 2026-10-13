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

export async function getRecaptchaToken(containerId: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error("Thiếu cấu hình Firebase (NEXT_PUBLIC_FIREBASE_*).")
  }
  const verifier = new RecaptchaVerifier(
    getAuth(getFirebaseApp()),
    containerId,
    { size: "invisible" }
  )
  try {
    return await verifier.verify()
  } finally {
    verifier.clear()
  }
}
