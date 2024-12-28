import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import useConfigStore from '@/store/configStore'
import Input from '@/components/Input'
import axios from '@/lib/axios'
import { FaCalendarAlt } from 'react-icons/fa'

const AccountForm = () => {
    const config = useConfigStore(state => state.config)
    if (!config) return <div>Loading config...</div>

    useEffect(() => {
        console.log(config?.system_variables?.currency_formats)
    }, [])

    const [dateFormat, setDateFormat] = useState('MM/dd/yyyy')
    const [isPostgres, setIsPostgres] = useState(false)

    const formik = useFormik({
        initialValues: {
            label: '',
            name: '',
            address: '',
            email: '',
            currency_symbol: '',
            currency_format: '',
            decimal_places: '',
            date_format: dateFormat,
            fy_start: null,
            fy_end: null,
            db_datasource: '',
            db_database: '',
            db_schema: '',
            db_host: 'localhost',
            db_port: '3306',
            db_login: '',
            db_password: '',
            db_prefix: '',
            db_persistent: false,
        },
        validationSchema: Yup.object({
            label: Yup.string().required('Required'),
            // date_format: Yup.string().required('Required'),
            // fy_start: Yup.date().required('Required'),
            // fy_end: Yup.date().required('Required'),
            // db_datasource: Yup.string().required('Required'),
            // db_database: Yup.string().required('Required'),
            // db_host: Yup.string().required('Required'),
            // db_login: Yup.string().required('Required'),
        }),
        onSubmit: async values => {
            console.log(values)
            try {
                const response = await axios.post('/api/account', values)
                console.log(response.data)
            } catch (error) {
                console.error(error)
            }
        },
    })

    useEffect(() => {
        formik.setFieldValue('date_format', dateFormat)
    }, [dateFormat])

    const handleDateFormatChange = event => {
        const selectedFormat = event.target.value.split('|')[1]
        setDateFormat(selectedFormat)
    }

    // const handleDbDatasourceChange = (event) => {
    //     const isPostgresDb = event.target.value === 'Database/Postgres'
    //     setIsPostgres(isPostgresDb)
    // }

    return (
        <form onSubmit={formik.handleSubmit} className="">
            <div className="mb-4">
                <label className="block text-gray-700">Label</label>
                <Input
                    type="text"
                    name="label"
                    className="mt-1 p-2 border-gray-300 rounded w-full"
                    value={formik.values.label}
                    onChange={formik.handleChange}
                />
                <span className="text-sm text-gray-500">
                    Note: It is recommended to use a descriptive label like
                    "company2024" which includes both a short name and the
                    accounting year.
                </span>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">
                    Company / Personal Name
                </label>
                <Input
                    type="text"
                    name="name"
                    className="mt-1 p-2 border-gray-300 rounded w-full"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    required
                />
                {formik.errors.name ? (
                    <div className="text-red-500 text-sm">
                        {formik.errors.name}
                    </div>
                ) : null}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Address</label>
                <textarea
                    name="address"
                    className={` rounded-md shadow-sm border-gray-300 focus:border-gray-300-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full`}
                    rows="3"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <Input
                    type="email"
                    name="email"
                    className="mt-1 p-2 border-gray-300 rounded w-full"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="sm:col-span-1">
                    <label
                        htmlFor="currency_symbol"
                        className="block text-sm/6 font-medium text-gray-900">
                        Currency Symbol
                    </label>
                    <div className="mt-2">
                        <Input
                            type="text"
                            name="currency_symbol"
                            className="p-2 border-gray-300 rounded w-full"
                            value={formik.values.currency_symbol}
                            onChange={formik.handleChange}
                        />
                    </div>
                </div>
                <div className="sm:col-span-1">
                    <label
                        htmlFor="currency_format"
                        className="block text-sm/6 font-medium text-gray-900">
                        Currency Format
                    </label>
                    <div className="mt-2 flex flex-col">
                        <select
                            name="currency_format"
                            className={` rounded-md shadow-sm border-gray-300 focus:border-gray-300-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
                            value={formik.values.currency_format}
                            onChange={formik.handleChange}>
                            {config?.system_variables?.currency_formats?.map(
                                format => (
                                    <option
                                        key={format.value}
                                        value={`${format.value}`}>
                                        {format.text}
                                    </option>
                                ),
                            )}
                        </select>
                        <span className="text-sm text-gray-500">
                            Note: Check the wiki if you want to create a custom
                            format for currency.
                        </span>
                    </div>
                </div>
                <div className="sm:col-span-1">
                    <label
                        htmlFor="decimal_places"
                        className="block text-sm/6 font-medium text-gray-900">
                        Decimal Places
                    </label>
                    <div className="mt-2 flex flex-col">
                        <Input
                            type="number"
                            name="decimal_places"
                            value={formik.values.decimal_places}
                            onChange={formik.handleChange}
                            className="p-2 border-gray-300 rounded w-full"
                        />
                        <span className="text-sm text-gray-500">
                            Note: This option cannot be changed later on.
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="sm:col-span-1">
                    <label
                        htmlFor="date_format"
                        className="block text-sm/6 font-medium text-gray-900">
                        Date Format
                    </label>
                    <div className="mt-2">
                        <select
                            name="date_format"
                            className={`w-full rounded-md shadow-sm border-gray-300 focus:border-gray-300-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
                            value={formik.values.date_format}
                            onChange={e => {
                                formik.handleChange(e)
                                handleDateFormatChange(e)
                            }}
                            required>
                            {config?.system_variables?.date_formats?.map(
                                format => (
                                    <option
                                        key={format.value}
                                        value={`${format.value}`}>
                                        {format.text}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>
                </div>

                <div className="sm:col-span-1">
                    <label
                        htmlFor="fy_start"
                        className="block text-sm/6 font-medium text-gray-900">
                        Financial Year Start
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <DatePicker
                            selected={formik.values.fy_start}
                            dateFormat={dateFormat}
                            onChange={date =>
                                formik.setFieldValue('fy_start', date)
                            }
                            wrapperClassName="w-full"
                            className="mt-1 p-2 border-gray-300 rounded w-full"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <FaCalendarAlt
                                aria-hidden="true"
                                className="h-5 w-5 text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="sm:col-span-1">
                    <label
                        htmlFor="fy_end"
                        className="block text-sm/6 font-medium text-gray-900">
                        Financial Year End
                    </label>

                    <div className="relative mt-2 rounded-md shadow-sm">
                        <DatePicker
                            selected={formik.values.fy_end}
                            dateFormat={dateFormat}
                            onChange={date =>
                                formik.setFieldValue('fy_end', date)
                            }
                            wrapperClassName="w-full"
                            className="mt-1 p-2 border-gray-300 rounded w-full"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <FaCalendarAlt
                                aria-hidden="true"
                                className="h-5 w-5 text-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <fieldset className="my-4">
                <legend className="text-lg text-gray-700 font-semibold mb-4">
                    Database Settings
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700">
                            Database Type
                        </label>
                        <select
                            name="db_datasource"
                            className="rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full"
                            value={formik.values.db_datasource}
                            onChange={e => {
                                formik.handleChange(e)
                                handleDateFormatChange(e)
                            }}
                            required>
                            {config?.system_variables?.database_drivers?.map(
                                format => (
                                    <option
                                        key={format.value}
                                        value={format.value}>
                                        {format.text}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700">
                            Database Name
                        </label>
                        <Input
                            type="text"
                            name="db_database"
                            className="mt-1 p-2 border-gray-300 rounded w-full"
                            value={formik.values.db_database}
                            onChange={formik.handleChange}
                        />
                    </div>

                    {isPostgres && (
                        <div>
                            <label className="block text-gray-700">
                                Database Schema
                            </label>
                            <Input
                                type="text"
                                name="db_schema"
                                className="mt-1 p-2 border-gray-300 rounded w-full"
                                value={formik.values.db_schema}
                                onChange={formik.handleChange}
                            />
                            <span className="text-sm text-gray-500">
                                Note: Database schema is required for Postgres
                                database connection. Leave it blank for MySQL
                                connections.
                            </span>
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-700">
                            Database Host
                        </label>
                        <Input
                            type="text"
                            name="db_host"
                            className="mt-1 p-2 border-gray-300 rounded w-full"
                            value={formik.values.db_host}
                            onChange={formik.handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700">
                            Database Port
                        </label>
                        <Input
                            type="text"
                            name="db_port"
                            className="mt-1 p-2 border-gray-300 rounded w-full"
                            value={formik.values.db_port}
                            onChange={formik.handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700">
                            Database Login
                        </label>
                        <Input
                            type="text"
                            name="db_login"
                            className="mt-1 p-2 border-gray-300 rounded w-full"
                            value={formik.values.db_login}
                            onChange={formik.handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700">
                            Database Password
                        </label>
                        <Input
                            type="password"
                            name="db_password"
                            className="mt-1 p-2 border-gray-300 rounded w-full"
                            value={formik.values.db_password}
                            onChange={formik.handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700">
                            Database Table Prefix
                        </label>
                        <Input
                            type="text"
                            name="db_prefix"
                            className="mt-1 p-2 border-gray-300 rounded w-full"
                            value={formik.values.db_prefix}
                            onChange={formik.handleChange}
                        />
                        <span className="text-sm text-gray-500">
                            Note: Database table prefix to use (optional). All
                            tables for this account will be created with this
                            prefix, useful if you have only one database
                            available and want to use multiple accounts.
                        </span>
                    </div>

                    <div>
                        <label className="block text-gray-700">
                            Use Persistent Connection
                        </label>
                        <Input
                            type="checkbox"
                            name="db_persistent"
                            checked={formik.values.db_persistent}
                            onChange={formik.handleChange}
                            className="mt-1"
                        />
                    </div>
                </div>
            </fieldset>

            <div className="flex items-center">
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded">
                    Submit
                </button>
                <span className="ml-2" />
                <a
                    href="/cancel"
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded">
                    Cancel
                </a>
            </div>
        </form>
    )
}

export default AccountForm
