'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Budget } from '@/lib/supabase'
import { getCurrentMonth } from '@/lib/utils'
import Layout from '@/components/Layout'
import BudgetForm from '@/components/BudgetForm'
import BudgetList from '@/components/BudgetList'
import { Plus, Filter, Target } from 'lucide-react'

interface BudgetUsage {
  category_id: string
  category_name: string
  total_spent: number
}

export default function BudgetsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [usage, setUsage] = useState<BudgetUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchBudgets()
      fetchUsage()
    }
  }, [user, selectedMonth])

  const fetchBudgets = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/budgets?userId=${user.id}&month=${selectedMonth}`)
      const data = await response.json()
      if (data.budgets) {
        setBudgets(data.budgets)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsage = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/budgets/usage?userId=${user.id}&month=${selectedMonth}`)
      const data = await response.json()
      if (data.usage) {
        setUsage(data.usage)
      }
    } catch (error) {
      console.error('Error fetching budget usage:', error)
    }
  }

  const handleSubmit = async (formData: any) => {
    setFormLoading(true)
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchBudgets()
        await fetchUsage()
        setShowForm(false)
      } else {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting budget:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบงบประมาณนี้?')) {
      return
    }

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchBudgets()
        await fetchUsage()
      } else {
        const error = await response.json()
        alert(`เกิดข้อผิดพลาด: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      alert('เกิดข้อผิดพลาดในการลบข้อมูล')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
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

  // Generate month options (current month and 11 future months)
  const monthOptions = []
  for (let i = 0; i < 12; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() + i)
    const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
    monthOptions.push({ value: monthValue, label: monthLabel })
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">งบประมาณ</h1>
            <p className="mt-1 text-sm text-gray-600">
              ตั้งและติดตามงบประมาณรายเดือนของคุณ
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            ตั้งงบประมาณ
          </button>
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

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      งบประมาณรวม
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ฿{budgets.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      ใช้จ่ายแล้ว
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ฿{usage.reduce((sum, u) => sum + u.total_spent, 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      คงเหลือ
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ฿{(budgets.reduce((sum, b) => sum + b.amount, 0) - 
                         usage.reduce((sum, u) => sum + u.total_spent, 0)).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget List */}
        <BudgetList
          budgets={budgets}
          usage={usage}
          onDelete={handleDelete}
          loading={loading}
        />

        {/* Budget Form Modal */}
        {showForm && (
          <BudgetForm
            month={selectedMonth}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={formLoading}
          />
        )}
      </div>
    </Layout>
  )
}
