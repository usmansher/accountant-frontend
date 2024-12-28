'use client'

import React from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const numberingOptions = [
    { value: 1, label: 'Auto' },
    { value: 2, label: 'Manual (required)' },
    { value: 3, label: 'Manual (optional)' },
]

const restrictionOptions = [
    { value: 1, label: 'Unrestricted' },
    { value: 2, label: 'Atleast one Bank or Cash account must be present on Debit side' },
    { value: 3, label: 'Atleast one Bank or Cash account must be present on Credit side' },
    { value: 4, label: 'Only Bank or Cash account can be present on both Debit and Credit side' },
    { value: 5, label: 'Only NON Bank or Cash account can be present on both Debit and Credit side' },
]

// Validation schema using Yup
const validationSchema = Yup.object({
    label: Yup.string().required('Label is required'),
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    prefix: Yup.string().optional(),
    suffix: Yup.string().optional(),
    zero_padding: Yup.number()
        .typeError('Zero padding must be a number')
        .required('Zero padding is required')
        .min(0, 'Zero padding cannot be negative'),
    numbering: Yup.number()
        .oneOf([1, 2, 3], 'Invalid numbering option')
        .required('Numbering is required'),
    restriction_bankcash: Yup.number()
        .oneOf([1, 2, 3, 4, 5], 'Invalid restriction option')
        .required('Restriction is required'),
})

const EntryTypeModal = ({
    isOpen,
    onClose,
    initialData = {},
    onSubmit, // function to handle form submission
}) => {
    const formik = useFormik({
        initialValues: {
            label: initialData?.label || '',
            name: initialData?.name || '',
            description: initialData?.description || '',
            prefix: initialData?.prefix || '',
            suffix: initialData?.suffix || '',
            zero_padding: initialData?.zero_padding || '',
            numbering: initialData?.numbering || 1,
            restriction_bankcash: initialData?.restriction_bankcash || 1,
        },
        validationSchema,
        onSubmit: values => {
            // Call the onSubmit prop with form values
            onSubmit(values)
        },
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}></div>

            <div className="bg-white rounded-lg shadow-lg z-50 max-w-2xl w-full p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    &times;
                </button>

                <h2 className="text-xl font-bold mb-4">
                    Add / Edit Entry Type
                </h2>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-semibold">
                                Label
                            </label>
                            <input
                                type="text"
                                name="label"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.label}
                                className="mt-1 p-2 border-gray-300 rounded w-full"
                            />
                            {formik.touched.label && formik.errors.label && (
                                <div className="text-red-500 text-sm">
                                    {formik.errors.label}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-semibold">
                                Description
                            </label>
                            <input
                                type="text"
                                name="description"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.description}
                                className="mt-1 p-2 border-gray-300 rounded w-full"
                            />
                            {formik.touched.description &&
                                formik.errors.description && (
                                    <div className="text-red-500 text-sm">
                                        {formik.errors.description}
                                    </div>
                                )}
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">
                                Zero Padding
                            </label>
                            <input
                                type="text"
                                name="zero_padding"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.zero_padding}
                                className="mt-1 p-2 border-gray-300 rounded w-full"
                            />
                            {formik.touched.zero_padding &&
                                formik.errors.zero_padding && (
                                    <div className="text-red-500 text-sm">
                                        {formik.errors.zero_padding}
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-semibold">
                                Prefix
                            </label>
                            <input
                                type="text"
                                name="prefix"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.prefix}
                                className="mt-1 p-2 border-gray-300 rounded w-full"
                            />
                            {formik.touched.prefix && formik.errors.prefix && (
                                <div className="text-red-500 text-sm">
                                    {formik.errors.prefix}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold">
                                Suffix
                            </label>
                            <input
                                type="text"
                                name="suffix"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.suffix}
                                className="mt-1 p-2 border-gray-300 rounded w-full"
                            />
                            {formik.touched.suffix && formik.errors.suffix && (
                                <div className="text-red-500 text-sm">
                                    {formik.errors.suffix}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-semibold">
                                Numbering
                            </label>
                            <select
                                name="numbering"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.numbering}
                                className="mt-1 p-2 border-gray-300 rounded w-full">
                                {numberingOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.numbering &&
                                formik.errors.numbering && (
                                    <div className="text-red-500 text-sm">
                                        {formik.errors.numbering}
                                    </div>
                                )}
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold">
                                Restrictions
                            </label>
                            <select
                                name="restriction_bankcash"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.restriction_bankcash}
                                className="mt-1 p-2 border-gray-300 rounded w-full">
                                {restrictionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {formik.touched.restriction_bankcash &&
                                formik.errors.restriction_bankcash && (
                                    <div className="text-red-500 text-sm">
                                        {formik.errors.restriction_bankcash}
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EntryTypeModal
