import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Profile {
  id: string
  username: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
}

export interface Transaction {
  id: string
  user_id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  category?: Category
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  month: string
  category?: Category
}
