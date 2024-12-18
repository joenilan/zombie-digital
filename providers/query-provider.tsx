"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { TanstackQueryDevtools } from "@/components/providers/tanstack-query-devtools"

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <TanstackQueryDevtools />
    </QueryClientProvider>
  )
} 