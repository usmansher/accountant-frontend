'use client'

import axios from '@/lib/axios'
import { useState, useEffect } from 'react'

export default function BalanceSheetPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        axios
            .get('/api/reports/balancesheet')
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

    // A helper function to render group/ledger rows
    const renderAccountTree = (node, indent = 0, dcType) => {
        const style = { paddingLeft: `${indent * 20}px` }

        let rows = []
        // Render current group if it has an ID > 4 (as per your logic) or just always
        if (node.id) {
            // Check for DC errors
            let hasDcError = false
            if (
                dcType == 'D' &&
                node.cl_total_dc == 'C' &&
                node.cl_total !== 0
            ) {
                hasDcError = true
            } else if (
                dcType == 'C' &&
                node.cl_total_dc == 'D' &&
                node.cl_total !== 0
            ) {
                hasDcError = true
            }

            rows.push(
                <tr
                    key={`group-${node.id}`}
                    className={hasDcError ? 'bg-red-300 text-black' : ''}>
                    <td style={style}>
                        <strong>
                            {node.code} {node.name}
                        </strong>
                    </td>
                    <td className="text-right">
                        <strong>
                            {node.cl_total} {node.cl_total_dc}
                        </strong>
                    </td>
                </tr>,
            )
        }

        // Render children groups
        if (node.children_groups && node.children_groups.length > 0) {
            node.children_groups.forEach(child => {
                rows = rows.concat(renderAccountTree(child, indent + 1, dcType))
            })
        }

        // Render children ledgers
        if (node.children_ledgers && node.children_ledgers.length > 0) {
            node.children_ledgers.forEach(ledger => {
                // Check for DC errors
                let hasDcError = false
                if (
                    dcType == 'D' &&
                    node.cl_total_dc == 'C' &&
                    node.cl_total !== 0
                ) {
                    hasDcError = true
                } else if (
                    dcType == 'C' &&
                    node.cl_total_dc == 'D' &&
                    node.cl_total !== 0
                ) {
                    hasDcError = true
                }

                rows.push(
                    <tr
                        key={`ledger-${ledger.id} ${ledger.code}`}
                        className={hasDcError ? 'bg-red-300 text-black' : ''}>
                        <td style={{ paddingLeft: `${(indent + 1) * 20}px` }}>
                            {ledger.code} {ledger.name}
                        </td>
                        <td className="text-right">
                            {ledger.cl_total} {ledger.cl_total_dc}
                        </td>
                    </tr>,
                )
            })
        }

        return rows
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Balance Sheet</h1>

            {data.is_opdiff && (
                <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                        <div className="shrink-0">
                            <svg
                                className="h-5 w-5 text-yellow-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true">
                                <path
                                    fillRule="evenodd"
                                    d="M10 3a1 1 0 011 1v8a1 1 0 01-2 0V4a1 1 0 011-1zm0 12a1 1 0 100-2 1 1 0 000 2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Opening Difference Detected:{' '}
                                {data.opdiff.opdiff_balance}{' '}
                                {data.opdiff.opdiff_balance_dc}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {/* Assets Table */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Assets</h2>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Account
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {renderAccountTree(data.assets, 0, 'D')}
                            <tr className="font-bold bg-gray-100">
                                <td>Total Assets</td>
                                <td className="text-right">
                                    {data.assets_total} D
                                </td>
                            </tr>
                            <tr className="font-bold bg-gray-100">
                                <td>
                                    Profit & Loss Account{' '}
                                    {data.pandl > 0
                                        ? '(Net Profit)'
                                        : '(Net Loss)'}
                                </td>
                                <td className="text-right">
                                    {Math.abs(data.pandl)} D
                                </td>
                            </tr>

                            <tr className="font-bold bg-gray-100">
                                <td>Total Assets</td>
                                <td className="text-right">
                                    {data.final_assets_total} D
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Liabilities Table */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">
                        Liabilities and Owners' Equity
                    </h2>
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Account
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {renderAccountTree(data.liabilities, 0, 'C')}
                            <tr className="font-bold bg-gray-100">
                                <td>Total Liabilities & Equity</td>
                                <td className="text-right">
                                    {data.liabilities_total} C
                                </td>
                            </tr>
                            {/* Difference in opening balance */}
                            {data.opdiff?.opdiff_balance_dc == 'C' && (
                                <tr className="font-bold bg-gray-100 text-red-500">
                                    <td>Diff in O/P Balance</td>
                                    <td className="text-right">
                                        {data.opdiff.opdiff_balance}{' '}
                                        {data.opdiff.opdiff_balance_dc}
                                    </td>
                                </tr>
                            )}

                            <tr className="font-bold bg-gray-100">
                                <td>Total Liabilities & Equity</td>
                                <td className="text-right">
                                    {data.final_liabilities_total} C
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
