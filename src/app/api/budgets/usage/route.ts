import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const month = searchParams.get('month') // Format: YYYY-MM

    if (!userId || !month) {
      return NextResponse.json({ error: 'User ID and month are required' }, { status: 400 })
    }

    // Get spending for each category in the specified month
    const startDate = `${month}-01`
    const endDate = `${month}-31`

    const { data: spending, error } = await supabase
      .from('transactions')
      .select(`
        category_id,
        amount,
        category:categories(name)
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group spending by category
    const spendingByCategory = spending.reduce((acc: any, transaction: any) => {
      const categoryId = transaction.category_id
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category_id: categoryId,
          category_name: transaction.category?.name || 'Unknown',
          total_spent: 0
        }
      }
      acc[categoryId].total_spent += transaction.amount
      return acc
    }, {})

    return NextResponse.json({ 
      usage: Object.values(spendingByCategory)
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
