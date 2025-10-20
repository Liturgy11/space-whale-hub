import { supabase } from './supabase'

// ============================================
// PROFILE OPERATIONS
// ============================================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  // Get public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with avatar URL
  await updateProfile(userId, { avatar_url: data.publicUrl })

  return data.publicUrl
}

// ============================================
// JOURNAL OPERATIONS
// ============================================

export async function createJournalEntry(userId: string, entry: {
  title?: string
  content: string
  mood?: string
  tags?: string[]
  media_url?: string
  media_type?: string
  is_private?: boolean
}) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || [],
      media_url: entry.media_url,
      media_type: entry.media_type,
      is_private: entry.is_private ?? true
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getJournalEntries(userId: string, options: {
  mood?: string
  limit?: number
} = {}) {
  let query = supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options.mood) {
    query = query.eq('mood', options.mood)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function updateJournalEntry(entryId: string, updates: any) {
  const { data, error } = await supabase
    .from('journal_entries')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', entryId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteJournalEntry(entryId: string) {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId)
  
  if (error) throw error
}

export async function getJournalStats(userId: string) {
  // Get total entries
  const { count: totalEntries } = await supabase
    .from('journal_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get mood distribution
  const { data: moodData } = await supabase
    .from('journal_entries')
    .select('mood')
    .eq('user_id', userId)
    .not('mood', 'is', null)

  const moodCounts: Record<string, number> = {}
  moodData?.forEach(entry => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    }
  })

  return {
    totalEntries: totalEntries || 0,
    moodDistribution: moodCounts
  }
}

// ============================================
// POST OPERATIONS (Community Feed)
// ============================================

export async function createPost(post: {
  content: string
  tags?: string[]
  content_warning?: string
  media_url?: string
  media_type?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content: post.content,
      tags: post.tags || [],
      has_content_warning: !!post.content_warning,
      content_warning_text: post.content_warning || null,
      media_url: post.media_url || null,
      media_type: post.media_type || null
    })
    .select('*')
    .single()
  
  if (error) throw error
  return data
}

export async function getPosts(options: {
  tags?: string[]
  limit?: number
} = {}) {
  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (options.tags) {
    query = query.contains('tags', options.tags)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data: posts, error } = await query
  
  if (error) throw error
  
  if (!posts || posts.length === 0) {
    return []
  }

  // Get current user for special handling
  const { data: { user } } = await supabase.auth.getUser()

  // Get unique user IDs from posts
  const userIds = [...new Set(posts.map(post => post.user_id))]
  
  // Create a map for quick lookup using user metadata
  const profileMap = new Map()
  
  // For each user ID, try to get their profile data
  for (const userId of userIds) {
    // Special case for current user - use their actual metadata
    if (user && userId === user.id) {
      // Try multiple fallbacks for display name
      const displayName = user.user_metadata?.display_name || 
                         user.user_metadata?.full_name || 
                         user.user_metadata?.name ||
                         (user.email ? user.email.split('@')[0] : 'Lit')
      
      profileMap.set(userId, {
        id: userId,
        display_name: displayName,
        pronouns: user.user_metadata?.pronouns || null,
        avatar_url: user.user_metadata?.avatar_url || null
      })
    } else {
      // For other users, try to get from profiles table first, then fallback
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, pronouns, avatar_url')
        .eq('id', userId)
        .single()
      
      if (profile) {
        profileMap.set(userId, profile)
      } else {
        // Fallback for missing profiles
        profileMap.set(userId, {
          id: userId,
          display_name: 'Space Whale',
          pronouns: null,
          avatar_url: null
        })
      }
    }
  }
  
  // Get current user for like status
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  // Transform the data to match the expected format
  return Promise.all(posts.map(async post => {
    const profile = profileMap.get(post.user_id)
    
    // Get like count, comment count, and user like status
    const [likesCount, commentsCount, isLiked] = await Promise.all([
      getLikeCount(post.id),
      getCommentCount(post.id),
      currentUser ? hasUserLikedPost(currentUser.id, post.id) : Promise.resolve(false)
    ])
    
    return {
      id: post.id,
      content: post.content,
      tags: post.tags || [],
      content_warning: post.content_warning_text,
      media_url: post.media_url,
      media_type: post.media_type,
      created_at: post.created_at,
      author: {
        id: post.user_id,
        display_name: profile?.display_name || 'Anonymous',
        pronouns: profile?.pronouns || null,
        avatar_url: profile?.avatar_url || null
      },
      likes_count: likesCount,
      comments_count: commentsCount,
      is_liked: isLiked
    }
  }))
}

export async function uploadPostMedia(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('posts')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('posts')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// ============================================
// COMMENT OPERATIONS
// ============================================

export async function createComment(userId: string, postId: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: userId,
      post_id: postId,
      content: content
    })
    .select('*')
    .single()
  
  if (error) throw error
  
  // Get user info from auth instead of profiles table
  const { data: { user } } = await supabase.auth.getUser()
  
  return {
    ...data,
    profiles: {
      display_name: user?.user_metadata?.display_name || 'Space Whale',
      pronouns: user?.user_metadata?.pronouns || null,
      avatar_url: user?.user_metadata?.avatar_url || null
    }
  }
}

