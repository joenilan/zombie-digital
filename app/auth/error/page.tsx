'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return 'You do not have access to this resource.'
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      default:
        return 'An unknown error occurred.'
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-red-600">Authentication Error</h2>
          <p className="mt-2 text-gray-600">{getErrorMessage()}</p>
        </div>

        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="group relative flex w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  )
} 