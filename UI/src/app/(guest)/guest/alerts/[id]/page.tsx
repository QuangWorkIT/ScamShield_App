export default async function GuestAlertsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is guest alerts detail page (id: {id})</div>
}
