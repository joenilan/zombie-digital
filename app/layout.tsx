import type { Metadata } from "next";
import { GeistSans } from 'geist/font';
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { LayoutWrapper } from "./layout-wrapper";

export const metadata: Metadata = {
  title: "Zombie.Digital | Twitch Management Platform",
  description: "Professional Twitch channel management and analytics platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
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
      </body>
    </html>
  );
}
