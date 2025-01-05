'use client'
import React, { useState } from 'react'
import Papa from 'papaparse'
import axios from '@/lib/axios'

// This function creates & downloads a sample CSV
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

const Importer = () => {
    const [csvData, setCsvData] = useState([])
    const [headers, setHeaders] = useState([])
    const [fieldMapping, setFieldMapping] = useState({
        // Fields for your simpler CSV
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
    const [isMapped, setIsMapped] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [feedback, setFeedback] = useState(null)

    // Handle file upload and parsing
    const handleFileUpload = e => {
        const file = e.target.files[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                setCsvData(results.data)
                setHeaders(results.meta.fields)
                setIsMapped(false)
            
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
            
                setFeedback(null)
            },
            error: function () {
                setFeedback({
                    type: 'error',
                    message: 'Error parsing CSV file.',
                })
            },
        })
    }

    // Handle field mapping changes
    const handleMappingChange = (dbField, csvField) => {
        setFieldMapping(prev => ({
            ...prev,
            [dbField]: csvField,
        }))
    }

    // Submit mapped data to backend
    const handleSubmit = async () => {
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

        setUploading(true)
        setFeedback(null)

        try {
            // Prepare the data by grouping items under each entry (by entry_number)
            const entriesMap = {}

            csvData.forEach(row => {
                const entryRef = row[fieldMapping.entry_number] || generateUUID()

                if (!entriesMap[entryRef]) {
                    entriesMap[entryRef] = {
                        entry_number: row[fieldMapping.entry_number] || null,
                        entry_date: row[fieldMapping.entry_date],
                        entry_type_id: row[fieldMapping.entry_type_id],
                        tag_id: row[fieldMapping.tag_id] || null,
                        entry_narration: row[fieldMapping.entry_narration] || null,
                        items: [],
                    }
                }

                entriesMap[entryRef].items.push({
                    ledger_code: row[fieldMapping.ledger_code],
                    dc: row[fieldMapping.dc],
                    amount: row[fieldMapping.amount],
                    item_narration: row[fieldMapping.item_narration] || null,
                    item_reconciliation_date:
                        row[fieldMapping.item_reconciliation_date] || null,
                })
            })

            // Convert the map to an array
            const structuredData = Object.values(entriesMap)

            // Send the data to the backend
            const response = await axios.post('/api/importer/entries', {
                data: structuredData,
            })

            if (response.data.success) {
                setFeedback({
                    type: 'success',
                    message: 'Data imported successfully!',
                })
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
                setIsMapped(false)
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

    return (
        <div className="importer">
            <h2>Import Entries (CSV)</h2>

            {/* Download Sample CSV Button */}
            <button onClick={handleDownloadSample} className="download-sample">
                Download Sample CSV
            </button>

            <input type="file" accept=".csv" onChange={handleFileUpload} />

            {csvData.length > 0 && (
                <div className="mapping-section">
                    <h3>Map CSV Columns to Database Fields</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Database Field</th>
                                <th>CSV Column</th>
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
                                onChange={val => handleMappingChange('entry_narration', val)}
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
                    <button onClick={() => setIsMapped(true)}>Proceed to Import</button>
                </div>
            )}

            {isMapped && (
                <div className="preview-section">
                    <h3>Preview First 5 Rows</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>entry_number</th>
                                <th>entry_date</th>
                                <th>entry_type_id</th>
                                <th>tag_id</th>
                                <th>entry_narration</th>
                                <th>ledger_code</th>
                                <th>dc</th>
                                <th>amount</th>
                                <th>item_narration</th>
                                <th>item_reconciliation_date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {csvData.slice(0, 5).map((row, index) => (
                                <tr key={index}>
                                    <td>{row[fieldMapping.entry_number] || ''}</td>
                                    <td>{row[fieldMapping.entry_date] || ''}</td>
                                    <td>{row[fieldMapping.entry_type_id] || ''}</td>
                                    <td>{row[fieldMapping.tag_id] || ''}</td>
                                    <td>{row[fieldMapping.entry_narration] || ''}</td>
                                    <td>{row[fieldMapping.ledger_code] || ''}</td>
                                    <td>{row[fieldMapping.dc] || ''}</td>
                                    <td>{row[fieldMapping.amount] || ''}</td>
                                    <td>{row[fieldMapping.item_narration] || ''}</td>
                                    <td>
                                        {row[fieldMapping.item_reconciliation_date] || ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={handleSubmit} disabled={uploading}>
                        {uploading ? 'Importing...' : 'Start Import'}
                    </button>
                </div>
            )}

            {feedback && (
                <div className={`feedback ${feedback.type}`}>
                    {feedback.message}
                </div>
            )}

            <style>{`
                .importer {
                    padding: 20px;
                    max-width: 1200px;
                    margin: auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 8px;
                    text-align: left;
                }
                .feedback {
                    padding: 10px;
                    margin-top: 20px;
                    border-radius: 4px;
                }
                .feedback.success {
                    background-color: #d4edda;
                    color: #155724;
                }
                .feedback.error {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                .download-sample {
                    margin-right: 20px;
                    padding: 10px 20px;
                    background-color: #0070f3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .download-sample:hover {
                    background-color: #005bb5;
                }
                .mapping-section, .preview-section {
                    margin-top: 20px;
                }
            `}</style>
        </div>
    )
}

// Reusable row component for mapping
const MappingRow = ({ label, value, headers, onChange }) => {
    return (
        <tr>
            <td>{label}</td>
            <td>
                <select value={value} onChange={e => onChange(e.target.value)}>
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

export default Importer
