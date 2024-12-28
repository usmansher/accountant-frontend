'use client'

import React, { useEffect, useState } from 'react'
import EntryForm from '@/components/Pages/Entries/EntryForm'
import { useParams } from 'next/navigation'
import axios from '@/lib/axios'

const EntryPage = () => {
    const { entrytype } = useParams()

    const [entryType, setEntryType] = useState(null)
    const getEntryType = () => {
        axios.get(`/api/entrytypes/${entrytype}`)
            .then(response => {
                setEntryType(response.data)
            })
            .catch(() => {
                return null
            })
    }
    useEffect(() => {
        getEntryType()
    }, [])
    return <EntryForm entrytype={entryType} />
}

export default EntryPage
