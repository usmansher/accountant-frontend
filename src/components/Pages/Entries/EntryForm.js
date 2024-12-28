import React, { useState, useEffect } from 'react'
import { Formik, Field, Form, FieldArray } from 'formik'
import * as Yup from 'yup'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import 'react-datepicker/dist/react-datepicker.css'
import { useParams } from 'next/navigation'
import Totals from './Totals'
import axios from '@/lib/axios'

const EntryForm = ({ entrytype }) => {
    const [, setEntryType] = useState(entrytype)
    const { id } = useParams()

    const [ledgerOptions, setLedgerOptions] = useState([])
    const [tagOptions, setTagOptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [initialValues, setInitialValues] = useState({
        number: '',
        date: new Date(),
        tag: null,
        items: [],
        notes: '',
        newEntry: {
            dc: 'D',
            ledger: null,
            amount: '',
            narration: '',
        },
    })

    const decimalPlaces = 2

    // Fetch ledger options
    const fetchLedgerOptions = async () => {
        try {
            const response = await axios.get('/api/ledger-list', {
                params: {
                    restriction_bankcash: entrytype?.restriction_bankcash,
                },
            })
            // Transform ledger data to {value, label} format
            const options = response.data.map(ledger => ({
                value: ledger.id,
                label: ledger.name,
                isDisabled: ledger.disabled,
            }))
            setLedgerOptions(options)
        } catch (error) {
            console.error('Error fetching ledger list:', error)
        }
    }

    // Fetch tag options
    const fetchTagOptions = async () => {
        try {
            const response = await axios.get('/api/tag')
            const data = response.data
            // Transform tag data to {value, label} format
            const options = data.map(tag => ({
                value: tag.id,
                label: tag.title,
            }))
            setTagOptions(options)
        } catch (error) {
            console.error('Error fetching tag list:', error)
        }
    }

    const fetchEntryData = async entryId => {
        try {
            const response = await axios.get(`/api/entry/${entryId}`)
            const data = response.data

            setEntryType(data.entry_type)
            setInitialValues({
                number: data.number,
                date: new Date(data.date),
                tag: tagOptions.find(tag => tag.value === data.tag_id) || null,
                items: data.items.map(entry => ({
                    dc: entry.dc,
                    ledger: ledgerOptions.find(
                        ledger => ledger.value === entry.ledger_id,
                    ) || {
                        value: entry.ledger_id,
                        label: entry.ledger_name,
                    },
                    amount: entry.amount,
                    narration: entry.narration,
                })),
                notes: data.notes,
                newEntry: {
                    dc: 'D',
                    ledger: null,
                    amount: '',
                    narration: '',
                },
            })
        } catch (error) {
            console.error('Error fetching entry data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch ledger and tag options on mount
    useEffect(() => {
        const fetchData = async () => {
            await fetchLedgerOptions()
            await fetchTagOptions()
            // If no id, we can stop loading here
            if (!id) {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    // Once ledgerOptions and tagOptions are loaded, and if we have an id, fetch the entry data
    useEffect(() => {
        if (id && ledgerOptions.length > 0 && tagOptions.length > 0) {
            fetchEntryData(id)
        }
    }, [id, ledgerOptions, tagOptions])

    // Validation schema
    const validationSchema = Yup.object().shape({
        number: Yup.string().required('Number is required'),
        date: Yup.date().required('Date is required'),
        tag: Yup.object().required('Tag is required'),
        items: Yup.array()
            .of(
                Yup.object().shape({
                    dc: Yup.string().required('Required'),
                    ledger: Yup.object().required('Required'),
                    amount: Yup.number()
                        .required('Required')
                        .positive('Must be positive'),
                    narration: Yup.string(),
                }),
            )
            .min(1, 'At least one entry is required'),
    })

    if (loading || !entrytype) {
        return <div className="container mx-auto p-4">Loading...</div>
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                {id ? 'Edit Entry' : 'Add Entry'}
            </h1>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async values => {
                    const payload = {
                        number: values.number,
                        date: values.date.toISOString().split('T')[0],
                        tag_id: values.tag.value,
                        items: values.items.map(entry => ({
                            dc: entry.dc,
                            ledger_id: entry.ledger.value,
                            amount: parseFloat(entry.amount),
                            narration: entry.narration,
                        })),
                        notes: values.notes,
                    }

                    try {
                        if (id) {
                            await axios.put(`/api/entry/${id}`, payload)
                            alert('Entry updated successfully!')
                        } else {
                            await axios.post('/api/entry', payload)
                            alert('Entry created successfully!')
                        }
                        // router.push('/items') // Uncomment when ready to redirect
                    } catch (error) {
                        console.error('Error submitting form:', error)
                        alert('An error occurred while submitting the form.')
                    }
                }}>
                {({ values, setFieldValue, errors, touched }) => {
                    const addNewEntry = () => {
                        if (
                            values.newEntry.dc &&
                            values.newEntry.ledger &&
                            values.newEntry.amount
                        ) {
                            setFieldValue('items', [
                                ...values.items,
                                values.newEntry,
                            ])
                            const lastDc = values.newEntry.dc
                            const nextDc = lastDc === 'D' ? 'C' : 'D'
                            setFieldValue('newEntry', {
                                dc: nextDc,
                                ledger: null,
                                amount: '',
                                narration: '',
                            })
                        } else {
                            alert(
                                'Please fill in all required fields for the new entry.',
                            )
                        }
                    }

                    return (
                        <Form
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                }
                            }}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Number
                                    </label>
                                    <Field
                                        name="number"
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                    {errors.number && touched.number && (
                                        <div className="text-red-500 text-sm">
                                            {errors.number}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>
                                    <DatePicker
                                        selected={values.date}
                                        onChange={date =>
                                            setFieldValue('date', date)
                                        }
                                        dateFormat="yyyy-MM-dd"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                    {errors.date && touched.date && (
                                        <div className="text-red-500 text-sm">
                                            {errors.date}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tag
                                    </label>
                                    <Select
                                        options={tagOptions}
                                        name="tag"
                                        value={values.tag}
                                        onChange={option =>
                                            setFieldValue('tag', option)
                                        }
                                        className="mt-1"
                                    />
                                    {errors.tag && touched.tag && (
                                        <div className="text-red-500 text-sm">
                                            {errors.tag}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <h2 className="text-xl font-bold mb-2">
                                    Add Entry
                                </h2>
                                <div
                                    className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            addNewEntry()
                                        }
                                    }}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Debit/Credit
                                        </label>
                                        <Field
                                            as="select"
                                            name="newEntry.dc"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                            <option value="D">Debit</option>
                                            <option value="C">Credit</option>
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ledger
                                        </label>
                                        <Select
                                            options={ledgerOptions}
                                            name="newEntry.ledger"
                                            value={values.newEntry.ledger}
                                            onChange={option =>
                                                setFieldValue(
                                                    'newEntry.ledger',
                                                    option,
                                                )
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Amount
                                        </label>
                                        <Field
                                            name="newEntry.amount"
                                            type="number"
                                            step="0.01"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Narration
                                        </label>
                                        <Field
                                            name="newEntry.narration"
                                            type="text"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            className="mt-1 bg-blue-500 text-white px-4 py-2 rounded-md"
                                            onClick={addNewEntry}>
                                            Add Entry
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h2 className="text-xl font-bold mb-2">
                                    Items
                                </h2>
                                <FieldArray name="items">
                                    {({ remove }) => (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        DC
                                                    </th>
                                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Ledger
                                                    </th>
                                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Narration
                                                    </th>
                                                    <th className="px-2 py-1" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {values.items.length > 0 &&
                                                    values.items.map(
                                                        (entry, index) => (
                                                            <tr key={index}>
                                                                <td className="px-2 py-1">
                                                                    <Field
                                                                        as="select"
                                                                        name={`items.${index}.dc`}
                                                                        className="block w-full border border-gray-300 rounded-md shadow-sm p-1">
                                                                        <option value="D">
                                                                            Debit
                                                                        </option>
                                                                        <option value="C">
                                                                            Credit
                                                                        </option>
                                                                    </Field>
                                                                </td>
                                                                <td className="px-2 py-1">
                                                                    <Select
                                                                        options={
                                                                            ledgerOptions
                                                                        }
                                                                        name={`items.${index}.ledger`}
                                                                        value={
                                                                            entry.ledger
                                                                        }
                                                                        onChange={option =>
                                                                            setFieldValue(
                                                                                `items.${index}.ledger`,
                                                                                option,
                                                                            )
                                                                        }
                                                                        className="mt-1"
                                                                    />
                                                                </td>
                                                                <td className="px-2 py-1">
                                                                    <Field
                                                                        name={`items.${index}.amount`}
                                                                        type="number"
                                                                        step="0.01"
                                                                        className="block w-full border border-gray-300 rounded-md shadow-sm p-1"
                                                                    />
                                                                </td>
                                                                <td className="px-2 py-1">
                                                                    <Field
                                                                        name={`items.${index}.narration`}
                                                                        type="text"
                                                                        className="block w-full border border-gray-300 rounded-md shadow-sm p-1"
                                                                    />
                                                                </td>
                                                                <td className="px-2 py-1">
                                                                    <button
                                                                        type="button"
                                                                        className="bg-red-500 text-white px-2 py-1 rounded-md"
                                                                        onClick={() =>
                                                                            remove(
                                                                                index,
                                                                            )
                                                                        }>
                                                                        Remove
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                            </tbody>
                                        </table>
                                    )}
                                </FieldArray>
                            </div>

                            <Totals
                                items={values.items}
                                decimalPlaces={decimalPlaces}
                            />

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700">
                                    Notes
                                </label>
                                <Field
                                    as="textarea"
                                    name="notes"
                                    rows="3"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-4 py-2 rounded-md">
                                    {id ? 'Update Entry' : 'Submit Entry'}
                                </button>
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </div>
    )
}

export default EntryForm
