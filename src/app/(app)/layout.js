'use client'

import { useAuth } from '@/hooks/auth'
import Navigation from '@/app/(app)/Navigation'
import Loading from '@/app/(app)/Loading'
import { useConfig } from '@/hooks/config'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

const AppLayout = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })
    const { isLoading, isError } = useConfig()

    useEffect(() => {
      if (isError) {
        console.error("Error loading config:", isError)
      }
    }, [isError])

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading config.</div>


    if (!user) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation user={user} />
            <main>{children}</main>
            <Toaster />
        </div>
    )
}

export default AppLayout
