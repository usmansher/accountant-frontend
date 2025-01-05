'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from '@/lib/axios'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '@/hooks/auth'
import Header from '@/app/(app)/Header'

export default function RolePermissionsPage() {
    const { hasPermission } = useAuth()
    const router = useRouter()
    const params = useParams()

    // If user cannot assign permissions, redirect or fallback
    if (!hasPermission('assign-permissions')) {
        router.back()
    }

    const roleId = params.id
    const [permissions, setPermissions] = useState([]) // all permissions
    const [rolePermissions, setRolePermissions] = useState([]) // permission IDs that role currently has
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const fetchPermissions = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`/api/role/${roleId}/permissions`)
            const { permissions, rolePermissions } = res.data
            setPermissions(permissions) // all available permissions
            setRolePermissions(rolePermissions) // IDs of permissions assigned to the role
        } catch (error) {
            toast.error('Failed to load permissions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (roleId) {
            fetchPermissions()
        }
    }, [roleId])

    // Toggle permission in local state
    const handleTogglePermission = (permId) => {
        if (rolePermissions.includes(permId)) {
            setRolePermissions(rolePermissions.filter(id => id !== permId))
        } else {
            setRolePermissions([...rolePermissions, permId])
        }
    }

    // Save changes
    const handleSave = async () => {
        setSaving(true)
        try {
            await axios.post(`/api/role/${roleId}/permissions`, {
                permissions: rolePermissions,
            })
            toast.success('Permissions updated successfully')
        } catch (error) {
            toast.error('Failed to update permissions')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <Header title={`Role Permissions`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Toaster />

                    {loading ? (
                        <p>Loading permissions...</p>
                    ) : (
                        <div className="bg-white shadow sm:rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Manage Permissions for Role #{roleId}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {permissions.map((permission) => {
                                    const isChecked = rolePermissions.includes(
                                        permission.id,
                                    )
                                    return (
                                        <label
                                            key={permission.id}
                                            className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() =>
                                                    handleTogglePermission(
                                                        permission.id,
                                                    )
                                                }
                                            />
                                            <span>{permission.name}</span>
                                        </label>
                                    )
                                })}
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-green-600 text-white px-4 py-2 rounded shadow">
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => router.back()}
                                    className="bg-gray-600 text-white px-4 py-2 ml-3 rounded shadow">
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
