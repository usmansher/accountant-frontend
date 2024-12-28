'use client'

import axios from '@/lib/axios'
import { useState, useEffect } from 'react'

export default function BalanceSheetPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        axios.get('/api/reports/balancesheet')
            .then(response => {
                setData(response.data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError('Failed to fetch balance sheet')
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    // Data structure:
    // data.assets, data.liabilities, data.final_assets_total, data.final_liabilities_total, etc.

    // A helper function to render group/ledger rows
    const renderAccountTree = (node, indent = 0) => {
        const style = { paddingLeft: `${indent * 20}px` }

        let rows = []
        // Render current group if it has an ID > 4 (as per your logic) or just always
        if (node.id) {
            rows.push(
                <tr key={`group-${node.id}`}>
                    <td style={style}>{node.code} {node.name}</td>
                    <td className="text-right">{node.cl_total} {node.cl_total_dc}</td>
                </tr>
            )
        }

        // Render children groups
        if (node.children_groups && node.children_groups.length > 0) {
            node.children_groups.forEach(child => {
                rows = rows.concat(renderAccountTree(child, indent + 1))
            })
        }

        // Render children ledgers
        if (node.children_ledgers && node.children_ledgers.length > 0) {
            node.children_ledgers.forEach(ledger => {
                rows.push(
                    <tr key={`ledger-${ledger.id}`}>
                        <td style={{ paddingLeft: `${(indent + 1) * 20}px` }}>
                            {ledger.code} {ledger.name}
                        </td>
                        <td className="text-right">{ledger.cl_total} {ledger.cl_total_dc}</td>
                    </tr>
                )
            })
        }

        return rows
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Balance Sheet</h1>

            <div className="grid grid-cols-2 gap-4">
                {/* Assets Table */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Assets</h2>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {renderAccountTree(data.assets)}
                            <tr className="font-bold bg-gray-100">
                                <td>Total Assets</td>
                                <td className="text-right">{data.final_assets_total} D</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Liabilities Table */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Liabilities and Owners' Equity</h2>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {renderAccountTree(data.liabilities)}
                            <tr className="font-bold bg-gray-100">
                                <td>Total Liabilities & Equity</td>
                                <td className="text-right">{data.final_liabilities_total} C</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Additional info like P&L, OpDiff can also be shown if needed */}
            {/* For example: */}
            {data.is_opdiff && (
                <div className="mt-4 text-red-500">
                    Opening Difference Detected: {data.opdiff.opdiff_balance} {data.opdiff.opdiff_balance_dc}
                </div>
            )}
        </div>
    )
}
