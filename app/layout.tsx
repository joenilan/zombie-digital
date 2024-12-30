import { GeistSans } from 'geist/font/sans'
import { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import QueryProvider from "@/providers/query-provider"
import { Toaster } from 'sonner'
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cn } from "@/lib/utils"
import { LayoutWrapper } from './layout-wrapper'
import "./globals.css"

export const metadata: Metadata = {
  title: 'Zombie.Digital',
  description: 'Your Digital Presence, Simplified',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans antialiased", GeistSans.className)}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <LayoutWrapper>
              <main className="min-h-screen">
                {children}
              </main>
            </LayoutWrapper>
          </ThemeProvider>
        </QueryProvider>
        <Toaster 
          position="bottom-right" 
          duration={15000} 
          richColors
          expand={true}
          closeButton={true}
          theme="dark"
        />
      </body>
    </html>
  )
}
