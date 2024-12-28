'use client'
import Header from '@/app/(app)/Header'
import axios from '@/lib/axios'
import Cookies from 'js-cookie'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const Account = () => {
    const router = useRouter()

    // get data
    const { data, error, mutate } = useSWR('/api/account', () =>
        axios
            .get('/api/account')
            .then(res => res.data)
            .catch(() => {
                // if (error.response.status !== 409) throw error
                // router.push('/')
            }),
    )

    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>

    const activateAccount = async id => {
        try {
            Cookies.set('active_account_id', id)
            await axios.patch(`/api/account/${id}/activate`)
            router.push('/account/dashboard')
            mutate()
        } catch (error) {
            console.error('An unexpected error happened:', error)
        }
    }

    return (
        <>
            <Header title="Account List" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-start items-center pb-6 space-x-4">
                        <button
                            onClick={() => router.push('/account/create')}
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Create Account
                        </button>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className=" bg-white border-b border-gray-200">
                            {/* add create account button */}

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Account Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fiscal Year Start
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fiscal Year End
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created At
                                        </th>

                                        <th
                                            scope="col"
                                            className="relative px-6 py-3">
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map(account => (
                                        <tr key={account.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {account.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {account.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {moment(
                                                        account.fy_start,
                                                    ).format('MMM DD, YYYY')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {moment(
                                                        account.fy_end,
                                                    ).format('MMM DD, YYYY')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {moment(
                                                        account.created_at,
                                                    ).format('MMM DD, YYYY')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                                                <button
                                                    onClick={() =>
                                                        activateAccount(
                                                            account?.id,
                                                        )
                                                    }
                                                    className='bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded'
                                                >
                                                    Activate
                                                </button>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Account
