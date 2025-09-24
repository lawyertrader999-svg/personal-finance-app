import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const month = searchParams.get('month') // Format: YYYY-MM

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 })
    }

    const startDate = `${month}-01`
    const endDate = `${month}-31`

    // Get transactions for the month
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(name, type)
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (transactionsError) {
      return NextResponse.json({ error: transactionsError.message }, { status: 500 })
    }

    // Get budgets for the month
    const monthDate = `${month}-01`
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('user_id', userId)
      .eq('month', monthDate)

    if (budgetsError) {
      return NextResponse.json({ error: budgetsError.message }, { status: 500 })
    }

    // Calculate summary statistics
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses

    // Group expenses by category
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc: any, transaction: any) => {
        const categoryName = transaction.category?.name || 'อื่นๆ'
        if (!acc[categoryName]) {
          acc[categoryName] = 0
        }
        acc[categoryName] += transaction.amount
        return acc
      }, {})

    // Group income by category
    const incomeByCategory = transactions
      .filter(t => t.type === 'income')
      .reduce((acc: any, transaction: any) => {
        const categoryName = transaction.category?.name || 'อื่นๆ'
        if (!acc[categoryName]) {
          acc[categoryName] = 0
        }
        acc[categoryName] += transaction.amount
        return acc
      }, {})

    // Calculate budget vs actual spending
    const budgetComparison = budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category_id === budget.category_id)
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        category: budget.category?.name || 'Unknown',
        budgeted: budget.amount,
        spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      }
    })

    // Recent transactions (last 5)
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    // Daily spending trend (last 30 days)
    const dailySpending = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0)
      
      dailySpending.push({
        date: dateStr,
        amount: dayExpenses
      })
    }

    return NextResponse.json({
      summary: {
        income,
        expenses,
        balance,
        transactionCount: transactions.length,
        budgetCount: budgets.length
      },
      expensesByCategory: Object.entries(expensesByCategory).map(([name, amount]) => ({
        name,
        amount
      })),
      incomeByCategory: Object.entries(incomeByCategory).map(([name, amount]) => ({
        name,
        amount
      })),
      budgetComparison,
      recentTransactions,
      dailySpending
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
