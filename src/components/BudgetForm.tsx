'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Category } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { X, Target } from 'lucide-react'

interface BudgetFormProps {
  month: string
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function BudgetForm({ 
  month, 
  onSubmit, 
  onCancel, 
  loading = false 
}: BudgetFormProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    category_id: '',
    amount: ''
  })

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?userId=${user?.id}`)
      const data = await response.json()
      if (data.categories) {
        // Only show expense categories for budgeting
        const expenseCategories = data.categories.filter((cat: Category) => cat.type === 'expense')
        setCategories(expenseCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const submitData = {
      user_id: user.id,
      category_id: formData.category_id,
      amount: parseFloat(formData.amount.toString()),
      month
    }

    await onSubmit(submitData)
  }

  const monthName = new Date(`${month}-01`).toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long' 
  })

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              ตั้งงบประมาณ
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-indigo-50 rounded-md">
          <p className="text-sm text-indigo-700">
            กำหนดงบประมาณสำหรับ <span className="font-medium">{monthName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
              หมวดหมู่รายจ่าย
            </label>
            <select
              id="category_id"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              เลือกหมวดหมู่ที่ต้องการตั้งงบประมาณ
            </p>
          </div>

          {/* Budget Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              จำนวนงบประมาณ (บาท)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              กำหนดจำนวนเงินที่วางแผนจะใช้จ่ายในหมวดหมู่นี้
            </p>
          </div>

          {/* Preview */}
          {formData.amount && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">งบประมาณที่ตั้ง:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(parseFloat(formData.amount) || 0)}
                </span>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
