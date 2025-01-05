'use client'
import Header from '@/app/(app)/Header'
import AccountForm from '@/components/Pages/Accounts/Form'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'

const Account = () => {
    const { hasPermission } = useAuth()
    const router = useRouter()

    if (!hasPermission('create-account')) {
        router.back()
    }
    return (
        <>
            <Header title="Create Account" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <AccountForm />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Account
