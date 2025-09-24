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

    // Convert month to first day of month for database query
    const monthDate = `${month}-01`

    const { data: budgets, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', userId)
      .eq('month', monthDate)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ budgets })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, category_id, amount, month } = body

    if (!user_id || !category_id || !amount || !month) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Convert month to first day of month
    const monthDate = `${month}-01`

    // Use upsert to handle both create and update
    const { data: budget, error } = await supabase
      .from('budgets')
      .upsert(
        { user_id, category_id, amount, month: monthDate },
        { onConflict: 'user_id,category_id,month' }
      )
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ budget })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
