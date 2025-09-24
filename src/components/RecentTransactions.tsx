'use client'

import { Transaction } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Minus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            รายการล่าสุด
          </h3>
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีรายการ</h3>
            <p className="mt-1 text-sm text-gray-500">
              เริ่มต้นโดยการเพิ่มรายรับหรือรายจ่ายแรกของคุณ
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            รายการล่าสุด
          </h3>
          <Link
            href="/transactions"
            className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            ดูทั้งหมด
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description || 'ไม่มีรายละเอียด'}
                    </p>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-500">
                        {transaction.category?.name}
                      </p>
                      <span className="mx-2 text-gray-300">•</span>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Action Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link
            href="/transactions"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มรายการใหม่
          </Link>
        </div>
      </div>
    </div>
  )
}
