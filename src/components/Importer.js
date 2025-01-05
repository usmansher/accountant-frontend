'use client'
import React, { useState } from 'react'
import Papa from 'papaparse'
import axios from '@/lib/axios'

// Reusable row component for mapping
const MappingRow = ({ label, value, headers, onChange }) => {
    return (
        <tr>
            <td className="p-2 border">{label}</td>
            <td className="p-2 border">
                <select
                    className="border rounded p-1 w-full"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                >
                    <option value="">-- Select CSV Column --</option>
                    {headers.map(header => (
                        <option key={header} value={header}>
                            {header}
                        </option>
                    ))}
                </select>
            </td>
        </tr>
    )
}

// Editable Items Table
const ItemsTable = ({ entry, onUpdateEntry }) => {
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...entry.items]
        updatedItems[index][field] = value
        onUpdateEntry({ ...entry, items: updatedItems })
    }

    const handleAddItem = () => {
        onUpdateEntry({
            ...entry,
            items: [
                ...entry.items,
                {
                    ledger_code: '',
                    dc: '',
                    amount: '',
                    item_narration: '',
                    item_reconciliation_date: '',
                },
            ],
        })
    }

    return (
        <div className="border rounded p-4 mb-4 mt-2 bg-gray-50">
            <table className="w-full border-collapse mb-2">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">Ledger Code</th>
                        <th className="p-2 border">DC</th>
                        <th className="p-2 border">Amount</th>
                        <th className="p-2 border">Item Narration</th>
                        <th className="p-2 border">Reconciliation Date</th>
                    </tr>
                </thead>
                <tbody>
                    {entry.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="p-2 border">
                                <input
                                    className="border rounded p-1 w-full"
                                    value={item.ledger_code}
                                    onChange={e =>
                                        handleItemChange(idx, 'ledger_code', e.target.value)
                                    }
                                />
                            </td>
                            <td className="p-2 border">
                                <select
                                    className="border rounded p-1 w-full"
                                    value={item.dc}
                                    onChange={e => handleItemChange(idx, 'dc', e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="D">D</option>
                                    <option value="C">C</option>
                                </select>
                            </td>
                            <td className="p-2 border">
                                <input
                                    className="border rounded p-1 w-full"
                                    type="number"
                                    value={item.amount}
                                    onChange={e =>
                                        handleItemChange(idx, 'amount', e.target.value)
                                    }
                                />
                            </td>
                            <td className="p-2 border">
                                <input
                                    className="border rounded p-1 w-full"
                                    value={item.item_narration}
                                    onChange={e =>
                                        handleItemChange(idx, 'item_narration', e.target.value)
                                    }
                                />
                            </td>
                            <td className="p-2 border">
                                <input
                                    className="border rounded p-1 w-full"
                                    value={item.item_reconciliation_date}
                                    onChange={e =>
                                        handleItemChange(idx, 'item_reconciliation_date', e.target.value)
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                onClick={handleAddItem}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
            >
                + Add New Item
            </button>
        </div>
    )
}

const Importer = () => {
    const [activeStep, setActiveStep] = useState(1)
    const [csvData, setCsvData] = useState([])
    const [headers, setHeaders] = useState([])

    // For field mapping
    const [fieldMapping, setFieldMapping] = useState({
        entry_number: '',
        entry_date: '',
        entry_type_id: '',
        tag_id: '',
        entry_narration: '',
        ledger_code: '',
        dc: '',
        amount: '',
        item_narration: '',
        item_reconciliation_date: '',
    })

    const [feedback, setFeedback] = useState(null)
    const [uploading, setUploading] = useState(false)

    // Structured data for step 3 (editable)
    const [entriesData, setEntriesData] = useState([])

    // Step indicator (simple version; replace with a Flowbite Stepper if desired)
    const steps = [
        { id: 1, name: 'Upload CSV' },
        { id: 2, name: 'Map Fields' },
        { id: 3, name: 'Preview & Edit' },
    ]

    const goToNextStep = () => setActiveStep(prev => prev + 1)
    const goToPrevStep = () => setActiveStep(prev => prev - 1)

    // -------------- Step 1: Sample CSV Download & File Upload ---------------
    const handleDownloadSample = () => {
        const sampleData = [
            {
                entry_number: '1001',
                entry_date: '1/5/25',
                entry_type_id: 'receipt',
                tag_id: 'TAG-123',
                entry_narration: 'Sale to customer',
                ledger_code: 'LEDGER-101',
                dc: 'D',
                amount: '500',
                item_narration: 'Cash side',
                item_reconciliation_date: '',
            },
            {
                entry_number: '1001',
                entry_date: '1/5/25',
                entry_type_id: 'receipt',
                tag_id: 'TAG-123',
                entry_narration: 'Sale to customer',
                ledger_code: 'LEDGER-202',
                dc: 'C',
                amount: '500',
                item_narration: 'Revenue side',
                item_reconciliation_date: '',
            },
            {
                entry_number: '1002',
                entry_date: '1/6/25',
                entry_type_id: 'receipt',
                tag_id: '',
                entry_narration: 'Office supplies',
                ledger_code: 'LEDGER-555',
                dc: 'D',
                amount: '200',
                item_narration: 'Stationery item',
                item_reconciliation_date: '2/1/25',
            },
        ]

        const csv = Papa.unparse(sampleData)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'sample_entries.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleFileUpload = e => {
        setFeedback(null)

        const file = e.target.files[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                setCsvData(results.data)
                setHeaders(results.meta.fields)

                // Auto-match identical columns
                const autoMapped = {}
                results.meta.fields.forEach(header => {
                    // If the header name is exactly one of our fieldMapping keys,
                    // set fieldMapping[header] = header automatically
                    if (Object.prototype.hasOwnProperty.call(fieldMapping, header)) {
                        autoMapped[header] = header
                    }
                })

                setFieldMapping(prev => ({
                    ...prev,
                    ...autoMapped,
                }))

                // Go to next step (Mapping)
                setActiveStep(2)
            },
            error: function () {
                setFeedback({
                    type: 'error',
                    message: 'Error parsing CSV file.',
                })
            },
        })
    }

    // -------------- Step 2: Field Mapping ---------------
    const handleMappingChange = (dbField, csvField) => {
        setFieldMapping(prev => ({
            ...prev,
            [dbField]: csvField,
        }))
    }

    const handleProceedToPreview = () => {
        // Validate that required mappings are present
        const requiredFields = ['entry_date', 'entry_type_id', 'ledger_code', 'dc', 'amount']
        for (let field of requiredFields) {
            if (!fieldMapping[field]) {
                setFeedback({
                    type: 'error',
                    message: `Please map the required field: ${field}`,
                })
                return
            }
        }

        // Group CSV into structured data
        const entriesMap = {}
        csvData.forEach(row => {
            const entryRef = row[fieldMapping.entry_number] || generateUUID()

            if (!entriesMap[entryRef]) {
                entriesMap[entryRef] = {
                    entry_number: row[fieldMapping.entry_number] || '',
                    entry_date: row[fieldMapping.entry_date] || '',
                    entry_type_id: row[fieldMapping.entry_type_id] || '',
                    tag_id: row[fieldMapping.tag_id] || '',
                    entry_narration: row[fieldMapping.entry_narration] || '',
                    items: [],
                }
            }

            entriesMap[entryRef].items.push({
                ledger_code: row[fieldMapping.ledger_code] || '',
                dc: row[fieldMapping.dc] || '',
                amount: row[fieldMapping.amount] || '',
                item_narration: row[fieldMapping.item_narration] || '',
                item_reconciliation_date: row[fieldMapping.item_reconciliation_date] || '',
            })
        })

        const structuredData = Object.values(entriesMap)
        setEntriesData(structuredData)
        setFeedback(null)
        // Next step: preview & edit
        goToNextStep()
    }

    // -------------- Step 3: Preview & Edit ---------------
    const handleUpdateEntry = (index, updatedEntry) => {
        const newData = [...entriesData]
        newData[index] = updatedEntry
        setEntriesData(newData)
    }

    const handleSubmit = async () => {
        setUploading(true)
        setFeedback(null)

        try {
            // Send the data to the backend
            const response = await axios.post('/api/importer/entries', {
                data: entriesData,
            })

            if (response.data.success) {
                setFeedback({
                    type: 'success',
                    message: 'Data imported successfully!',
                })
                // Reset everything
                setActiveStep(1)
                setCsvData([])
                setHeaders([])
                setFieldMapping({
                    entry_number: '',
                    entry_date: '',
                    entry_type_id: '',
                    tag_id: '',
                    entry_narration: '',
                    ledger_code: '',
                    dc: '',
                    amount: '',
                    item_narration: '',
                    item_reconciliation_date: '',
                })
                setEntriesData([])
            } else {
                setFeedback({
                    type: 'error',
                    message: response.data.message || 'Import failed.',
                })
            }
        } catch (error) {
            console.error('Import error:', error)
            setFeedback({
                type: 'error',
                message: 'An error occurred during import.',
            })
        } finally {
            setUploading(false)
        }
    }

    // Utility function to generate a simple UUID
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }

    // Renders the step's content
    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Step 1: Upload CSV</h2>
                        <div className="flex items-center mb-4">
                            <button
                                onClick={handleDownloadSample}
                                className="mr-4 px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Download Sample CSV
                            </button>
                            <input type="file" accept=".csv" onChange={handleFileUpload} />
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Step 2: Map Fields</h2>
                        <table className="border-collapse w-full mb-4">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 border">Database Field</th>
                                    <th className="p-2 border">CSV Column</th>
                                </tr>
                            </thead>
                            <tbody>
                                <MappingRow
                                    label="entry_number (Optional)"
                                    value={fieldMapping.entry_number}
                                    headers={headers}
                                    onChange={val => handleMappingChange('entry_number', val)}
                                />
                                <MappingRow
                                    label="entry_date *"
                                    value={fieldMapping.entry_date}
                                    headers={headers}
                                    onChange={val => handleMappingChange('entry_date', val)}
                                />
                                <MappingRow
                                    label="entry_type_id *"
                                    value={fieldMapping.entry_type_id}
                                    headers={headers}
                                    onChange={val => handleMappingChange('entry_type_id', val)}
                                />
                                <MappingRow
                                    label="tag_id (Optional)"
                                    value={fieldMapping.tag_id}
                                    headers={headers}
                                    onChange={val => handleMappingChange('tag_id', val)}
                                />
                                <MappingRow
                                    label="entry_narration (Optional)"
                                    value={fieldMapping.entry_narration}
                                    headers={headers}
                                    onChange={val =>
                                        handleMappingChange('entry_narration', val)
                                    }
                                />
                                <MappingRow
                                    label="ledger_code *"
                                    value={fieldMapping.ledger_code}
                                    headers={headers}
                                    onChange={val => handleMappingChange('ledger_code', val)}
                                />
                                <MappingRow
                                    label="dc * (D or C)"
                                    value={fieldMapping.dc}
                                    headers={headers}
                                    onChange={val => handleMappingChange('dc', val)}
                                />
                                <MappingRow
                                    label="amount *"
                                    value={fieldMapping.amount}
                                    headers={headers}
                                    onChange={val => handleMappingChange('amount', val)}
                                />
                                <MappingRow
                                    label="item_narration (Optional)"
                                    value={fieldMapping.item_narration}
                                    headers={headers}
                                    onChange={val =>
                                        handleMappingChange('item_narration', val)
                                    }
                                />
                                <MappingRow
                                    label="item_reconciliation_date (Optional)"
                                    value={fieldMapping.item_reconciliation_date}
                                    headers={headers}
                                    onChange={val =>
                                        handleMappingChange('item_reconciliation_date', val)
                                    }
                                />
                            </tbody>
                        </table>

                        <div className="flex">
                            <button
                                onClick={goToPrevStep}
                                className="px-4 py-2 bg-gray-200 rounded mr-4"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleProceedToPreview}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Proceed to Preview
                            </button>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Step 3: Preview & Edit</h2>
                        <p className="mb-2 text-gray-600">
                            Below is the grouped data. You can edit, add items, or remove items
                            if needed before importing.
                        </p>
                        {entriesData.map((entry, index) => (
                            <div key={index} className="mb-4">
                                {/* Entry Info */}
                                <div className="bg-white border rounded p-4">
                                    <h3 className="text-lg font-semibold mb-2">
                                        Entry #{entry.entry_number || 'N/A'}
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
                                        <div>
                                            <label className="block text-sm text-gray-600">
                                                Entry Date
                                            </label>
                                            <input
                                                className="border rounded p-1 w-full"
                                                value={entry.entry_date}
                                                onChange={e =>
                                                    handleUpdateEntry(index, {
                                                        ...entry,
                                                        entry_date: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600">
                                                Entry Type
                                            </label>
                                            <input
                                                className="border rounded p-1 w-full"
                                                value={entry.entry_type_id}
                                                onChange={e =>
                                                    handleUpdateEntry(index, {
                                                        ...entry,
                                                        entry_type_id: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600">
                                                Tag
                                            </label>
                                            <input
                                                className="border rounded p-1 w-full"
                                                value={entry.tag_id}
                                                onChange={e =>
                                                    handleUpdateEntry(index, {
                                                        ...entry,
                                                        tag_id: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600">
                                                Narration
                                            </label>
                                            <input
                                                className="border rounded p-1 w-full"
                                                value={entry.entry_narration}
                                                onChange={e =>
                                                    handleUpdateEntry(index, {
                                                        ...entry,
                                                        entry_narration: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Items (Nested Table) */}
                                    <ItemsTable
                                        entry={entry}
                                        onUpdateEntry={updatedEntry =>
                                            handleUpdateEntry(index, updatedEntry)
                                        }
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex">
                            <button
                                onClick={goToPrevStep}
                                className="px-4 py-2 bg-gray-200 rounded mr-4"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={uploading}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                {uploading ? 'Importing...' : 'Import'}
                            </button>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="max-w-5xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Import Entries (CSV)</h1>

            {/* Simple Step Indicator */}
            <div className="flex items-center mb-8">
                {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                                activeStep >= step.id ? 'bg-blue-600' : 'bg-gray-400'
                            }`}
                        >
                            {step.id}
                        </div>
                        <span
                            className={`ml-2 text-sm ${
                                activeStep >= step.id ? 'text-blue-600 font-semibold' : ''
                            }`}
                        >
                            {step.name}
                        </span>
                        {idx < steps.length - 1 && (
                            <div className="flex-auto border-t-2 mx-4 border-gray-300" />
                        )}
                    </div>
                ))}
            </div>

            {/* Render the current step */}
            {renderStepContent()}

            {/* Feedback */}
            {feedback && (
                <div
                    className={`mt-4 p-4 rounded ${
                        feedback.type === 'success' ? 'bg-green-100 text-green-700' : ''
                    } ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : ''}`}
                >
                    {feedback.message}
                </div>
            )}
        </div>
    )
}

export default Importer
