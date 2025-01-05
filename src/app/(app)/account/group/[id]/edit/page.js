'use client'
import Header from '@/app/(app)/Header'
import GroupForm from '@/components/Pages/Groups/Form'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'

export default function EditGroupPage({ params }) {
    const { hasPermission } = useAuth()
    const router = useRouter()

    if (!hasPermission('edit-groups')) {
        router.back()
    }
    return (
        <>
            <Header title={`Edit Group`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <GroupForm id={params?.id} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
