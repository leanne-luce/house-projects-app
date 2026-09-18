export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="empty-state">
      <div className="big-emoji">🔧</div>
      Detail page for {id} is coming in Phase 2.
    </div>
  );
}
