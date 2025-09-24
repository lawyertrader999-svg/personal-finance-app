'use client'

import { formatCurrency } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
  title: string
  amount: number
  icon: LucideIcon
  color: 'green' | 'red' | 'blue' | 'purple'
  trend?: {
    value: number
    isPositive: boolean
  }
}

const colorClasses = {
  green: {
    bg: 'bg-green-500',
    text: 'text-green-600',
    lightBg: 'bg-green-50',
    border: 'border-green-200'
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    lightBg: 'bg-red-50',
    border: 'border-red-200'
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200'
  }
}

export default function SummaryCard({ 
  title, 
  amount, 
  icon: Icon, 
  color,
  trend 
}: SummaryCardProps) {
  const colors = colorClasses[color]

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${colors.bg} rounded-md flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(amount)}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <svg
                      className={`self-center flex-shrink-0 h-5 w-5 ${
                        trend.isPositive ? 'text-green-500' : 'text-red-500'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {trend.isPositive ? (
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                    <span className="sr-only">
                      {trend.isPositive ? 'เพิ่มขึ้น' : 'ลดลง'}
                    </span>
                    {Math.abs(trend.value).toFixed(1)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Optional bottom section for additional info */}
      <div className={`${colors.lightBg} px-5 py-3`}>
        <div className="text-sm">
          <a href="#" className={`font-medium ${colors.text} hover:opacity-75`}>
            ดูรายละเอียด
          </a>
        </div>
      </div>
    </div>
  )
}
