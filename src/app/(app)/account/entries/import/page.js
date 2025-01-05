'use client'
import Header from '@/app/(app)/Header'
import Importer from '@/components/Importer'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import React from 'react'




const ImportPage = () => {
    const { hasPermission } = useAuth()
    const router = useRouter()

    if (!hasPermission('import-entries')) {
        router.back()
    }
    return (
        <div>
            <Header title="Import Entries" />


            <Importer />
        </div>
    )
}

export default ImportPage
