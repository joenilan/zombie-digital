export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="!bg-transparent fixed inset-0" style={{ background: 'transparent !important' }}>
      {children}
    </div>
  )
} 