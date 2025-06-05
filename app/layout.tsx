import { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import QueryProvider from "@/providers/query-provider"
import { Toaster } from 'sonner'
import { cn } from "@/lib/utils"
import { LayoutWrapper } from './layout-wrapper'
import "./globals.css"
import { Sofia_Sans, Sofia_Sans_Condensed } from 'next/font/google'

const sofia = Sofia_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  variable: '--font-sofia-sans',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
});

const sofiaCondensed = Sofia_Sans_Condensed({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sofia-condensed',
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
    <html lang="en" suppressHydrationWarning className={cn(sofia.variable, sofiaCondensed.variable)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
              
              // Suppress React DevTools warning in production
              if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
              }
            `,
          }}
        />
      </head>
      <body className={cn(
        "min-h-screen antialiased transition-colors duration-300 ease-in-out",
        sofia.className
      )}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <LayoutWrapper>
              <main>
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
