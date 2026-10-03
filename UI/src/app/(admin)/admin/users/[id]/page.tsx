export default async function AdminUsersDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is admin users detail page (id: {id})</div>
}
