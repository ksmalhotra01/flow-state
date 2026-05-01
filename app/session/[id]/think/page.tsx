export default async function ThinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-zinc-500">Thinking pad coming soon. Session ID: {id}</p>
    </div>
  )
}
