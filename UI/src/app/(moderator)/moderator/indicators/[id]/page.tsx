export default async function ModeratorIndicatorsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is moderator indicators detail page (id: {id})</div>
}
