import Header from '@/app/(app)/Header'
import Statistics from '../account/statistics/page'

export const metadata = {
    title: 'Laravel - Dashboard',
}

const Dashboard = () => {
    return (
        <>
            <Header title="Dashboard" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Statistics />
                </div>
            </div>
        </>
    )
}

export default Dashboard