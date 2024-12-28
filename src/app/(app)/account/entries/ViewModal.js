'use client'
import { useState, useEffect } from 'react'
import axios from '@/lib/axios'

const ViewModal = ({ isOpen, onClose, entryId }) => {
    const [entry, setEntry] = useState(null)
    const [entryItems, setEntryItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    // const [sendingEmail, setSendingEmail] = useState(false)

    useEffect(() => {
        if (isOpen && entryId) {
            // Fetch entry details and items
            setLoading(true)
            axios.get(`/api/entry/${entryId}`)
                .then((res) => {
                    setEntry(res.data)
                    setEntryItems(res.data.items)
                })
                .catch((error) => {
                    console.error(error)
                    setErrorMsg('Error fetching entry details.')
                })
                .finally(() => setLoading(false))
        }
    }, [isOpen, entryId])

    // const handleSendEmail = () => {
    //     // Placeholder for sending email
    //     setSendingEmail(true)
    //     axios.post(`/api/entries/${entryId}/email`)
    //         .then((res) => {
    //             if (res.data.status === 'success') {
    //                 // Email sent successfully
    //                 setErrorMsg('')
    //                 // Close modal or handle success as needed
    //             } else {
    //                 setErrorMsg(res.data.msg || 'Email not sent.')
    //             }
    //         })
    //         .catch(() => {
    //             setErrorMsg('An error occurred while sending email.')
    //         })
    //         .finally(() => {
    //             setSendingEmail(false)
    //         })
    // }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true"></div>

                <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-3xl w-full z-50 p-6 relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    >
                        <span className="sr-only">Close</span>
                        &times;
                    </button>

                    {loading ? (
                        <div className="py-8 text-center">Loading entry details...</div>
                    ) : errorMsg ? (
                        <div className="py-8 text-center text-red-600">{errorMsg}</div>
                    ) : entry ? (
                        <>
                            <h2 className="text-xl font-semibold mb-4">View Entry</h2>
                            <p><strong>Number:</strong> {entry.number}</p>
                            <p><strong>Date:</strong> {entry.date}</p>
                            <p className="my-4">
                                <strong>Tag:</strong> {entry.tag ? entry.tag?.title : 'No Tag'}
                            </p>

                            <div className="overflow-x-auto mt-6">
                                <table className="min-w-full divide-y divide-gray-200" id="view_entries_table">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dr/Cr
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ledger
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dr Amount
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cr Amount
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Narration
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {entryItems.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                                    {item.dc === 'D' ? 'Dr' : 'Cr'}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                                    {item.ledger?.name}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                                    {item.dc == 'D' ? item.amount : ''}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                                    {item.dc == 'C' ? item.amount : ''}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                                    {item.narration}
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Totals row */}
                                        <tr className="font-semibold">
                                            <td className="px-4 py-2"></td>
                                            <td className="px-4 py-2">Total</td>
                                            <td className="px-4 py-2">{entry.dr_total}</td>
                                            <td className="px-4 py-2">{entry.cr_total}</td>
                                            <td className="px-4 py-2"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-end space-x-2">
                                {/* <button
                                    onClick={handleSendEmail}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                                    disabled={sendingEmail}
                                >
                                    {sendingEmail ? 'Sending...' : 'Send Email'}
                                </button>
                                <a
                                    href={`/entries/export/${entry.type_label}/${entry.id}/xls`}
                                    className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                                >
                                    Export XLS
                                </a>
                                <a
                                    href={`/entries/view/${entry.type_label}/${entry.id}/pdf`}
                                    className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                                >
                                    Export PDF
                                </a>
                                <a
                                    href={`/entries/edit/${entry.type_label}/${entry.id}`}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Edit
                                </a>
                                <a
                                    href={`/entries/delete/${entry.type_label}/${entry.id}`}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Delete
                                </a> */}
                                <button
                                    onClick={onClose}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center">No entry found.</div>
                    )}
                </div>
            </div>
        </div>
    )
}


export default ViewModal
