'use client'

import axios from '@/lib/axios'
import { useState, useEffect } from 'react'

export default function TrialBalancePage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        axios.get('/api/reports/trialbalance')
            .then((res) => {
                setData(res.data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError('Failed to fetch trial balance data')
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    // Recursive function to print the account chart
    const renderAccountChart = (account, indent = 0) => {
        const rows = []
        const style = { paddingLeft: `${indent * 20}px` }

        // Print this group if id != 0 or always if you want
        if (account.id !== null) {
            rows.push(
                <tr key={`group-${account.id}`}>
                    <td style={style}>{account.code} {account.name}</td>
                    <td>Group</td>
                    <td>{formatCurrency(account.op_total_dc, account.op_total)}</td>
                    <td>{formatCurrency('D', account.dr_total)}</td>
                    <td>{formatCurrency('C', account.cr_total)}</td>
                    <td>{formatCurrency(account.cl_total_dc, account.cl_total)}</td>
                </tr>
            )
        }

        // Print child ledgers
        if (account.children_ledgers && account.children_ledgers.length > 0) {
            account.children_ledgers.forEach(ledger => {
                rows.push(
                    <tr key={`ledger-${ledger.id}`}>
                        <td style={{ paddingLeft: `${(indent + 1)*20}px` }}>{ledger.code} {ledger.name}</td>
                        <td>Ledger</td>
                        <td>{formatCurrency(ledger.op_total_dc, ledger.op_total)}</td>
                        <td>{formatCurrency('D', ledger.dr_total)}</td>
                        <td>{formatCurrency('C', ledger.cr_total)}</td>
                        <td>{formatCurrency(ledger.cl_total_dc, ledger.cl_total)}</td>
                    </tr>
                )
            })
        }

        // Print child groups recursively
        if (account.children_groups && account.children_groups.length > 0) {
            account.children_groups.forEach((child) => {
                rows.push(...renderAccountChart(child, indent + 1))
            })
        }

        return rows
    }

    const formatCurrency = (dc, amount) => {
        // Implement your currency formatting logic here
        // Just a simple example:
        return `${amount} ${dc}`
    }

    const { title, subtitle, accountlist, dr_total, cr_total } = data
    const balanced = dr_total === cr_total

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            <div className="text-center mb-4">{subtitle}</div>

            <table className="min-w-full divide-y divide-gray-200 border" id="trialbalance_table">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Account Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Opening Balance
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dr Total
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cr Total
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Closing Balance
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {renderAccountChart(accountlist)}
                    <tr className={`font-bold ${balanced ? 'text-green-600' : 'text-red-600'}`}>
                        <td>Total</td>
                        <td></td>
                        <td></td>
                        <td>{formatCurrency('D', dr_total)}</td>
                        <td>{formatCurrency('C', cr_total)}</td>
                        <td>{balanced ? 'Balanced ✔' : 'Not Balanced ✖'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
