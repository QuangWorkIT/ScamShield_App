import { Geist, Geist_Mono, Roboto_Slab, Source_Sans_3 } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"
import { ToastContainer } from "@/components/shared/toast-container"
import "react-toastify/dist/ReactToastify.css"

const sourceSans3Heading = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-heading",
})

const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-serif" })

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        "font-serif",
        robotoSlab.variable,
        sourceSans3Heading.variable
      )}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
