import { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import QueryProvider from "@/providers/query-provider"
import { Toaster } from 'sonner'
import { cn } from "@/lib/utils"
import { LayoutWrapper } from './layout-wrapper'
import "./globals.css"
import { Sofia_Sans } from 'next/font/google'

const sofia = Sofia_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-sofia-sans',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
});

export const metadata: Metadata = {
  title: 'Zombie.Digital',
  description: 'Your Digital Presence, Simplified',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={sofia.variable}>
      <body className={cn(
        "min-h-screen antialiased transition-colors duration-300 ease-in-out",
        sofia.className
      )}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <LayoutWrapper>
              <main className="min-h-screen transition-all duration-300 ease-in-out">
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
