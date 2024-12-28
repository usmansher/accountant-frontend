const Totals = ({ items, decimalPlaces }) => {
    const floatOps = (param1, param2, op) => {
        let multiplier = Math.pow(10, decimalPlaces)
        param1 = Math.round(param1 * multiplier)
        param2 = Math.round(param2 * multiplier)
        let result = 0
        if (op === '+') {
            result = param1 + param2
        } else if (op === '-') {
            result = param1 - param2
        }
        return result / multiplier
    }

    const drTotal = items
        .filter(e => e.dc === 'D')
        .reduce((sum, e) => floatOps(sum, parseFloat(e.amount || 0), '+'), 0)

    const crTotal = items
        .filter(e => e.dc === 'C')
        .reduce((sum, e) => floatOps(sum, parseFloat(e.amount || 0), '+'), 0)

    const totalsEqual = floatOps(drTotal, crTotal, '-') === 0

    const drTotalClass = totalsEqual ? 'bg-yellow-200' : 'bg-red-200'
    const crTotalClass = totalsEqual ? 'bg-yellow-200' : 'bg-red-200'

    const diff = floatOps(drTotal, crTotal, '-')

    return (
        <div className="mt-6">
            <div className="flex space-x-4">
                <div className={`${drTotalClass} p-2 rounded`}>
                    <span className="font-bold">Debit Total:</span>{' '}
                    {drTotal.toFixed(decimalPlaces)}
                </div>
                <div className={`${crTotalClass} p-2 rounded`}>
                    <span className="font-bold">Credit Total:</span>{' '}
                    {crTotal.toFixed(decimalPlaces)}
                </div>
                <div className="p-2">
                    <span className="font-bold">Difference:</span>{' '}
                    {diff.toFixed(decimalPlaces)}
                </div>
            </div>
        </div>
    )
}

export default Totals
