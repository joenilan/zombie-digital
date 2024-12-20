import type { Metadata } from "next";
import { GeistSans } from 'geist/font';
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { LayoutWrapper } from "./layout-wrapper";
import QueryProvider from "@/providers/query-provider"

export const metadata: Metadata = {
  title: "Zombie.Digital - Twitch Management Platform",
  description: "Take control of your Twitch presence with professional management tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
