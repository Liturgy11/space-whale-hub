// Utility functions to manage localStorage and prevent quota exceeded errors

export const clearSupabaseStorage = () => {
  try {
    // Clear all Supabase-related localStorage items
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('sb-'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    console.log('Cleared Supabase storage items:', keysToRemove.length)
    return true
  } catch (error) {
    console.error('Error clearing storage:', error)
    return false
  }
}

export const getStorageUsage = () => {
  try {
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += key.length + value.length
        }
      }
    }
    return {
      totalSize,
      itemCount: localStorage.length,
      sizeInMB: (totalSize / (1024 * 1024)).toFixed(2)
    }
  } catch (error) {
    console.error('Error getting storage usage:', error)
    return { totalSize: 0, itemCount: 0, sizeInMB: '0' }
  }
}

export const clearAllStorage = () => {
  try {
    localStorage.clear()
    console.log('Cleared all localStorage')
    return true
  } catch (error) {
    console.error('Error clearing all storage:', error)
    return false
  }
}


