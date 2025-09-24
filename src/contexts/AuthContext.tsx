'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`
      }
    })
    
    // If signup successful, create default categories
    if (!error && data.user) {
      await createDefaultCategories(data.user.id)
    }
    
    return { error }
  }

  const createDefaultCategories = async (userId: string) => {
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
      for (const category of defaultCategories) {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            name: category.name,
            type: category.type
          })
        })
      }
    } catch (error) {
      console.error('Error creating default categories:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
