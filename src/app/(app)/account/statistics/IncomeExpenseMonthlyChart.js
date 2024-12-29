// components/IncomeExpenseMonthlyChart.js
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import axios from '@/lib/axios'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
)

const IncomeExpenseMonthlyChart = () => {
    const [chartData, setChartData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchMonthlyChartData = async () => {
        try {
            const response = await axios.get(
                '/api/dashboard/income-expense-monthly-chart',
            )
            const data = response.data

            setChartData({
                labels: data.xAxis,
                datasets: [
                    {
                        label: 'Income',
                        data: data.Income,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                    },
                    {
                        label: 'Expense',
                        data: data.Expense,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: true,
                    },
                ],
            })
        } catch (error) {
            console.error('Error fetching monthly chart data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMonthlyChartData()
    }, [])

    if (loading) {
        return <div>Loading Monthly Chart...</div>
    }

    return (
        <div className="bg-white shadow rounded-lg p-6 grid-cols-2 ">
            <h3 className="text-xl mb-4">Income vs. Expense Monthly Chart</h3>
            {chartData ? (
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Monthly Income and Expense',
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

export default IncomeExpenseMonthlyChart
