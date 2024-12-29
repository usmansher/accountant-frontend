// components/IncomeExpensePieChart.js
import React, { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import axios from '@/lib/axios'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

const IncomeExpensePieChart = () => {
    const [pieData, setPieData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchPieChartData = async () => {
        try {
            const response = await axios.get('/api/dashboard/income-expense-chart')
            const data = response.data

            setPieData({
                labels: ['Income', 'Expense', 'Assets', 'Liabilities & Owners Equity'],
                datasets: [
                    {
                        label: '# ',
                        data: [data.Income, data.Expense, data.Assets, data.Liabilities],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(54, 162, 235, 1)',
                        ],
                        borderWidth: 1,
                        
                    },
                ],
            })
        } catch (error) {
            console.error('Error fetching pie chart data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPieChartData()
    }, [])

    if (loading) {
        return <div>Loading Pie Chart...</div>
    }

    return (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-xl mb-4">Balance Summary</h3>
            {pieData ? (
                <Pie
                    data={pieData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            },
                        },
                    }}
                />
            ) : (
                <div>No data available.</div>
            )}
        </div>
    )
}

export default IncomeExpensePieChart
