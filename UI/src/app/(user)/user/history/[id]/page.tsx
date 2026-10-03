export default async function UserHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is user history detail page (id: {id})</div>
}
