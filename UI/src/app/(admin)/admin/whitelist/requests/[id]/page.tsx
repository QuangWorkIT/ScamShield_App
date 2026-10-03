export default async function AdminWhitelistRequestsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is admin whitelist requests detail page (id: {id})</div>
}
