import { uploadMedia, getMediaUrl, type MediaCategory } from './storage-client'

/**
 * Test function to verify storage setup works
 * Run this after setting up RLS policies
 */
export async function testStorageSetup(userId: string) {
  console.log('🧪 Testing Supabase Storage Setup...')
  console.log('User ID:', userId)
  
  try {
    const buckets: MediaCategory[] = ['avatars', 'posts', 'journal', 'archive']
    const results: any[] = []
    
    for (const bucket of buckets) {
      try {
        console.log(`\n📤 Testing upload to ${bucket} bucket...`)
        
        // Create a simple test image (1x1 pixel PNG)
        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, 1, 1)
        }
        
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Canvas to blob failed'))
          }, 'image/png')
        })
        
        const testFile = new File([blob], `test-${Date.now()}.png`, { 
          type: 'image/png' 
        })
        
        console.log(`📁 Test file created: ${testFile.name} (${testFile.size} bytes)`)
        
        const result = await uploadMedia(testFile, {
          category: bucket,
          filename: `test-${Date.now()}.png`
        }, userId)
        
        console.log(`✅ ${bucket} upload successful!`)
        console.log(`   URL: ${result.url}`)
        console.log(`   Path: ${result.path}`)
        
        results.push({ bucket, success: true, result })
        
        // Test 2: Get public URL
        const publicUrl = getMediaUrl(result.path, bucket)
        console.log(`🔗 Public URL: ${publicUrl}`)
        
        // Test 3: Verify URL is accessible
        try {
          const response = await fetch(publicUrl, { method: 'HEAD' })
          if (response.ok) {
            console.log(`✅ URL is accessible (${response.status})`)
          } else {
            console.log(`⚠️ URL returned ${response.status}`)
          }
        } catch (fetchError) {
          console.log(`⚠️ URL accessibility test failed:`, fetchError)
        }
        
        // Note: We don't delete test files in this version to keep them for verification
        console.log(`✅ Test file uploaded successfully to ${bucket}`)
        
      } catch (error: any) {
        console.error(`❌ ${bucket} test failed:`, error)
        console.error(`   Error message: ${error.message}`)
        console.error(`   Error details:`, error)
        results.push({ bucket, success: false, error: error.message, details: error })
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
      console.log('⚠️ Some tests failed. Check the error details above.')
      console.log('\n🔧 Troubleshooting tips:')
      console.log('1. Make sure you\'ve run the RLS policy SQL script')
      console.log('2. Check that SUPABASE_SERVICE_ROLE_KEY is set in .env.local')
      console.log('3. Verify the storage buckets exist in your Supabase dashboard')
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

