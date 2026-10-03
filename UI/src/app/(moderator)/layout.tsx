export default function ModeratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <p>This is moderator layout</p>
      {children}
    </div>
  )
}
