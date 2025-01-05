'use client'
import axios from '@/lib/axios'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Header from '../../Header'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
    const { hasPermission } = useAuth()
    const router = useRouter()

    if (!hasPermission('list-user')) {
        router.back()
    }

    // States
    const [users, setUsers] = useState([]) // List of all users
    const [roles, setRoles] = useState([]) // For dropdown
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentId, setCurrentId] = useState(null)

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/api/users') 
            setUsers(response.data)
        } catch (error) {
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    // Fetch all roles for the dropdown
    const fetchRoles = async () => {
        try {
            const response = await axios.get('/api/role') 
            setRoles(response.data)
        } catch (error) {
            toast.error('Failed to load roles for dropdown')
        }
    }

    useEffect(() => {
        fetchUsers()
        fetchRoles()
    }, [])

    /**
     * Validation Schema (with conditional logic):
     * - If creating (isEditMode = false):
     *    - email is required
     *    - password is required
     *    - password_confirmation must match password
     * - If editing (isEditMode = true):
     *    - email is NOT required (hidden in UI as well)
     *    - password is optional, but if provided, password_confirmation must match
     */
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),

        // Only required on create
        email: Yup.string().when('isEditMode', {
            is: false, 
            then: (schema) =>
                schema.email('Invalid email').required('Email is required'),
            otherwise: (schema) => schema.notRequired(),
        }),

        // For password: required on create, optional on edit
        password: Yup.string().when('isEditMode', {
            is: false,
            then: (schema) => schema.required('Password is required on create'),
            otherwise: (schema) => schema.notRequired(),
        }),

        // Confirm password only if password is entered
        password_confirmation: Yup.string().when('password', {
            is: (val) => val && val.length > 0,
            then: (schema) =>
                schema
                    .required('Please confirm your password')
                    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
            otherwise: (schema) => schema.notRequired(),
        }),

        role: Yup.string().required('Role is required'),

        // We'll store boolean isEditMode in form state for logic
        isEditMode: Yup.boolean(),
    })

    // Formik
    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: '',
            isEditMode: false,
        },
        validationSchema,
        onSubmit: async values => {
            try {
                if (isEditMode && currentId) {
                    // UPDATE
                    const dataToSend = {
                        name: values.name,
                        role: values.role,
                    }
                    // If user entered a new password, include it
                    if (values.password) {
                        dataToSend.password = values.password
                        dataToSend.password_confirmation = values.password_confirmation
                    }
                    // For edit, we do NOT send email unless you decide to allow editing emails
                    await axios.put(`/api/users/${currentId}`, dataToSend)
                    toast.success('User updated successfully')
                } else {
                    // CREATE
                    await axios.post('/api/users', {
                        name: values.name,
                        email: values.email,
                        password: values.password,
                        password_confirmation: values.password_confirmation,
                        role: values.role,
                    })
                    toast.success('User created successfully')
                }
                fetchUsers()
                setShowModal(false)
                resetForm()
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to save user')
            }
        },
    })

    const resetForm = () => {
        formik.resetForm()
        setIsEditMode(false)
        setCurrentId(null)
        formik.setFieldValue('isEditMode', false)
    }

    const handleEdit = (user) => {
        setIsEditMode(true)
        setCurrentId(user.id)
        formik.setValues({
            name: user.name || '',
            // On edit, we do not show email in the UI or update it
            email: '', 
            password: '',
            password_confirmation: '',
            role: user.role_name || '', 
            isEditMode: true,
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/api/users/${id}`)
                toast.success('User deleted successfully')
                fetchUsers()
            } catch (error) {
                toast.error('Failed to delete user')
            }
        }
    }

    return (
        <>
            <Header title="Users" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-start items-center pb-6 space-x-4">
                        {hasPermission('create-users') && (
                            <button
                                onClick={() => {
                                    resetForm()
                                    setShowModal(true)
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                            >
                                Add New User
                            </button>
                        )}
                    </div>
                    <Toaster />

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="bg-white border-b border-gray-200">
                                <div className="relative overflow-x-auto">
                                    <table
                                        className="min-w-full divide-y divide-gray-200"
                                        id="entries_table"
                                    >
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Name
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Email
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Created At
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Role
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.created_at}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.role_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hasPermission('edit-users') && (
                                                            <button
                                                                onClick={() => handleEdit(user)}
                                                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        {hasPermission('delete-users') && (
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
                                                                className="bg-red-500 text-white px-2 py-1 ml-2 rounded"
                                                            >
                                                                Delete
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

                    {/* Modal for Add/Edit */}
                    {showModal && (
                        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
                                <button
                                    onClick={() => {
                                        setShowModal(false)
                                        resetForm()
                                    }}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                                >
                                    &times;
                                </button>

                                <h2 className="text-lg font-bold mb-4">
                                    {isEditMode ? 'Edit User' : 'Add New User'}
                                </h2>

                                <form onSubmit={formik.handleSubmit}>
                                    {/* Name */}
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
                                        />
                                        {formik.touched.name && formik.errors.name && (
                                            <div className="text-red-500 text-sm">
                                                {formik.errors.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email (only on create) */}
                                    {!isEditMode && (
                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.email}
                                                className="mt-1 p-2 border-gray-300 rounded w-full"
                                            />
                                            {formik.touched.email && formik.errors.email && (
                                                <div className="text-red-500 text-sm">
                                                    {formik.errors.email}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Password & Confirmation (always shown, but optional on edit) */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.password}
                                            className="mt-1 p-2 border-gray-300 rounded w-full"
                                        />
                                        {formik.touched.password && formik.errors.password && (
                                            <div className="text-red-500 text-sm">
                                                {formik.errors.password}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.password_confirmation}
                                            className="mt-1 p-2 border-gray-300 rounded w-full"
                                        />
                                        {formik.touched.password_confirmation &&
                                            formik.errors.password_confirmation && (
                                                <div className="text-red-500 text-sm">
                                                    {formik.errors.password_confirmation}
                                                </div>
                                            )}
                                    </div>

                                    {/* Role dropdown */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.role}
                                            className="mt-1 p-2 border-gray-300 rounded w-full"
                                        >
                                            <option value="">Select a Role</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.name}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formik.touched.role && formik.errors.role && (
                                            <div className="text-red-500 text-sm">
                                                {formik.errors.role}
                                            </div>
                                        )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false)
                                                resetForm()
                                            }}
                                            className="bg-gray-500 text-white px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-green-500 text-white px-4 py-2 rounded"
                                        >
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
