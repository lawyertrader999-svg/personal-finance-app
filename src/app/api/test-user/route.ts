import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Create test user with admin privileges
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@finance-app.com',
      password: 'demo123456',
      email_confirm: true // Skip email confirmation
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const userId = authData.user.id

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: userId, username: 'demo_user' }])

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Create default categories
    const defaultCategories = [
      // Income categories
      { user_id: userId, name: 'เงินเดือน', type: 'income' },
      { user_id: userId, name: 'ธุรกิจส่วนตัว', type: 'income' },
      { user_id: userId, name: 'การลงทุน', type: 'income' },
      { user_id: userId, name: 'อื่นๆ', type: 'income' },
      // Expense categories
      { user_id: userId, name: 'อาหาร', type: 'expense' },
      { user_id: userId, name: 'การเดินทาง', type: 'expense' },
      { user_id: userId, name: 'ที่อยู่อาศัย', type: 'expense' },
      { user_id: userId, name: 'สาธารณูปโภค', type: 'expense' },
      { user_id: userId, name: 'ความบันเทิง', type: 'expense' },
      { user_id: userId, name: 'สุขภาพ', type: 'expense' },
      { user_id: userId, name: 'การศึกษา', type: 'expense' },
      { user_id: userId, name: 'เสื้อผ้า', type: 'expense' },
      { user_id: userId, name: 'อื่นๆ', type: 'expense' }
    ]

    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(defaultCategories)

    if (categoriesError) {
      console.error('Categories creation error:', categoriesError)
    }

    // Create sample transactions
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)

    if (categories && categories.length > 0) {
      const sampleTransactions = [
        {
          user_id: userId,
          date: '2025-09-20',
          amount: 50000,
          type: 'income',
          category_id: categories.find(c => c.name === 'เงินเดือน')?.id,
          description: 'เงินเดือนประจำเดือน'
        },
        {
          user_id: userId,
          date: '2025-09-21',
          amount: 350,
          type: 'expense',
          category_id: categories.find(c => c.name === 'อาหาร')?.id,
          description: 'ค่าอาหารกลางวัน'
        },
        {
          user_id: userId,
          date: '2025-09-22',
          amount: 1200,
          type: 'expense',
          category_id: categories.find(c => c.name === 'การเดินทาง')?.id,
          description: 'ค่าน้ำมันรถ'
        }
      ]

      const { error: transactionsError } = await supabase
        .from('transactions')
        .insert(sampleTransactions)

      if (transactionsError) {
        console.error('Transactions creation error:', transactionsError)
      }
    }

    // Create sample budgets
    if (categories && categories.length > 0) {
      const expenseCategories = categories.filter(c => c.type === 'expense')
      const sampleBudgets = [
        {
          user_id: userId,
          category_id: expenseCategories.find(c => c.name === 'อาหาร')?.id,
          amount: 15000,
          month: '2025-09'
        },
        {
          user_id: userId,
          category_id: expenseCategories.find(c => c.name === 'การเดินทาง')?.id,
          amount: 5000,
          month: '2025-09'
        },
        {
          user_id: userId,
          category_id: expenseCategories.find(c => c.name === 'ความบันเทิง')?.id,
          amount: 3000,
          month: '2025-09'
        }
      ]

      const { error: budgetsError } = await supabase
        .from('budgets')
        .insert(sampleBudgets.filter(b => b.category_id))

      if (budgetsError) {
        console.error('Budgets creation error:', budgetsError)
      }
    }

    return NextResponse.json({ 
      message: 'Test user created successfully',
      email: 'demo@finance-app.com',
      password: 'demo123456'
    })
  } catch (error) {
    console.error('Error creating test user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
