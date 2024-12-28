'use client'
import Header from '@/app/(app)/Header'
import LedgerForm from '@/components/Pages/Ledger/Form'

const LedgerCreate = () => {
    return (
        <>
            <Header title="Create Ledger" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <LedgerForm />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LedgerCreate
