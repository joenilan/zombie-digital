"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { LoadingSpinner } from "@/components/LoadingSpinner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isInitialized, isLoading } = useAuth()

  // Redirect to sign-in if not authenticated after initialization
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.replace('/auth/signin')
    }
  }, [user, isInitialized, isLoading, router])

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return <LoadingSpinner text="Authenticating..." />
  }

  // Don't render if no user (redirect will happen)
  if (!user) {
    return <LoadingSpinner text="Redirecting to login..." />
  }

  return children
} 