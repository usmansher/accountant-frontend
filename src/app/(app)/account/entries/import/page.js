'use client'
import Importer from '@/components/Importer'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/router'
import React from 'react'

const ImportPage = () => {
    const { hasPermission } = useAuth()
    const router = useRouter()

    if (!hasPermission('import-entries')) {
        router.back()
    }
    return (
        <div>
            <h1>Import Entries</h1>
            <Importer />
        </div>
    )
}

export default ImportPage
