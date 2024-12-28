'use client'
import React, { useEffect, useState } from 'react'
import { FaPlusSquare, FaUsers, FaCogs } from 'react-icons/fa'
import { IoStatsBars } from 'react-icons/io5'
import DataTable from 'react-data-table-component'
import axios from '@/lib/axios'
import Link from 'next/link'
import IncomeExpenseMonthlyChart from './IncomeExpenseMonthlyChart'
import IncomeExpensePieChart from './IncomeExpensePieChart'

const Statistics = () => {
    const [ledgers, setLedgers] = useState([])
    const [accsummary, setAccsummary] = useState({})
    const [StatisticsTitle, setStatisticsTitle] = useState('')
    const [accounts, setAccounts] = useState([])
    const [userCount, setUserCount] = useState(0)
    const [activeAccount, setActiveAccount] = useState(null)
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
        // finally {
        //     setLoading(false)
        // }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const columns = [
        {
            name: 'Label',
            selector: row => row.label,
            sortable: true,
            cell: row => <em>{row.label}</em>,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Fiscal Year',
            selector: row =>
                `${new Date(row.fy_start).toLocaleDateString()} to ${new Date(row.fy_end).toLocaleDateString()}`,
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <a href={row.href} title={row.title}>
                    <span className={`badge ${row.badgeClass}`}>
                        {row.label} <i className={row.iconClass}></i>
                    </span>
                </a>
            ),
        },
    ]

    if (loading) {
        return <div className="p-6">Loading...</div>
    }

    return (
        <section className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Create Account */}
                <div className="bg-gray-700 text-white rounded-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl">Create Account</h3>
                        <p className="text-sm">Create a new account</p>
                    </div>
                </div>
                {/* Manage Accounts */}
                <div className="bg-gray-700 text-white rounded-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl">{accounts.length}</h3>
                        <p className="text-sm">Manage Accounts</p>
                    </div>
                </div>
                {/* Manage Users */}
                <div className="bg-gray-700 text-white rounded-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl">{userCount}</h3>
                        <p className="text-sm">Manage Users</p>
                    </div>
                </div>
                {/* Settings */}
                <div className="bg-gray-700 text-white rounded-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl">Settings</h3>
                        <p className="text-sm">General Settings</p>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <IncomeExpenseMonthlyChart />
        <IncomeExpensePieChart />
      </div>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl">Accounts</h3>
                    <p className="text-sm">
                        Current Account:{' '}
                        <em className="text-lg">
                            "{activeAccount?.label || 'Default'}"
                        </em>
                    </p>
                </div>
                <DataTable
                    columns={columns}
                    data={accounts}
                    pagination={false}
                    fixedHeader
                    fixedHeaderScrollHeight="200px"
                    highlightOnHover
                    responsive
                    noHeader
                />
            </div>
        </section>
    )
}

export default Statistics
