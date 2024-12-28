'use client'

import axios from '@/lib/axios'
import { useEffect, useState } from 'react'

export default function ProfitLossPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        axios.get('/api/reports/profitloss')
            .then(res => {
                setData(res.data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError('Failed to fetch profit & loss data')
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    // Helper function to render account tree, similar to balance sheet
    const renderAccountTree = (node, indent = 0) => {
        const style = { paddingLeft: `${indent * 20}px` }

        let rows = []
        if (node.id) {
            rows.push(
                <tr key={`group-${node.id}`}>
                    <td style={style}>{node.code} {node.name}</td>
                    <td className="text-right">
                        {node.cl_total} {node.cl_total_dc}
                    </td>
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
                        <td style={{ paddingLeft: `${(indent + 1)*20}px` }}>
                            {ledger.code} {ledger.name}
                        </td>
                        <td className="text-right">
                            {ledger.cl_total} {ledger.cl_total_dc}
                        </td>
                    </tr>
                )
            })
        }

        return rows
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Profit & Loss Statement</h1>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Gross Expenses */}
                <div>
                    <h3 className="text-lg font-bold mb-2">Gross Expenses</h3>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {renderAccountTree(data.gross_expenses)}
                            <tr className="font-bold bg-gray-100">
                                <td>Total Gross Expenses</td>
                                <td className="text-right">{data.gross_expense_total} D</td>
                            </tr>
                            {data.gross_pl >= 0 && (
                                <tr className="font-bold">
                                    <td>Gross Profit</td>
                                    <td className="text-right">{data.gross_pl}</td>
                                </tr>
                            )}
                            <tr className="font-bold bg-gray-200">
                                <td>Total</td>
                                <td className="text-right">
                                    {data.gross_pl >= 0
                                        ? (data.gross_expense_total + data.gross_pl)
                                        : data.gross_expense_total}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Gross Incomes */}
                <div>
                    <h3 className="text-lg font-bold mb-2">Gross Incomes</h3>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {renderAccountTree(data.gross_incomes)}
                            <tr className="font-bold bg-gray-100">
                                <td>Total Gross Incomes</td>
                                <td className="text-right">{data.gross_income_total} C</td>
                            </tr>
                            {data.gross_pl < 0 && (
                                <tr className="font-bold">
                                    <td>Gross Loss</td>
                                    <td className="text-right">
                                        {Math.abs(data.gross_pl)}
                                    </td>
                                </tr>
                            )}
                            <tr className="font-bold bg-gray-200">
                                <td>Total</td>
                                <td className="text-right">
                                    {data.gross_pl < 0
                                        ? (data.gross_income_total + Math.abs(data.gross_pl))
                                        : data.gross_income_total}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Net Expenses */}
                <div>
                    <h3 className="text-lg font-bold mb-2">Net Expenses</h3>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {renderAccountTree(data.net_expenses)}
                            <tr className="font-bold bg-gray-100">
                                <td>Total Net Expenses</td>
                                <td className="text-right">{data.net_expense_total} D</td>
                            </tr>
                            {data.gross_pl < 0 && (
                                <tr className="font-bold">
                                    <td>Gross Loss B/D</td>
                                    <td className="text-right">{Math.abs(data.gross_pl)}</td>
                                </tr>
                            )}
                            {data.net_pl >= 0 && (
                                <tr className="font-bold text-green-600">
                                    <td>Net Profit</td>
                                    <td className="text-right">{data.net_pl}</td>
                                </tr>
                            )}
                            <tr className="font-bold bg-gray-200">
                                <td>Total</td>
                                <td className="text-right">
                                    {data.net_pl >= 0
                                        ? (data.net_expense_total + data.net_pl + (data.gross_pl < 0 ? Math.abs(data.gross_pl) : 0))
                                        : (data.net_expense_total + (data.gross_pl < 0 ? Math.abs(data.gross_pl) : 0))}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Net Incomes */}
                <div>
                    <h3 className="text-lg font-bold mb-2">Net Incomes</h3>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {renderAccountTree(data.net_incomes)}
                            <tr className="font-bold bg-gray-100">
                                <td>Total Net Incomes</td>
                                <td className="text-right">{data.net_income_total} C</td>
                            </tr>
                            {data.gross_pl >= 0 && (
                                <tr className="font-bold">
                                    <td>Gross Profit B/D</td>
                                    <td className="text-right">{data.gross_pl}</td>
                                </tr>
                            )}
                            {data.net_pl < 0 && (
                                <tr className="font-bold text-red-600">
                                    <td>Net Loss</td>
                                    <td className="text-right">{Math.abs(data.net_pl)}</td>
                                </tr>
                            )}
                            <tr className="font-bold bg-gray-200">
                                <td>Total</td>
                                <td className="text-right">
                                    {data.net_pl < 0
                                        ? (data.net_income_total + Math.abs(data.net_pl) + (data.gross_pl >= 0 ? data.gross_pl : 0))
                                        : (data.net_income_total + (data.gross_pl >= 0 ? data.gross_pl : 0))}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
