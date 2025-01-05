'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import EntryForm from '@/components/Pages/Entries/EntryForm'
import axios from '@/lib/axios'
import { useAuth } from '@/hooks/auth'

const EntryPage = () => {
  const params = useParams()
  const { hasPermission } = useAuth()
  const router = useRouter()

  if (!hasPermission('edit-entries')) {
    router.back()
  }
  
  const { id } = params

  const [entry, setEntry] = useState(null)
  const getEntry = () => {
      axios.get(`/api/entry/${id}`)
          .then(response => {
            setEntry(response.data)
          })
          .catch(() => {
              return null
          })
  }
  useEffect(() => {
    getEntry()
  }, [])

  return <EntryForm id={id} entry={entry} entrytype={entry?.entry_type} />
}

export default EntryPage
