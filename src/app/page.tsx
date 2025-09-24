'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentMonth } from '@/lib/utils'
import Layout from '@/components/Layout'
import SummaryCard from '@/components/SummaryCard'
import { BarChart, PieChart } from '@/components/BarChart'
import RecentTransactions from '@/components/RecentTransactions'
import { TrendingUp, TrendingDown, Wallet, Target, Filter } from 'lucide-react'

interface DashboardData {
  summary: {
    income: number
    expenses: number
    balance: number
    transactionCount: number
    budgetCount: number
  }
  expensesByCategory: Array<{ name: string; amount: number }>
  incomeByCategory: Array<{ name: string; amount: number }>
  budgetComparison: Array<{
    category: string
    budgeted: number
    spent: number
    remaining: number
    percentage: number
  }>
  recentTransactions: any[]
  dailySpending: Array<{ date: string; amount: number }>
}

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, selectedMonth])

  const fetchDashboardData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/dashboard/summary?userId=${user.id}&month=${selectedMonth}`)
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Generate month options (current month and 11 previous months)
  const monthOptions = []
  for (let i = 0; i < 12; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
    monthOptions.push({ value: monthValue, label: monthLabel })
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
            <p className="mt-1 text-sm text-gray-600">
              ภาพรวมการเงินส่วนบุคคลของคุณ
            </p>
          </div>
        </div>

        {/* Month Filter */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <label htmlFor="month" className="text-sm font-medium text-gray-700">
                  เดือน:
                </label>
              </div>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="รายรับเดือนนี้"
              amount={data.summary.income}
              icon={TrendingUp}
              color="green"
            />
            <SummaryCard
              title="รายจ่ายเดือนนี้"
              amount={data.summary.expenses}
              icon={TrendingDown}
              color="red"
            />
            <SummaryCard
              title="คงเหลือ"
              amount={data.summary.balance}
              icon={Wallet}
              color="blue"
            />
            <SummaryCard
              title="งบประมาณที่ตั้ง"
              amount={data.budgetComparison.reduce((sum, b) => sum + b.budgeted, 0)}
              icon={Target}
              color="purple"
            />
          </div>
        )}

        {/* Charts Section */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses Bar Chart */}
            <BarChart
              data={[
                { name: 'รายรับ', amount: data.summary.income },
                { name: 'รายจ่าย', amount: data.summary.expenses }
              ]}
              title="รายรับ vs รายจ่าย"
              color="#3B82F6"
            />

            {/* Expenses by Category Pie Chart */}
            <PieChart
              data={data.expensesByCategory}
              title="รายจ่ายตามหมวดหมู่"
            />
          </div>
        )}

        {/* Budget Progress */}
        {data && data.budgetComparison.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                ความคืบหน้างบประมาณ
              </h3>
              <div className="space-y-4">
                {data.budgetComparison.map((budget, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {budget.category}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {budget.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          budget.percentage >= 100 
                            ? 'bg-red-500' 
                            : budget.percentage >= 80 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>ใช้: ฿{budget.spent.toLocaleString()}</span>
                      <span>งบ: ฿{budget.budgeted.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {data && (
          <RecentTransactions transactions={data.recentTransactions} />
        )}

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              การดำเนินการด่วน
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/transactions')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                เพิ่มรายรับ
              </button>
              <button
                onClick={() => router.push('/transactions')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                เพิ่มรายจ่าย
              </button>
              <button
                onClick={() => router.push('/budgets')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Target className="h-5 w-5 mr-2 text-purple-500" />
                ตั้งงบประมาณ
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
