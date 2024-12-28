'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import EntryForm from '@/components/Pages/Entries/EntryForm'
import axios from '@/lib/axios'

const EntryPage = () => {
  const params = useParams()
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
