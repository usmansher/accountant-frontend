'use client'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import Header from '@/app/(app)/Header'
import { useRouter } from 'next/navigation'
import ViewModal from './ViewModal'
import ConfirmationModal from '@/components/ConfirmationModal'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'
import { Dropdown } from 'flowbite-react'

const EntriesTable = () => {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedEntryId, setSelectedEntryId] = useState(null)

    const [entrytypes, setEntryTypes] = useState([])

    const router = useRouter()

    const fetchEntries = () => {
        setLoading(true)
        axios
            .get('/api/entry')
            .then(res => {
                setEntries(res.data)
                setError(null)
            })
            .catch(error => {
                console.error('Error fetching entries:', error)
                setError('Failed to fetch entries')
            })
            .finally(() => setLoading(false))
    }

    const fetchEntryTypes = () => {
        setLoading(true)
        axios
            .get('/api/entrytypes')
            .then(res => {
                setEntryTypes(res.data)
                setError(null)
            })
            .catch(error => {
                console.error('Error fetching entries:', error)
                setError('Failed to fetch entries')
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchEntryTypes()
        fetchEntries()
    }, [])

    const handleView = id => {
        setSelectedEntryId(id)
        setIsModalOpen(true)
    }

    const handleDeleteClick = id => {
        setSelectedEntryId(id)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = () => {
        if (!selectedEntryId) return
        // Perform the delete via API
        axios
            .delete(`/api/entry/${selectedEntryId}`)
            .then(() => {
                // Close modal
                setIsDeleteModalOpen(false)
                setSelectedEntryId(null)
                // Refresh entries
                fetchEntries()
            })
            .catch(error => {
                console.error('Error deleting entry:', error)
                // Optionally show an error message to the user
            })
    }

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false)
        setSelectedEntryId(null)
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <>
            <Header title="Entries" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-start items-center pb-6 space-x-4 ">
                        <Dropdown label="Add Entry" dismissOnClick={false}>
                            {entrytypes.map(type => (
                                <Dropdown.Item
                                    key={type.id}
                                    onClick={() =>
                                        router.push(
                                            `/account/entries/add/${type.id}`,
                                        )
                                    }>
                                    {type.label}
                                </Dropdown.Item>
                            ))}
                        </Dropdown>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="bg-white border-b border-gray-200">
                            <div className="relative overflow-x-auto">
                                <table
                                    className="min-w-full divide-y divide-gray-200"
                                    id="entries_table">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Number
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ledger
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tag
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Debit Amount
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Credit Amount
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {entries.length > 0 ? (
                                            entries.map(entry => (
                                                <tr key={entry.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {entry.date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {entry.number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {entry.ledger}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {entry.type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {entry.tag}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {entry.dr_total}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {entry.cr_total}
                                                    </td>
                                                    <td className="px-6 flex gap-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button
                                                            onClick={() =>
                                                                handleView(
                                                                    entry.id,
                                                                )
                                                            }
                                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                            title="View Entry">
                                                            View
                                                        </button>
                                                        <a
                                                            href={`/account/entries/${entry.id}`}
                                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                            title="Edit Entry">
                                                            <FaPencilAlt />
                                                        </a>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    entry.id,
                                                                )
                                                            }
                                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                            title="Delete Entry">
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                    No entries found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ViewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                entryId={selectedEntryId}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete Confirmation"
                message="Are you sure you want to delete this entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    )
}

export default EntriesTable
