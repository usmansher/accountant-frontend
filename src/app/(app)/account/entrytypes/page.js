'use client'
import React, { useEffect, useState } from 'react'
import EntryTypeModal from './EntryTypeModal'
import toast from 'react-hot-toast'
import axios from '@/lib/axios'
import Header from '../../Header'

const EntryTypesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editData, setEditData] = useState(null) // data if editing existing entry types

    const [entryTypes, setEntryTypes] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchEntryTypes = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/api/entrytypes')
            setEntryTypes(response.data)
        } catch (error) {
            toast.error('Failed to load entry types')
        } finally {
            setLoading(false)
        }
    }
    const handleOpenModal = (data = null) => {
        setEditData(data)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditData(null)
    }

    const handleFormSubmit = values => {
        const method = editData ? 'put' : 'post'
        const url = editData
            ? `/api/entrytypes/${editData.id}`
            : '/api/entrytypes'

        axios[method](url, values)
            .then(() => {
                toast.success('Entry type saved successfully')
                fetchEntryTypes()
                handleCloseModal()
            })
            .catch(() => {
                toast.error('Failed to save entry type')
            })
    }

    useEffect(() => {
        fetchEntryTypes()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }
    return (
        <>
            <Header title="Entry Types" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-start items-center pb-6 space-x-4 ">
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4">
                            Add New Entry Type
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="bg-white border-b border-gray-200">
                            <div className="relative overflow-x-auto">
                                <table
                                    className="min-w-full divide-y divide-gray-200"
                                    id="entries_table">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Label
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Prefix
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Suffix
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Zero Padding
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {entryTypes.map(et => (
                                            <tr key={et.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {et.label}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {et.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {et.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {et.prefix}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {et.suffix}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {et.zero_padding}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <button
                                                        onClick={() =>
                                                            handleOpenModal(et)
                                                        }
                                                        className="text-blue-600 hover:text-blue-900">
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {isModalOpen && (
                                    <EntryTypeModal
                                        isOpen={isModalOpen}
                                        onClose={handleCloseModal}
                                        initialData={editData}
                                        onSubmit={handleFormSubmit}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EntryTypesPage
