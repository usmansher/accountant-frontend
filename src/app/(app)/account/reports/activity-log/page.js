'use client'
import axios from '@/lib/axios'
import React, { useState, useEffect } from 'react'

const ActivityLogPage = () => {
  const [activityLogs, setActivityLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/activity-logs')
        const data  = res.data
        setActivityLogs(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>

      {activityLogs.length === 0 ? (
        <p>No activity logs found.</p>
      ) : (
        <div className="space-y-4">
          {activityLogs.map(log => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ActivityLogPage

const LogCard = ({ log }) => {
  // Parse the properties if they exist
  let parsedProps = {}
  try {
    // If properties is a JSON string, parse. If it’s already an object, just reuse
    parsedProps =
      typeof log.properties === 'string'
        ? JSON.parse(log.properties)
        : log.properties
  } catch (err) {
    console.error('Error parsing properties:', err)
  }

  // You might show “old/new” changes, or anything else from parsedProps
  const changes = parsedProps.old && parsedProps.attributes
    ? Object.keys(parsedProps.attributes).map((key) => ({
        field: key,
        oldValue: parsedProps.old?.[key],
        newValue: parsedProps.attributes?.[key],
      }))
    : []

  return (
    <div className="bg-white rounded shadow p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">
          {log.description || 'Activity Item'} by {log.causer?.name}
        </h2>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            log.event === 'created'
              ? 'bg-green-100 text-green-800'
              : log.event === 'updated'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {log.event}
        </span>

        
      </div>

      <div className="text-sm text-gray-500 mt-1">
        <p>Log Name: {log.log_name}</p>
        <p>
          Subject: {log.subject_type} #{log.subject_id}
        </p>
        {log.causer_type && log.causer_id && (
          <p>
            Caused by: {log.causer_type} #{log.causer_id}
          </p>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Date:</span> {new Date(log.created_at).toLocaleString()}
        </p>
      </div>

      {/* If you have old/new changes in properties, show them */}
      {changes.length > 0 && (
        <div className="mt-3">
          <h4 className="font-semibold">Changes:</h4>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Field</th>
                <th className="p-2 border">Old Value</th>
                <th className="p-2 border">New Value</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">{change.field}</td>
                  <td className="p-2 border">{change.oldValue ?? 'N/A'}</td>
                  <td className="p-2 border">{change.newValue ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* If you need to show entire properties structure */}
      {changes.length === 0 && Object.keys(parsedProps).length > 0 && (
        <div className="mt-3">
          <details className="cursor-pointer bg-gray-50 rounded border border-gray-200 p-2">
            <summary className="font-semibold text-sm text-gray-700">View Raw Properties</summary>
            <pre className="text-xs mt-1 text-gray-600">
              {JSON.stringify(parsedProps, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
