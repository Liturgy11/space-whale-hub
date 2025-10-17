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
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content: post.content,
      tags: post.tags || [],
      content_warning: post.content_warning
    })
    .select(`
      *,
      profiles:user_id (display_name, pronouns, avatar_url)
    `)
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
    .select(`
      *,
      profiles:user_id (display_name, pronouns, avatar_url),
      likes:likes(count),
      comments:comments(count)
    `)
    .order('created_at', { ascending: false })

  if (options.tags) {
    query = query.contains('tags', options.tags)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  
  if (error) throw error
  
  // Transform the data to match the expected format
  return data?.map(post => ({
    id: post.id,
    content: post.content,
    tags: post.tags || [],
    content_warning: post.content_warning,
    created_at: post.created_at,
    author: {
      id: post.user_id,
      display_name: post.profiles?.display_name || 'Anonymous',
      pronouns: post.profiles?.pronouns,
      avatar_url: post.profiles?.avatar_url
    },
    likes_count: post.likes?.[0]?.count || 0,
    comments_count: post.comments?.[0]?.count || 0,
    is_liked: false // TODO: Implement user-specific like status
  })) || []
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
    .select(`
      *,
      profiles:user_id (display_name, pronouns, avatar_url)
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (display_name, pronouns, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
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

export async function createArchiveItem(userId: string, item: {
  title: string
  description?: string
  content_type: string
  media_url: string
  thumbnail_url?: string
  artist_name?: string
  tags?: string[]
}) {
  const { data, error } = await supabase
    .from('archive_items')
    .insert({
      user_id: userId,
      title: item.title,
      description: item.description,
      content_type: item.content_type,
      media_url: item.media_url,
      thumbnail_url: item.thumbnail_url,
      artist_name: item.artist_name,
      tags: item.tags || []
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
    .select(`
      *,
      profiles:user_id (display_name, avatar_url)
    `)
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
  return data
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
