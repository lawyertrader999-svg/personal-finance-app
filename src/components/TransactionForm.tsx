'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Category, Transaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { X, Plus, Minus, RefreshCw } from 'lucide-react'

interface TransactionFormProps {
  transaction?: Transaction
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function TransactionForm({ 
  transaction, 
  onSubmit, 
  onCancel, 
  loading = false 
}: TransactionFormProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: transaction?.date || new Date().toISOString().split('T')[0],
    amount: transaction?.amount || '',
    type: transaction?.type || 'expense' as 'income' | 'expense',
    category_id: transaction?.category_id || '',
    description: transaction?.description || ''
  })

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  // เมื่อเปลี่ยนประเภท (รายรับ/รายจ่าย) ให้เลือก category แรกของประเภทนั้น
  useEffect(() => {
    if (categories.length > 0) {
      const filteredCategories = categories.filter(cat => cat.type === formData.type)
      if (filteredCategories.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: filteredCategories[0].id }))
      }
    }
  }, [formData.type, categories])

  const createDefaultCategories = async () => {
    if (!user) return false
    
    const defaultCategories = [
      // Income categories
      { name: 'เงินเดือน', type: 'income' },
      { name: 'ธุรกิจส่วนตัว', type: 'income' },
      { name: 'การลงทุน', type: 'income' },
      { name: 'อื่นๆ', type: 'income' },
      // Expense categories
      { name: 'อาหาร', type: 'expense' },
      { name: 'การเดินทาง', type: 'expense' },
      { name: 'ที่อยู่อาศัย', type: 'expense' },
      { name: 'สาธารณูปโภค', type: 'expense' },
      { name: 'ความบันเทิง', type: 'expense' },
      { name: 'สุขภาพ', type: 'expense' },
      { name: 'การศึกษา', type: 'expense' },
      { name: 'เสื้อผ้า', type: 'expense' },
      { name: 'อื่นๆ', type: 'expense' }
    ]

    try {
      const promises = defaultCategories.map(category =>
        fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            name: category.name,
            type: category.type
          })
        })
      )

      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Error creating default categories:', error)
      return false
    }
  }

  const fetchCategories = async (retryCount = 0) => {
    if (!user) return

    setCategoriesLoading(true)
    setCategoriesError(null)

    try {
      const response = await fetch(`/api/categories?userId=${user.id}`)
      const data = await response.json()
      
      // หากไม่มี categories และยังไม่เคยลองสร้าง
      if ((!data.categories || data.categories.length === 0) && retryCount === 0) {
        console.log('No categories found, creating default categories...')
        
        const created = await createDefaultCategories()
        
        if (created) {
          // รอ 2 วินาทีแล้วลองดึงใหม่
          await new Promise(resolve => setTimeout(resolve, 2000))
          return fetchCategories(1) // retry ครั้งเดียว
        }
      }
      
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories)
        
        // ตั้งค่า category เริ่มต้นหากยังไม่ได้เลือก
        if (!formData.category_id) {
          const defaultCategory = data.categories.find((cat: Category) => cat.type === formData.type)
          if (defaultCategory) {
            setFormData(prev => ({ ...prev, category_id: defaultCategory.id }))
          }
        }
      } else {
        setCategoriesError('ไม่พบหมวดหมู่ กรุณาลองใหม่อีกครั้ง')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategoriesError('เกิดข้อผิดพลาดในการโหลดหมวดหมู่')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category_id) {
      alert('กรุณาเลือกหมวดหมู่')
      return
    }

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount.toString()),
      user_id: user?.id
    }

    await onSubmit(submitData)
  }

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      category_id: '' // รีเซ็ต category เมื่อเปลี่ยนประเภท
    }))
  }

  // กรอง categories ตามประเภทที่เลือก
  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ประเภท */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ประเภท
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-green-300'
                }`}
              >
                <Plus className="h-5 w-5 mr-2" />
                รายรับ
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-red-300'
                }`}
              >
                <Minus className="h-5 w-5 mr-2" />
                รายจ่าย
              </button>
            </div>
          </div>

          {/* วันที่ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* จำนวนเงิน */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              จำนวนเงิน (บาท)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* หมวดหมู่ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                หมวดหมู่
              </label>
              {categoriesError && (
                <button
                  type="button"
                  onClick={() => fetchCategories()}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  disabled={categoriesLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${categoriesLoading ? 'animate-spin' : ''}`} />
                  ลองใหม่
                </button>
              )}
            </div>
            
            {categoriesLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                กำลังโหลดหมวดหมู่...
              </div>
            ) : categoriesError ? (
              <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700 text-sm">
                {categoriesError}
              </div>
            ) : filteredCategories.length > 0 ? (
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">เลือกหมวดหมู่</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                ไม่พบหมวดหมู่สำหรับ{formData.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
              </div>
            )}
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียด (ไม่บังคับ)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="เพิ่มรายละเอียดเพิ่มเติม..."
            />
          </div>

          {/* ปุ่มดำเนินการ */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || categoriesLoading || !formData.category_id}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
