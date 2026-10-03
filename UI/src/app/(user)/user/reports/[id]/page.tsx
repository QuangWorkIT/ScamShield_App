export default async function UserReportsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is user reports detail page (id: {id})</div>
}
