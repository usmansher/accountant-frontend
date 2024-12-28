import { Field } from "formik"
import { useEffect, useState } from "react"
import Select from 'react-select'

// EntryRow Component
const EntryRow = ({
    index,
    entry,
    remove,
    setFieldValue,
    ledgerOptions,
    errors,
    touched,
    decimalPlaces,
  }) => {
    const [ledgerBalance, setLedgerBalance] = useState(null)

    useEffect(() => {
      if (entry.ledger) {
        fetchLedgerBalance(entry.ledger.value)
      }
    }, [entry.ledger])

    const fetchLedgerBalance = async (ledgerId) => {
      // Replace with your API call
      const response = await fetch(`/api/ledgers/${ledgerId}/balance`)
      const data = await response.json()
      setLedgerBalance(data)
    }

    return (
      <div
        className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-4"
        key={index}
      >
        {/* DC */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Debit/Credit
          </label>
          <Field
            as="select"
            name={`items.${index}.dc`}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select</option>
            <option value="D">Debit</option>
            <option value="C">Credit</option>
          </Field>
          {errors.items &&
            errors.items[index] &&
            errors.items[index].dc &&
            touched.items &&
            touched.items[index] &&
            touched.items[index].dc && (
              <div className="text-red-500 text-sm">
                {errors.items[index].dc}
              </div>
            )}
        </div>
        {/* Ledger */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ledger
          </label>
          <Select
            options={ledgerOptions}
            name={`items.${index}.ledger`}
            value={entry.ledger}
            onChange={(option) =>
              setFieldValue(`items.${index}.ledger`, option)
            }
            className="mt-1"
          />
          {errors.items &&
            errors.items[index] &&
            errors.items[index].ledger &&
            touched.items &&
            touched.items[index] &&
            touched.items[index].ledger && (
              <div className="text-red-500 text-sm">
                {errors.items[index].ledger}
              </div>
            )}
        </div>
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <Field
            name={`items.${index}.amount`}
            type="number"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.items &&
            errors.items[index] &&
            errors.items[index].amount &&
            touched.items &&
            touched.items[index] &&
            touched.items[index].amount && (
              <div className="text-red-500 text-sm">
                {errors.items[index].amount}
              </div>
            )}
        </div>
        {/* Narration */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Narration
          </label>
          <Field
            name={`items.${index}.narration`}
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {/* Ledger Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ledger Balance
          </label>
          <div className="mt-1">
            {ledgerBalance
              ? `${ledgerBalance.dc} ${ledgerBalance.amount.toFixed(
                  decimalPlaces
                )}`
              : '-'}
          </div>
        </div>
        {/* Actions */}
        <div>
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={() => remove(index)}
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

export default EntryRow
