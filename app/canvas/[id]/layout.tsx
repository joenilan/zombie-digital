import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Navigation } from '@/components/navigation/Navigation'

export default async function CanvasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div style={{ 
        all: 'unset',
        display: 'block',
        position: 'fixed',
        inset: 0,
        background: 'none',
        backgroundColor: 'transparent',
        margin: 0,
        padding: 0,
        height: '100%',
        width: '100%',
        isolation: 'isolate'
      }}>
        {children}
      </div>
    )
  }

  return (
    <div className="canvas-page" data-logged-in="true">
      <Navigation />
      <div className="canvas-content">
        {children}
      </div>
    </div>
  )
} 