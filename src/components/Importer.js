'use client';
import React, { useState } from 'react'
import Papa from 'papaparse'
import axios from '@/lib/axios'

const Importer = () => {
    const [csvData, setCsvData] = useState([])
    const [headers, setHeaders] = useState([])
    const [fieldMapping, setFieldMapping] = useState({
        // Entry Fields
        entry_id: '',
        tag_id: '',
        entrytype_id: '',
        number: '',
        date: '',
        dr_total: '',
        cr_total: '',
        narration: '',
        // Entry Item Fields
        ledger_code: '',
        amount: '',
        item_narration: '',
        dc: '',
        reconciliation_date: '',
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
                setFieldMapping({
                    entry_id: '',
                    tag_id: '',
                    entrytype_id: '',
                    number: '',
                    date: '',
                    dr_total: '',
                    cr_total: '',
                    narration: '',
                    ledger_code: '',
                    amount: '',
                    item_narration: '',
                    dc: '',
                    reconciliation_date: '',
                })
                setFeedback(null)
            },
            error: function (error) {
                console.error('Error parsing CSV:', error)
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
        const requiredEntryFields = ['entrytype_id', 'date']
        const requiredItemFields = ['ledger_code', 'amount', 'dc']

        for (let field of requiredEntryFields) {
            if (!fieldMapping[field]) {
                setFeedback({
                    type: 'error',
                    message: `Please map the required entry field: ${field}`,
                })
                return
            }
        }

        for (let field of requiredItemFields) {
            if (!fieldMapping[field]) {
                setFeedback({
                    type: 'error',
                    message: `Please map the required entry item field: ${field}`,
                })
                return
            }
        }

        setUploading(true)
        setFeedback(null)

        try {
            // Prepare the data by grouping entry_items under each entry
            const entriesMap = {}

            csvData.forEach(row => {
                const entryId = row[fieldMapping.entry_id] || generateUUID()
                if (!entriesMap[entryId]) {
                    entriesMap[entryId] = {
                        // Entry Fields
                        id: row[fieldMapping.entry_id] || generateUUID(),
                        tag_id: row[fieldMapping.tag_id] || null,
                        entrytype_id: row[fieldMapping.entrytype_id],
                        number: row[fieldMapping.number] || null,
                        date: row[fieldMapping.date],
                        dr_total: row[fieldMapping.dr_total] || 0.0,
                        cr_total: row[fieldMapping.cr_total] || 0.0,
                        narration: row[fieldMapping.narration] || null,
                        // Entry Items
                        entry_items: [],
                    }
                }

                // Add entry item
                entriesMap[entryId].entry_items.push({
                    id: generateUUID(),
                    ledger_code: row[fieldMapping.ledger_code],
                    amount: row[fieldMapping.amount],
                    narration: row[fieldMapping.item_narration] || null,
                    dc: row[fieldMapping.dc],
                    reconciliation_date:
                        row[fieldMapping.reconciliation_date] || null,
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
                    entry_id: '',
                    tag_id: '',
                    entrytype_id: '',
                    number: '',
                    date: '',
                    dr_total: '',
                    cr_total: '',
                    narration: '',
                    ledger_code: '',
                    amount: '',
                    item_narration: '',
                    dc: '',
                    reconciliation_date: '',
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

    // Utility function to generate UUID (if needed)
    const generateUUID = () => {
        // Simple UUID generator (for demonstration purposes)
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0,
                    v = c === 'x' ? r : (r & 0x3) | 0x8
                return v.toString(16)
            },
        )
    }

    return (
        <div className="importer">
            <h2>Import Entries with Entry Items CSV</h2>
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
                            {/* Entry Fields */}
                            <tr>
                                <td>entry_id (Optional)</td>
                                <td>
                                    <select
                                        value={fieldMapping.entry_id}
                                        onChange={e =>
                                            handleMappingChange(
                                                'entry_id',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>tag_id (Nullable)</td>
                                <td>
                                    <select
                                        value={fieldMapping.tag_id}
                                        onChange={e =>
                                            handleMappingChange(
                                                'tag_id',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>entrytype_id *</td>
                                <td>
                                    <select
                                        value={fieldMapping.entrytype_id}
                                        onChange={e =>
                                            handleMappingChange(
                                                'entrytype_id',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>number (Nullable)</td>
                                <td>
                                    <select
                                        value={fieldMapping.number}
                                        onChange={e =>
                                            handleMappingChange(
                                                'number',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>date *</td>
                                <td>
                                    <select
                                        value={fieldMapping.date}
                                        onChange={e =>
                                            handleMappingChange(
                                                'date',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>dr_total</td>
                                <td>
                                    <select
                                        value={fieldMapping.dr_total}
                                        onChange={e =>
                                            handleMappingChange(
                                                'dr_total',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>cr_total</td>
                                <td>
                                    <select
                                        value={fieldMapping.cr_total}
                                        onChange={e =>
                                            handleMappingChange(
                                                'cr_total',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>narration</td>
                                <td>
                                    <select
                                        value={fieldMapping.narration}
                                        onChange={e =>
                                            handleMappingChange(
                                                'narration',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>


                            <tr>
                                <td>ledger_code *</td>
                                <td>
                                    <select
                                        value={fieldMapping.ledger_code}
                                        onChange={e =>
                                            handleMappingChange(
                                                'ledger_code',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>amount *</td>
                                <td>
                                    <select
                                        value={fieldMapping.amount}
                                        onChange={e =>
                                            handleMappingChange(
                                                'amount',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>item_narration</td>
                                <td>
                                    <select
                                        value={fieldMapping.item_narration}
                                        onChange={e =>
                                            handleMappingChange(
                                                'item_narration',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>dc *</td>
                                <td>
                                    <select
                                        value={fieldMapping.dc}
                                        onChange={e =>
                                            handleMappingChange(
                                                'dc',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>reconciliation_date</td>
                                <td>
                                    <select
                                        value={fieldMapping.reconciliation_date}
                                        onChange={e =>
                                            handleMappingChange(
                                                'reconciliation_date',
                                                e.target.value,
                                            )
                                        }>
                                        <option value="">
                                            -- Select CSV Column --
                                        </option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button onClick={() => setIsMapped(true)}>
                        Proceed to Import
                    </button>
                </div>
            )}

            {isMapped && (
                <div className="preview-section">
                    <h3>Preview Data</h3>
                    <table>
                        <thead>
                            <tr>
                                {/* Entry Headers */}
                                <th>Entry ID</th>
                                <th>Tag ID</th>
                                <th>Entry Type ID</th>
                                <th>Number</th>
                                <th>Date</th>
                                <th>Dr Total</th>
                                <th>Cr Total</th>
                                <th>Narration</th>
                                <th>Item ID</th>
                                <th>Ledger ID</th>
                                <th>Amount</th>
                                <th>Item Narration</th>
                                <th>DC</th>
                                <th>Reconciliation Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {csvData.slice(0, 5).map((row, index) => (
                                <tr key={index}>
                                    {/* Entry Data */}
                                    <td>
                                        {row[fieldMapping.entry_id] ||
                                            generateUUID()}
                                    </td>
                                    <td>{row[fieldMapping.tag_id] || ''}</td>
                                    <td>{row[fieldMapping.entrytype_id]}</td>
                                    <td>{row[fieldMapping.number] || ''}</td>
                                    <td>{row[fieldMapping.date]}</td>
                                    <td>
                                        {row[fieldMapping.dr_total] || '0.00'}
                                    </td>
                                    <td>
                                        {row[fieldMapping.cr_total] || '0.00'}
                                    </td>
                                    <td>{row[fieldMapping.narration] || ''}</td>


                                    <td>{row[fieldMapping.ledger_code]}</td>
                                    <td>{row[fieldMapping.amount]}</td>
                                    <td>
                                        {row[fieldMapping.item_narration] || ''}
                                    </td>
                                    <td>{row[fieldMapping.dc]}</td>
                                    <td>
                                        {row[
                                            fieldMapping.reconciliation_date
                                        ] || ''}
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

            <style >{`
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
                th,
                td {
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
                    margin-top: 20px;
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
            `}</style>
        </div>
    )
}

export default Importer
