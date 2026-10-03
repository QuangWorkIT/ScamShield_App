export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <p>This is guest layout</p>
      {children}
      <p>press "d" to toggle system color</p>
    </div>
  )
}
