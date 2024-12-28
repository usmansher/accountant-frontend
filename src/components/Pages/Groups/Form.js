'use client'
import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import useConfigStore from '@/store/configStore'
import Input from '@/components/Input'
import axios from '@/lib/axios'
import { useRouter } from 'next/navigation'

const GroupForm = ({ id }) => {
    const router = useRouter()
    const config = useConfigStore(state => state.config)
    const [parentGroups, setParentGroups] = useState([])
    const [loading, setLoading] = useState(true) // For loading state
    const [initialValues, setInitialValues] = useState({
        parent_id: '',
        name: '',
        code: '',
    })

    useEffect(() => {
        // Fetch parent groups
        axios.get('/api/group/pre-requisite').then(response => {
            setParentGroups(response.data?.parentGroupList || [])
        })

        if (id) {
            // Fetch group data for editing
            axios
                .get(`/api/group/${id}`)
                .then(response => {
                    const group = response.data
                    setInitialValues({
                        parent_id: group.parent_id || '',
                        name: group.name || '',
                        code: group.code || '',
                    })
                    setLoading(false)
                })
                .catch(error => {
                    console.error('Error fetching group data:', error)
                    setLoading(false)
                })
        } else {
            // If adding a new group
            setLoading(false)
        }
    }, [id])

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true, // Allows Formik to reset when initialValues change
        validationSchema: Yup.object({
            parent_id: Yup.string().nullable(),
            name: Yup.string().required('Required'),
            code: Yup.string().required('Required'),
        }),
        onSubmit: async values => {
            try {
                if (id) {
                    // Update existing group
                    const response = await axios.put(`/api/group/${id}`, values)
                    console.log('Group updated:', response.data)
                } else {
                    // Create new group
                    const response = await axios.post('/api/group', values)
                    console.log('Group created:', response.data)
                }
                // Redirect or show success message
                router.push('/groups') // Adjust the route as needed
            } catch (error) {
                console.error('Error submitting form:', error)
                // Handle error (show error message to user)
            }
        },
    })

    if (loading || !config) {
        return <div>Loading...</div>
    }

    return (
        <form onSubmit={formik.handleSubmit} className="">
            <div className="mb-4">
                <label className="block text-gray-700">Parent Group</label>
                <select
                    name="parent_id"
                    value={formik.values.parent_id}
                    onChange={formik.handleChange}
                    className="mt-1 p-2 border-gray-300 rounded w-full">
                    <option value="">Select Parent Group</option>
                    {Object.keys(parentGroups).map(group_id => (
                        <option key={group_id} value={group_id}>
                            {parentGroups[group_id]}
                        </option>
                    ))}
                </select>
                {formik.touched.parent_id && formik.errors.parent_id ? (
                    <div className="text-red-500 text-sm">
                        {formik.errors.parent_id}
                    </div>
                ) : null}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Group Code</label>
                <Input
                    type="text"
                    name="code"
                    className="mt-1 p-2 border rounded w-full"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                />
                {formik.touched.code && formik.errors.code ? (
                    <div className="text-red-500 text-sm">
                        {formik.errors.code}
                    </div>
                ) : null}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Group Name</label>
                <Input
                    type="text"
                    name="name"
                    className="mt-1 p-2 border rounded w-full"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                />
                {formik.touched.name && formik.errors.name ? (
                    <div className="text-red-500 text-sm">
                        {formik.errors.name}
                    </div>
                ) : null}
            </div>
            <div className="flex items-center">
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded">
                    {id ? 'Update' : 'Submit'}
                </button>
                <span className="ml-2" />
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded">
                    Cancel
                </button>
            </div>
        </form>
    )
}

export default GroupForm
