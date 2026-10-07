import { GuestHeader } from "@/components/layout/guest/guest-header"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8FF] text-foreground dark:bg-background">
      <GuestHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
