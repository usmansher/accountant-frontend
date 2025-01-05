'use client'
import Header from '@/app/(app)/Header'
import axios from '@/lib/axios'
import { useEffect, useState } from 'react'
import GroupItem from './GroupItem'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/auth'

const Dashboard = () => {
    const [data, setData] = useState(null)
    const { hasPermission } = useAuth()
    const router = useRouter()
    useEffect(() => {
        axios
            .get('/api/chart-of-account')
            .then(res => {
                setData(res?.data)
            })
            .catch(() => {
                toast.error('Failed to load chart of accounts')
            })
    }, [])

    if (!data) {
        return <div>Loading...</div>
    }

    return (
        <>
            <Header title="Chart of Accounts" />
            {/* add create account button */}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-start items-center pb-6 space-x-4 ">
                        
                        {hasPermission('create-ledgers') && (
                            <Button
                                onClick={() => router.push('/account/ledger/create')}
                                type="button"
                            >
                                Add Ledger
                            </Button>
                        )}
                        {hasPermission('create-groups') && (
                            <Button
                                onClick={() => router.push('/account/group/create')}
                                type="button"
                            >
                                Add Group
                            </Button>
                        )}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="bg-white border-b border-gray-200">
                            <div>
                                <div className="relative overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 ">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3">
                                                    Name
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3">
                                                    Type
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3">
                                                    Opening Balance
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3">
                                                    Closing Balance
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <GroupItem group={data} />
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
