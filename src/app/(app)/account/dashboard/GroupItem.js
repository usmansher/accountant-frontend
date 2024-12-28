import Button from '@/components/Button'
import LedgerItem from './LedgerItem'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

const GroupItem = ({ group, depth = 0 }) => {
    const router = useRouter()
    const editGroup = () => {
        router.push(`/account/group/${group.id}/edit`)
    }
    const deleteGroup = () => {
        axios
            .delete(`/api/group/${group.id}`)
            .then(() => {
                toast.success('Group deleted successfully')
            })
            .catch(error => {
                console.error('Error deleting group:', error)
                toast.error(error.response.data.message)
            })
    }

    return (
        <>
            {group?.id && (
                <tr className="tr-group bg-white border-b ">
                    <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                        style={{ paddingLeft: `${depth * 20}px` }}>
                        {group?.id ? `${group.code} - ${group.name}` : ''}
                    </th>
                    <td className="px-6 py-4">Group</td>
                    <td className="px-6 py-4">{group.op_total}</td>
                    <td className="px-6 py-4">{group.cl_total}</td>
                    {group?.id && (
                        <td className="px-6 py-4 flex gap-2">
                            <Button
                                className="btn btn-sm"
                                onClick={() => editGroup()}>
                                Edit
                            </Button>
                            <Button
                                className="btn btn-sm"
                                onClick={() => deleteGroup()}>
                                Delete
                            </Button>
                        </td>
                    )}
                </tr>
            )}
            {/* Render child ledgers */}
            {group.children_ledgers && group.children_ledgers.length > 0 && (
                <>
                    {group.children_ledgers.map(ledger => (
                        <LedgerItem
                            key={ledger.id}
                            ledger={ledger}
                            depth={depth + 1}
                        />
                    ))}
                </>
            )}

            {/* Render child groups recursively */}
            {group.children_groups && group.children_groups.length > 0 && (
                <>
                    {group.children_groups.map(subGroup => (
                        <GroupItem
                            key={subGroup.id}
                            group={subGroup}
                            depth={depth + 1}
                        />
                    ))}
                </>
            )}
        </>
    )
}

export default GroupItem
