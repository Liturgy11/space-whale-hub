// Immediate localStorage cleanup to fix quota exceeded errors

export const emergencyStorageCleanup = () => {
  try {
    // Clear all localStorage immediately
    localStorage.clear()
    console.log('Emergency storage cleanup completed')
    return true
  } catch (error) {
    console.error('Emergency cleanup failed:', error)
    return false
  }
}

// Force clear storage on any quota error
export const forceStorageCleanup = () => {
  try {
    // Clear everything
    localStorage.clear()
    sessionStorage.clear()
    
    // Also try to clear any indexedDB if it exists
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      try {
        indexedDB.deleteDatabase('supabase')
      } catch (e) {
        // Ignore errors
      }
    }
    
    console.log('Force storage cleanup completed')
    return true
  } catch (error) {
    console.error('Force cleanup failed:', error)
    return false
  }
}

// Check if we need to clear storage
export const checkAndFixStorage = () => {
  try {
    // Get current storage usage
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
    
    const sizeInMB = totalSize / (1024 * 1024)
    
    // If storage is over 4MB, clear it
    if (sizeInMB > 4) {
      console.log(`Storage too large (${sizeInMB.toFixed(2)}MB), clearing...`)
      emergencyStorageCleanup()
      return true
    }
    
    return false
  } catch (error) {
    console.error('Storage check failed:', error)
    // If we can't check, clear anyway to be safe
    emergencyStorageCleanup()
    return true
  }
}
