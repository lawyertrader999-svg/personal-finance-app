'use client'

import { Budget } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { Trash2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface BudgetUsage {
  category_id: string
  category_name: string
  total_spent: number
}

interface BudgetListProps {
  budgets: Budget[]
  usage: BudgetUsage[]
  onDelete: (id: string) => void
  loading?: boolean
}

export default function BudgetList({ 
  budgets, 
  usage, 
  onDelete, 
  loading = false 
}: BudgetListProps) {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีงบประมาณ</h3>
          <p className="mt-1 text-sm text-gray-500">
            เริ่มต้นโดยการตั้งงบประมาณสำหรับหมวดหมู่รายจ่ายต่างๆ
          </p>
        </div>
      </div>
    )
  }

  // Create a map of usage by category_id for quick lookup
  const usageMap = usage.reduce((acc, item) => {
    acc[item.category_id] = item.total_spent
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          งบประมาณรายเดือน
        </h3>
        
        <div className="space-y-6">
          {budgets.map((budget) => {
            const spent = usageMap[budget.category_id] || 0
            const remaining = budget.amount - spent
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
            
            // Determine status and colors
            let statusIcon
            let statusColor = 'text-green-600'
            let progressColor = 'bg-green-500'
            let bgColor = 'bg-green-100'
            
            if (percentage >= 100) {
              statusIcon = <AlertTriangle className="h-5 w-5" />
              statusColor = 'text-red-600'
              progressColor = 'bg-red-500'
              bgColor = 'bg-red-100'
            } else if (percentage >= 80) {
              statusIcon = <AlertCircle className="h-5 w-5" />
              statusColor = 'text-yellow-600'
              progressColor = 'bg-yellow-500'
              bgColor = 'bg-yellow-100'
            } else {
              statusIcon = <CheckCircle className="h-5 w-5" />
            }

            return (
              <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`p-1 rounded-full ${bgColor} ${statusColor} mr-3`}>
                      {statusIcon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {budget.category?.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        งบประมาณ: {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(budget.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                    title="ลบงบประมาณ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>ใช้ไป: {formatCurrency(spent)}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">คงเหลือ:</span>
                  <span className={`font-medium ${
                    remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(remaining)}
                  </span>
                </div>

                {/* Warning message */}
                {percentage >= 100 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    ⚠️ เกินงบประมาณแล้ว {formatCurrency(Math.abs(remaining))}
                  </div>
                )}
                {percentage >= 80 && percentage < 100 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    ⚠️ ใกล้หมดงบประมาณแล้ว
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Overall Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">งบประมาณรวม:</span>
              <div className="font-medium text-gray-900">
                {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
              </div>
            </div>
            <div>
              <span className="text-gray-600">ใช้จ่ายรวม:</span>
              <div className="font-medium text-gray-900">
                {formatCurrency(usage.reduce((sum, u) => sum + u.total_spent, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
