import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qrmdgbzmdtvqcuzfkwar.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
          content_warning: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          post_type?: string
          tags?: string[] | null
          content_warning?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          post_type?: string
          tags?: string[] | null
          content_warning?: string | null
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
