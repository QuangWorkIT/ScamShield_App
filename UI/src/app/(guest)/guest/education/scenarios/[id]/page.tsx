export default async function GuestEducationScenariosDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is guest education scenarios detail page (id: {id})</div>
}
