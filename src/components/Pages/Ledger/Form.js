'use client'
// import necessary modules
import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import axios from '@/lib/axios'
import Input from '@/components/Input'
import { useRouter } from 'next/navigation'

const LedgerForm = ({ id }) => {
    const router = useRouter()
    const [parentGroups, setParentGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [initialValues, setInitialValues] = useState({
        name: '',
        code: '',
        group_id: '',
        op_balance_dc: 'D',
        op_balance: '',
        type: false,
        reconciliation: false,
        notes: '',
    })

    // Fetch parent groups and ledger data if editing
    useEffect(() => {
        // Fetch parent groups
        axios
            .get('/api/group/pre-requisite')
            .then(response => {
                setParentGroups(response.data?.parentGroupList || [])
            })
            .catch(error => console.error(error))

        if (id) {
            // Fetch ledger data for editing
            axios
                .get(`/api/ledger/${id}`)
                .then(response => {
                    const ledger = response.data
                    setInitialValues({
                        name: ledger.name || '',
                        code: ledger.code || '',
                        group_id: ledger.group_id || '',
                        op_balance_dc: ledger.op_balance_dc || 'D',
                        op_balance: ledger.op_balance || '',
                        type: ledger.type || false,
                        reconciliation: ledger.reconciliation || false,
                        notes: ledger.notes || '',
                    })
                    setLoading(false)
                })
                .catch(error => {
                    console.error('Error fetching ledger data:', error)
                    setLoading(false)
                })
        } else {
            // If adding a new ledger
            setLoading(false)
        }
    }, [id])

    // Initializing Formik with validation
    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required('Ledger name is required'),
            code: Yup.string().nullable(),
            group_id: Yup.string().required('Parent group is required'),
            op_balance: Yup.number().required('Opening balance is required'),
            op_balance_dc: Yup.string().required(),
            type: Yup.boolean(),
            reconciliation: Yup.boolean(),
            notes: Yup.string().nullable(),
        }),
        onSubmit: async values => {
            try {
                if (id) {
                    // Update existing ledger
                    const response = await axios.put(
                        `/api/ledger/${id}`,
                        values,
                    )
                    console.log('Ledger updated:', response.data)
                } else {
                    // Create new ledger
                    const response = await axios.post('/api/ledger', values)
                    console.log('Ledger created:', response.data)
                }
                // Redirect or show success message
                router.push('/ledgers') // Adjust the route as needed
            } catch (error) {
                console.error('Failed to submit the form', error)
                // Handle error (show error message to user)
            }
        },
    })

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <form onSubmit={formik.handleSubmit} className="ledger-form">
            <div className="mb-4">
                <label className="block text-gray-700">Ledger Name</label>
                <Input
                    type="text"
                    name="name"
                    className="mt-1 p-2 border-gray-300 rounded w-full"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                />
                {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-sm">
                        {formik.errors.name}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">
                    Ledger Code (optional)
                </label>
                <Input
                    type="text"
                    name="code"
                    className="mt-1 p-2 border-gray-300 rounded w-full"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.code && formik.errors.code && (
                    <div className="text-red-500 text-sm">
                        {formik.errors.code}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Parent Group</label>
                <select
                    name="group_id"
                    className="mt-1 p-2 border-gray-300 rounded w-full"
                    value={formik.values.group_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}>
                    <option value="">Select a group</option>
                    {Object.keys(parentGroups)?.map(groupId => (
                        <option key={groupId} value={groupId}>
                            {parentGroups[groupId]}
                        </option>
                    ))}
                </select>
                {formik.touched.group_id && formik.errors.group_id && (
                    <div className="text-red-500 text-sm">
                        {formik.errors.group_id}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Opening Balance</label>
                <div className="flex">
                    <select
                        name="op_balance_dc"
                        className="mr-2 p-2 border-gray-300 rounded min-w-[100px]"
                        value={formik.values.op_balance_dc}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}>
                        <option value="D">Dr</option>
                        <option value="C">Cr</option>
                    </select>
                    <Input
                        type="number"
                        name="op_balance"
                        className="p-2 border-gray-300 rounded w-full"
                        value={formik.values.op_balance}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                </div>
                {formik.touched.op_balance && formik.errors.op_balance && (
                    <div className="text-red-500 text-sm">
                        {formik.errors.op_balance}
                    </div>
                )}
                <span className="text-gray-500 text-sm">
                    Note: Assets / Expenses always have Dr balance and
                    Liabilities / Incomes always have Cr balance.
                </span>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">
                    Bank or Cash Account
                </label>
                <input
                    type="checkbox"
                    name="type"
                    className="mr-2"
                    checked={formik.values.type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                <span className="text-gray-500 text-sm">
                    Note: Select if the ledger account is a bank or a cash
                    account.
                </span>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Reconciliation</label>
                <input
                    type="checkbox"
                    name="reconciliation"
                    className="mr-2"
                    checked={formik.values.reconciliation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                <span className="text-gray-500 text-sm">
                    Note: If selected, the ledger account can be reconciled from
                    Reports &gt; Reconciliation.
                </span>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700">Notes</label>
                <textarea
                    name="notes"
                    rows="3"
                    className="mt-1 p-2 border-gray-300 rounded w-full"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.notes && formik.errors.notes && (
                    <div className="text-red-500 text-sm">
                        {formik.errors.notes}
                    </div>
                )}
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

export default LedgerForm
