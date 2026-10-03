export default async function AdminEscalationsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is admin escalations detail page (id: {id})</div>
}
