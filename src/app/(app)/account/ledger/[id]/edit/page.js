import Header from '@/app/(app)/Header'
import LedgerForm from '@/components/Pages/Ledger/Form'

export default function EditLedgerPage({ params }) {
    return (
        <>
            <Header title="Edit Ledger" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <LedgerForm id={params?.id} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
