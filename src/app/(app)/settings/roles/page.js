'use client'
import axios from '@/lib/axios'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Header from '../../Header'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'

export default function RolesPage() {
    const { hasPermission } = useAuth()
    const router = useRouter()

    if (!hasPermission('list-roles')) {
        router.back()
    }

    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentId, setCurrentId] = useState(null)

    const fetchRoles = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/api/role')
            setRoles(response.data)
        } catch (error) {
            toast.error('Failed to load roles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
    })

    const formik = useFormik({
        initialValues: {
            name: '',
        },
        validationSchema,
        onSubmit: async values => {
            try {
                if (isEditMode && currentId) {
                    await axios.put(`/api/role/${currentId}`, values)
                    toast.success('Role updated successfully')
                } else {
                    await axios.post('/api/role', values)
                    toast.success('Role created successfully')
                }
                fetchRoles()
                setShowModal(false)
                resetForm()
            } catch (error) {
                toast.error('Failed to save role')
            }
        },
    })

    const resetForm = () => {
        formik.resetForm()
        setIsEditMode(false)
        setCurrentId(null)
    }

    const handleEdit = role => {
        setIsEditMode(true)
        setCurrentId(role.id)
        formik.setValues({
            name: role.name || '',
        })
        setShowModal(true)
    }

    const handleDelete = async id => {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
                await axios.delete(`/api/role/${id}`)
                toast.success('Role deleted successfully')
                fetchRoles()
            } catch (error) {
                toast.error('Failed to delete role')
            }
        }
    }

    return (
        <>
            <Header title="Roles" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-start items-center pb-6 space-x-4">
                        {hasPermission('create-roles') && (
                            <button
                                onClick={() => {
                                    resetForm()
                                    setShowModal(true)
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
                                Add New Role
                            </button>
                        )}
                    </div>
                    <Toaster />

                    {/* Roles Table */}
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
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
                                                    Name
                                                </th>
                                               
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roles.map(role => (
                                                <tr key={role.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {role.name}
                                                    </td>
                                                  
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hasPermission(
                                                            'edit-roles',
                                                        ) && (
                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        role,
                                                                    )
                                                                }
                                                                className="bg-yellow-500 text-white px-2 py-1 rounded">
                                                                Edit
                                                            </button>
                                                        )}

                                                        {hasPermission(
                                                            'delete-roles',
                                                        ) && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        role.id,
                                                                    )
                                                                }
                                                                className="bg-red-500 text-white px-2 py-1 ml-2 rounded">
                                                                Delete
                                                            </button>
                                                        )}

                                                        {/* NEW: Permissions Button */}
                                                        {hasPermission(
                                                            'assign-permissions',
                                                        ) && (role.name !== 'admin') && (
                                                            <button
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/settings/roles/${role.id}/permissions`,
                                                                    )
                                                                }
                                                                className="bg-indigo-500 text-white px-2 py-1 ml-2 rounded">
                                                                Permissions
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal for Add/Edit using Formik */}
                    {showModal && (
                        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
                                {/* Close button top-right */}
                                <button
                                    onClick={() => {
                                        setShowModal(false)
                                        resetForm()
                                    }}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                                    &times;
                                </button>

                                <h2 className="text-lg font-bold mb-4">
                                    {isEditMode ? 'Edit Role' : 'Add New Role'}
                                </h2>

                                <form onSubmit={formik.handleSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.name}
                                            className="mt-1 p-2 border-gray-300 rounded w-full"
                                            required
                                        />
                                        {formik.touched.name &&
                                            formik.errors.name && (
                                                <div className="text-red-500 text-sm">
                                                    {formik.errors.name}
                                                </div>
                                            )}
                                    </div>


                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false)
                                                resetForm()
                                            }}
                                            className="bg-gray-500 text-white px-4 py-2 rounded">
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-green-500 text-white px-4 py-2 rounded">
                                            {isEditMode ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
