'use client'

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface BarChartProps {
  data: Array<{
    name: string
    amount: number
  }>
  title: string
  color?: string
}

interface PieChartData {
  data: Array<{
    name: string
    amount: number
  }>
  title: string
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280']

export function BarChart({ data, title, color = '#3B82F6' }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          ไม่มีข้อมูลสำหรับแสดงกราฟ
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `฿${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'จำนวน']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar dataKey="amount" fill={color} radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function PieChart({ data, title }: PieChartData) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          ไม่มีข้อมูลสำหรับแสดงกราฟ
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center">
        <div className="h-64 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="amount"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'จำนวน']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        <div className="ml-6 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center text-sm">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-600">{item.name}:</span>
              <span className="ml-1 font-medium">{formatCurrency(item.amount)}</span>
              <span className="ml-1 text-gray-500">
                ({((item.amount / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
