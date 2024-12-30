import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Canvas Settings',
  description: 'Configure your stream canvas settings',
}

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 