// Helper function to ensure a profile exists for a user
async function ensureProfileExists(userId: string) {
  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', userId)
      .single()
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      console.log('Creating profile for user:', userId)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: 'Space Whale',
          pronouns: null,
          avatar_url: null
        })
      
      if (insertError) {
        console.error('Error creating profile:', insertError)
      }
    } else if (existingProfile && !existingProfile.display_name) {
      // Profile exists but no display name, update it
      await supabase
        .from('profiles')
        .update({ display_name: 'Space Whale' })
        .eq('id', userId)
    }
  } catch (error) {
    console.error('Error in ensureProfileExists:', error)
  }
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  
  if (!data || data.length === 0) {
    return []
  }
  
  // For now, use a simple approach - get current user and show their name
  // TODO: In the future, we can implement a proper profiles system
  const { data: { user } } = await supabase.auth.getUser()
  
  return data.map(comment => {
    // If it's the current user's comment, show their name
    // Otherwise, show a generic name
    const isCurrentUser = user && comment.user_id === user.id
    
    return {
      ...comment,
      profiles: {
        display_name: isCurrentUser 
          ? (user.user_metadata?.display_name || 'You')
          : 'Space Whale',
        pronouns: isCurrentUser 
          ? (user.user_metadata?.pronouns || null)
          : null,
        avatar_url: isCurrentUser 
          ? (user.user_metadata?.avatar_url || null)
          : null
      }
    }
  })
}

export async function getCommentCount(postId: string) {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  
  if (error) throw error
  return count || 0
}

export async function updateComment(commentId: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .update({ 
      content,
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId)
    .select('*')
    .single()
  
  if (error) throw error
  return data
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
  
  if (error) throw error
  return true
}

// ============================================
// LIKE OPERATIONS
// ============================================

export async function toggleLike(userId: string, postId: string) {
  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)
    
    if (error) throw error
    return { liked: false }
  } else {
    // Like
    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        post_id: postId
      })
      .select()
      .single()
    
    if (error) throw error
    return { liked: true, data }
  }
}

export async function getLikeCount(postId: string) {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  
  if (error) throw error
  return count || 0
}

export async function hasUserLikedPost(userId: string, postId: string) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single()
  
  return !!data
}

// ============================================
// WORKSHOP OPERATIONS
// ============================================

export async function getWorkshops(options: {
  upcomingOnly?: boolean
  registrationOpen?: boolean
} = {}) {
  let query = supabase
    .from('workshops')
    .select('*')
    .order('date', { ascending: true })

  if (options.upcomingOnly) {
    query = query.gte('date', new Date().toISOString())
  }

  if (options.registrationOpen) {
    query = query.eq('registration_open', true)
  }

  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function registerForWorkshop(userId: string, workshopId: string, registrationData: {
  email: string
  phone?: string
  accessibility_needs?: string
  is_ndis_participant?: boolean
  ndis_number?: string
  dietary_requirements?: string
}) {
  const { data, error } = await supabase
    .from('workshop_registrations')
    .insert({
      user_id: userId,
      workshop_id: workshopId,
      contact_email: registrationData.email,
      contact_phone: registrationData.phone,
      accessibility_needs: registrationData.accessibility_needs,
      is_ndis_participant: registrationData.is_ndis_participant,
      ndis_number: registrationData.ndis_number,
      dietary_requirements: registrationData.dietary_requirements
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUserRegistrations(userId: string) {
  const { data, error } = await supabase
    .from('workshop_registrations')
    .select(`
      *,
      workshops:workshop_id (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// ============================================
// ARCHIVE OPERATIONS
// ============================================

export async function createArchiveItem(item: {
  title: string
  description?: string
  content_type: 'video' | 'artwork' | 'zine' | 'audio'
  media_url: string
  thumbnail_url?: string
  artist_name?: string
  tags?: string[]
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('archive_items')
    .insert({
      user_id: user.id,
      title: item.title,
      description: item.description,
      content_type: item.content_type,
      media_url: item.media_url,
      thumbnail_url: item.thumbnail_url,
      artist_name: item.artist_name,
      tags: item.tags || [],
      is_approved: true
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getArchiveItems(options: {
  content_type?: string
  tags?: string[]
  limit?: number
} = {}) {
  let query = supabase
    .from('archive_items')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (options.content_type) {
    query = query.eq('content_type', options.content_type)
  }

  if (options.tags) {
    query = query.contains('tags', options.tags)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function uploadArchiveMedia(userId: string, file: File, contentType: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${userId}/${contentType}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('archive')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('archive')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// ============================================
// MODERATION OPERATIONS
// ============================================

export async function reportContent(userId: string, contentType: string, contentId: string, reason: string, context?: string) {
  const { data, error } = await supabase
    .from('content_reports')
    .insert({
      reporter_id: userId,
      content_type: contentType,
      content_id: contentId,
      reason: reason,
      additional_context: context
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

