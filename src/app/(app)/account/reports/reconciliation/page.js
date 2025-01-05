'use client'

import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ReconciliationPage() {
    const { hasPermission } = useAuth()
    const router = useRouter()

    if (!hasPermission('reports-reconciliation')) {
        router.back()
    }

    const [ledgers, setLedgers] = useState({})
    const [ledgerId, setLedgerId] = useState(0)
    const [startdate, setStartdate] = useState('')
    const [enddate, setEnddate] = useState('')
    const [showall, setShowall] = useState('0')
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    const [reconciliationDates, setReconciliationDates] = useState({})
    // reconciliationDates will map entry_item_id -> date string

    useEffect(() => {
        // Initially fetch to get ledgers
        axios.get('/api/reports/reconciliation')
            .then(res => res.data)
            .then(json => {
                if (json.status === 'success') {
                    setLedgers(json.ledgers || {})
                } else {
                    setError(json.msg || 'Failed to load ledgers')
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError('Failed to load ledgers')
                setLoading(false)
            })
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        const params = new URLSearchParams()
        params.append('ledger_id', ledgerId)
        if (startdate) params.append('startdate', startdate)
        if (enddate) params.append('enddate', enddate)
        params.append('showall', showall)

        axios.get('/api/reports/reconciliation', { params })
        .then(res => res.data)
        .then(json => {
            if (json.status === 'success') {
                setData(json)
                // Reset reconciliationDates since we have new data
                const initialDates = {}
                if (json.entries && json.entries.length > 0) {
                    json.entries.forEach(entry => {
                        initialDates[entry.id] = entry.reconciliation_date || ''
                    })
                }
                setReconciliationDates(initialDates)
            } else {
                setError(json.msg || 'Failed to fetch data')
            }
            setLoading(false)
        })
        .catch(err => {
            console.error(err)
            setError('Failed to fetch data')
            setLoading(false)
        })
    }

    const handleReconciliationChange = (id, date) => {
        setReconciliationDates(prev => ({ ...prev, [id]: date }))
    }

    const handleReconcileSubmit = (e) => {
        e.preventDefault()
        // Prepare array of {id, recdate}
        const ReportRec = Object.entries(reconciliationDates).map(([id, recdate]) => ({
            id, recdate
        }))

        axios.post('/api/reports/reconciliation/update', { ReportRec })
            .then(res => res.data)
            .then(json => {
                if (json.status === 'success') {
                    alert('Reconciliation updated successfully')
                    // Optionally re-fetch or update UI accordingly
                } else {
                    alert('Failed to update reconciliation')
                }
            })
            .catch(err => {
                console.error(err)
                alert('Error updating reconciliation')
            })
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Reconciliation</h1>
            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                <div>
                    <label className="block font-semibold mb-1">Ledger</label>
                    <select
                        className="border p-2 rounded w-full"
                        value={ledgerId}
                        onChange={(e) => setLedgerId(e.target.value)}
                    >
                        {Object.entries(ledgers).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block font-semibold mb-1">Start Date</label>
                    <input
                        type="date"
                        className="border p-2 rounded w-full"
                        value={startdate}
                        onChange={(e) => setStartdate(e.target.value)}
                        disabled={ledgerId == 0}
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">End Date</label>
                    <input
                        type="date"
                        className="border p-2 rounded w-full"
                        value={enddate}
                        onChange={(e) => setEnddate(e.target.value)}
                        disabled={ledgerId == 0}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={showall === '1'}
                        onChange={() => setShowall(showall === '1' ? '0' : '1')}
                        disabled={ledgerId == 0}
                    />
                    <label>Show All Entries</label>
                </div>
                <div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        disabled={ledgerId == 0}
                    >
                        Submit
                    </button>
                </div>
            </form>

            {data && data.showEntries && (
                <div>
                    <h2 className="text-xl font-semibold mb-2 text-center">{data.subtitle}</h2>
                    <table className="min-w-full divide-y divide-gray-200 mb-4 bg-yellow-50">
                        <tbody>
                            <tr>
                                <td className="border px-4 py-2 font-semibold">Ledger</td>
                                <td className="border px-4 py-2">{data.ledger_data.name}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-semibold">{data.opening_title}</td>
                                <td className="border px-4 py-2">{data.opening_balance}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-semibold">{data.closing_title}</td>
                                <td className="border px-4 py-2">{data.closing_balance}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-semibold">{data.recpending_title} (Debit)</td>
                                <td className="border px-4 py-2">{data.recpending_balance_d}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 font-semibold">{data.recpending_title} (Credit)</td>
                                <td className="border px-4 py-2">{data.recpending_balance_c}</td>
                            </tr>
                        </tbody>
                    </table>

                    {data.entries && data.entries.length > 0 && (
                        <form onSubmit={handleReconcileSubmit}>
                            <table id="reconciliation_table" className="min-w-full divide-y divide-gray-200 border stripped">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="border px-4 py-2 text-left">Date</th>
                                        <th className="border px-4 py-2 text-left">Number</th>
                                        <th className="border px-4 py-2 text-left">Ledger</th>
                                        <th className="border px-4 py-2 text-left">Type</th>
                                        <th className="border px-4 py-2 text-left">Tag</th>
                                        <th className="border px-4 py-2 text-right">Debit Amount</th>
                                        <th className="border px-4 py-2 text-right">Credit Amount</th>
                                        <th className="border px-4 py-2 text-left">Reconciliation Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.entries.map(entry => (
                                        <tr key={entry.id}>
                                            <td className="border px-4 py-2">{entry.date}</td>
                                            <td className="border px-4 py-2">{entry.number}</td>
                                            <td className="border px-4 py-2">{entry.ledger?.name}</td>
                                            <td className="border px-4 py-2">{entry.entry_type?.name}</td>
                                            <td className="border px-4 py-2">{entry.tag?.title}</td>
                                            <td className="border px-4 py-2 text-right">{entry.dc === 'D' ? entry.amount : '' }</td>
                                            <td className="border px-4 py-2 text-right">{entry.dc === 'C' ? entry.amount : '' }</td>
                                            <td className="border px-4 py-2">
                                                <input
                                                    type="date"
                                                    value={reconciliationDates[entry.id] || ''}
                                                    onChange={(e) => handleReconciliationChange(entry.id, e.target.value)}
                                                    className="border p-1 rounded"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4">
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Reconcile
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}
