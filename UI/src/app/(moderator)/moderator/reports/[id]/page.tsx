export default async function ModeratorReportsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is moderator reports detail page (id: {id})</div>
}
