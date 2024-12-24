import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Navbar from '@/components/Navbar'

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
      <html style={{ background: 'none' }}>
        <body style={{ background: 'none' }}>
          <div style={{ 
            background: 'none',
            backgroundImage: 'none',
            backgroundColor: 'transparent'
          }}>
            {children}
          </div>
        </body>
      </html>
    )
  }

  return (
    <div className="canvas-page" data-logged-in="true">
      <Navbar />
      <div className="canvas-content">
        {children}
      </div>
    </div>
  )
} 