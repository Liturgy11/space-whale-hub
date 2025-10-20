// Test database connection
import { supabase } from './supabase'

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Database connection successful!')
    return { success: true, data }
  } catch (err: any) {
    console.error('Database test failed:', err)
    return { success: false, error: err.message }
  }
}


