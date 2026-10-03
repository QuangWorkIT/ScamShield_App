export default async function ModeratorDisputesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is moderator disputes detail page (id: {id})</div>
}
