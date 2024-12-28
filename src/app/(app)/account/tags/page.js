'use client'
import axios from '@/lib/axios'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Header from '../../Header'

export default function TagsPage() {
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentId, setCurrentId] = useState(null)

    const fetchTags = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/api/tag')
            setTags(response.data)
        } catch (error) {
            toast.error('Failed to load tags')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTags()
    }, [])

    const validationSchema = Yup.object({
        title: Yup.string().required('Title is required'),
        color: Yup.string()
            .matches(
                /^#([0-9A-F]{3}){1,2}$/i,
                'Enter a valid hex color, e.g. #FFF or #FFFFFF',
            )
            .required('Color is required'),
        background: Yup.string()
            .matches(
                /^#([0-9A-F]{3}){1,2}$/i,
                'Enter a valid hex color, e.g. #FFF or #FFFFFF',
            )
            .required('Background is required'),
    })

    const formik = useFormik({
        initialValues: {
            title: '',
            color: '',
            background: '',
        },
        validationSchema,
        onSubmit: async values => {
            try {
                if (isEditMode && currentId) {
                    await axios.put(`/api/tag/${currentId}`, values)
                    toast.success('Tag updated successfully')
                } else {
                    await axios.post('/api/tag', values)
                    toast.success('Tag created successfully')
                }
                fetchTags()
                setShowModal(false)
                resetForm()
            } catch (error) {
                toast.error('Failed to save tag')
            }
        },
    })

    const resetForm = () => {
        formik.resetForm()
        setIsEditMode(false)
        setCurrentId(null)
    }

    const handleEdit = tag => {
        setIsEditMode(true)
        setCurrentId(tag.id)
        formik.setValues({
            title: tag.title || '',
            color: tag.color || '',
            background: tag.background || '',
        })
        setShowModal(true)
    }

    const handleDelete = async id => {
        if (confirm('Are you sure you want to delete this tag?')) {
            try {
                await axios.delete(`/api/tag/${id}`)
                toast.success('Tag deleted successfully')
                fetchTags()
            } catch (error) {
                toast.error('Failed to delete tag')
            }
        }
    }

    return (
        <>
            <Header title="Tags" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-start items-center pb-6 space-x-4">
                        <button
                            onClick={() => {
                                resetForm()
                                setShowModal(true)
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
                            Add New Tag
                        </button>
                    </div>
                    <Toaster />

                    {/* Tags Table */}
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="bg-white border-b border-gray-200">
                                <div className="relative overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200" id="entries_table">
                                        <thead className="bg-gray-50">
                                            <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                    Title
                                                </th>
                                                <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                    Color
                                                </th>
                                                <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                    Background
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
                                            {tags.map(tag => (
                                                <tr key={tag.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {tag.title}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {tag.color}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {tag.background}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(tag)
                                                            }
                                                            className="bg-yellow-500 text-white px-2 py-1 rounded">
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    tag.id,
                                                                )
                                                            }
                                                            className="bg-red-500 text-white px-2 py-1 ml-2 rounded">
                                                            Delete
                                                        </button>
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
                                    {isEditMode ? 'Edit Tag' : 'Add New Tag'}
                                </h2>

                                <form onSubmit={formik.handleSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.title}
                                            className="mt-1 p-2 border-gray-300 rounded w-full"
                                            required
                                        />
                                        {formik.touched.title &&
                                            formik.errors.title && (
                                                <div className="text-red-500 text-sm">
                                                    {formik.errors.title}
                                                </div>
                                            )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">
                                            Color (Hex)
                                        </label>
                                        <input
                                            type="text"
                                            name="color"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.color}
                                            className="mt-1 p-2 border-gray-300 rounded w-full"
                                            required
                                        />
                                        {formik.touched.color &&
                                            formik.errors.color && (
                                                <div className="text-red-500 text-sm">
                                                    {formik.errors.color}
                                                </div>
                                            )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-1">
                                            Background (Hex)
                                        </label>
                                        <input
                                            type="text"
                                            name="background"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.background}
                                            className="mt-1 p-2 border-gray-300 rounded w-full"
                                            required
                                        />
                                        {formik.touched.background &&
                                            formik.errors.background && (
                                                <div className="text-red-500 text-sm">
                                                    {formik.errors.background}
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
