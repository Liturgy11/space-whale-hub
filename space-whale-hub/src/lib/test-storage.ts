import { uploadMedia, deleteMedia, getMediaUrl, type MediaCategory } from './storage'

/**
 * Test function to verify storage setup works
 * Run this after setting up RLS policies
 */
export async function testStorageSetup(userId: string) {
  console.log('🧪 Testing Supabase Storage Setup...')
  
  try {
    // Test 1: Upload a small test image to each bucket
    const testImage = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    const buckets: MediaCategory[] = ['avatars', 'posts', 'journal', 'archive']
    const results: any[] = []
    
    for (const bucket of buckets) {
      try {
        console.log(`📤 Testing upload to ${bucket}...`)
        
        // Create a simple test file
        const testFile = new File(['test content'], `test-${Date.now()}.txt`, { 
          type: 'text/plain' 
        })
        
        const result = await uploadMedia(testFile, {
          category: bucket,
          filename: `test-${Date.now()}.txt`
        }, userId)
        
        console.log(`✅ ${bucket} upload successful:`, result.url)
        results.push({ bucket, success: true, result })
        
        // Test 2: Get public URL
        const publicUrl = getMediaUrl(result.path, bucket)
        console.log(`🔗 Public URL for ${bucket}:`, publicUrl)
        
        // Test 3: Delete the test file
        await deleteMedia(result.path, bucket, userId)
        console.log(`🗑️ Deleted test file from ${bucket}`)
        
      } catch (error) {
        console.error(`❌ ${bucket} test failed:`, error)
        results.push({ bucket, success: false, error: error.message })
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`\n📊 Storage Test Results:`)
    console.log(`✅ Successful: ${successful}/${buckets.length}`)
    console.log(`❌ Failed: ${failed}/${buckets.length}`)
    
    if (failed === 0) {
      console.log('🎉 All storage tests passed! Ready to migrate from base64.')
    } else {
      console.log('⚠️ Some tests failed. Check RLS policies and bucket setup.')
    }
    
    return results
    
  } catch (error) {
    console.error('💥 Storage test failed:', error)
    throw error
  }
}

/**
 * Test image upload specifically
 */
export async function testImageUpload(userId: string) {
  console.log('🖼️ Testing image upload...')
  
  try {
    // Create a simple test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx!.fillStyle = '#000000'
    ctx!.fillRect(0, 0, 1, 1)
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        const testImage = new File([blob], 'test.png', { type: 'image/png' })
        
        const result = await uploadMedia(testImage, {
          category: 'journal',
          filename: 'test-image.png'
        }, userId)
        
        console.log('✅ Image upload successful:', result.url)
        
        // Clean up
        await deleteMedia(result.path, 'journal', userId)
        console.log('🗑️ Test image deleted')
      }
    }, 'image/png')
    
  } catch (error) {
    console.error('❌ Image upload test failed:', error)
    throw error
  }
}
