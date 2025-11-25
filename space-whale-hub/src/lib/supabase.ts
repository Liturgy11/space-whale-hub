import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrmdgbzmdtvqcuzfkwar.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please set it in your deployment environment variables (Vercel, etc.) or .env.local file.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please set it in your deployment environment variables (Vercel, etc.) or .env.local file.')
}

// Custom storage that handles quota errors and prevents large values
const customStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('Storage getItem failed:', error)
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      // Check if the value is too large (over 1MB)
      const valueSize = new Blob([value]).size
      if (valueSize > 1024 * 1024) { // 1MB limit
        console.warn(`Value too large (${(valueSize / 1024 / 1024).toFixed(2)}MB), skipping storage`)
        return
      }

      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('Storage setItem failed, clearing storage:', error)
      // If quota exceeded, clear storage and try again
      try {
        localStorage.clear()
        // Only try to store if value is small enough
        const valueSize = new Blob([value]).size
        if (valueSize <= 1024 * 1024) {
          localStorage.setItem(key, value)
        } else {
          console.warn('Value still too large after cleanup, skipping')
        }
      } catch (retryError) {
        console.error('Storage retry failed:', retryError)
      }
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Storage removeItem failed:', error)
    }
  }
}

// Create Supabase client with custom storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? customStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'space-whale-portal'
    }
  }
})

// Database types (we'll define these as we build the schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          pronouns: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          settings: any | null
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          pronouns?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          settings?: any | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          pronouns?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          settings?: any | null
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          mood: string | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          mood?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          mood?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          post_type: string
          tags: string[] | null
          has_content_warning: boolean
          content_warning_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          post_type?: string
          tags?: string[] | null
          has_content_warning?: boolean
          content_warning_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          post_type?: string
          tags?: string[] | null
          has_content_warning?: boolean
          content_warning_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      archive_items: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          content_type: string
          media_url: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          content_type: string
          media_url?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          content_type?: string
          media_url?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      workshops: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          time: string
          capacity: number
          price: string
          registration_open: boolean
          ndis_eligible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          time: string
          capacity: number
          price: string
          registration_open?: boolean
          ndis_eligible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          time?: string
          capacity?: number
          price?: string
          registration_open?: boolean
          ndis_eligible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workshop_registrations: {
        Row: {
          id: string
          workshop_id: string
          user_id: string
          participant_info: any | null
          registration_date: string
          status: string
        }
        Insert: {
          id?: string
          workshop_id: string
          user_id: string
          participant_info?: any | null
          registration_date?: string
          status?: string
        }
        Update: {
          id?: string
          workshop_id?: string
          user_id?: string
          participant_info?: any | null
          registration_date?: string
          status?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
