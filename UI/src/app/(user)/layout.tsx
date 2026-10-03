export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <p>This is user layout</p>
      {children}
    </div>
  )
}
