import Button from "@/components/Button"
import axios from "@/lib/axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const LedgerItem = ({ ledger, depth }) => {
    const router = useRouter()
    const editLedger = () => {
        router.push(`/account/ledger/${ledger.id}/edit`)
    }

    const deleteLedger = async () => {
        try {
            const response = await axios.delete(`/api/ledger/${ledger.id}`)
            toast.success(response.data.message)
            // Refresh the ledger list or navigate away
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Display the error message returned from the server
                toast.error(error.response.data.message)
            } else {
                // Handle other errors
                console.error('Error deleting ledger:', error)
            }
        }
    }



    return (
    <tr className="tr-ledger bg-white border-b ">
        <th
            scope="row"
            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
            style={{ paddingLeft: `${depth * 20}px` }}
        >
            {ledger.code} - {ledger.name}
        </th>
        <td className="px-6 py-4">Ledger</td>
        <td className="px-6 py-4">{ledger.op_total}</td>
        <td className="px-6 py-4">{ledger.cl_total}</td>
        <td className="px-6 py-4 flex gap-2">
            <Button className="btn btn-sm" onClick={() => editLedger()}>Edit</Button>
            <Button className="btn btn-sm" onClick={() => deleteLedger()}>Delete</Button>
        </td>
    </tr>
)
}

export default LedgerItem
