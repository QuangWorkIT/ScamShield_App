export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <p>This is auth layout</p>
      {children}
    </div>
  )
}
