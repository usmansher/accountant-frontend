'use client'
import React, { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import IncomeExpenseMonthlyChart from './IncomeExpenseMonthlyChart'
import IncomeExpensePieChart from './IncomeExpensePieChart'

const Statistics = () => {
    const [ledgers, setLedgers] = useState([])
    const [, setAccsummary] = useState({})
    const [, setStatisticsTitle] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const statisticsRes = await axios.get('/api/dashboard')
            setLedgers(statisticsRes.data.ledgers)
            setAccsummary(statisticsRes.data.accsummary)
            setStatisticsTitle(statisticsRes.data.dashboard_title)
            // setAccounts(statisticsRes.data.accounts)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching Statistics data:', error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-6">Loading...</div>
    }

    return (
        <>
            <div className="grid grid-cols-10 gap-6 mt-6">
                <div className="col-span-7">
                    <IncomeExpenseMonthlyChart />
                </div>
                <div className="col-span-3">
                    <IncomeExpensePieChart />
                </div>
            </div>

            <div className="mt-8 flow-root h-96 overflow-auto bg-white shadow sm:rounded-lg">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table
                            className="min-w-full divide-y divide-gray-200"
                            id="ledgers_table">
                            <thead className="bg-gray-50 sticky">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Label
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {ledgers.map(ledger => (
                                    <tr key={ledger.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {ledger.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {ledger.balance}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Statistics
