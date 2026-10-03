export default async function GuestEducationQuizzesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div>This is guest education quizzes detail page (id: {id})</div>
}
