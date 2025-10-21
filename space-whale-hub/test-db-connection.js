// Simple test to check database connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qrmdgbzmdtvqcuzfkwar.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing database connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('posts').select('count').limit(1)
    console.log('Posts table test:', { data, error })
    
    // Test journal entries table
    const { data: journalData, error: journalError } = await supabase.from('journal_entries').select('count').limit(1)
    console.log('Journal entries table test:', { journalData, journalError })
    
    // Test profiles table
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('count').limit(1)
    console.log('Profiles table test:', { profileData, profileError })
    
  } catch (err) {
    console.error('Database connection test failed:', err)
  }
}

testConnection()


