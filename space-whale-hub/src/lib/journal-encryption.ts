/**
 * Client-side encryption for journal entries
 * Uses Web Crypto API for secure encryption/decryption
 * Keys are derived from user passphrase and never stored on server
 */

// Generate a random salt for key derivation
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}

// Derive encryption key from user passphrase using PBKDF2
async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Ensure salt is a proper BufferSource (Uint8Array is valid)
  const saltBuffer: BufferSource = new Uint8Array(salt)
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Convert ArrayBuffer or Uint8Array to base64 string for storage
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert base64 string to Uint8Array
function base64ToArrayBuffer(base64: string | Uint8Array | ArrayBuffer): Uint8Array {
  // Handle different input formats
  let base64String: string
  
  // If it's already a Uint8Array or ArrayBuffer, return as is
  if (base64 instanceof Uint8Array) {
    return base64
  }
  if (base64 instanceof ArrayBuffer) {
    return new Uint8Array(base64)
  }
  
  // Convert to string if needed
  if (typeof base64 !== 'string') {
    base64String = String(base64)
  } else {
    base64String = base64
  }
  
  // Remove any whitespace or newlines
  base64String = base64String.trim().replace(/\s/g, '')
  
  // Handle hex format (if database returns BYTEA as hex)
  if (base64String.startsWith('\\x')) {
    // Convert hex string to base64
    const hexString = base64String.slice(2) // Remove '\x' prefix
    const bytes = new Uint8Array(hexString.length / 2)
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
    }
    return bytes
  }
  
  try {
    const binary = atob(base64String)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  } catch (error) {
    throw new Error(`Invalid base64 string: ${error}`)
  }
}

/**
 * Encrypt journal content
 * @param content - Plain text content to encrypt
 * @param passphrase - User's encryption passphrase
 * @returns Object with encrypted content, salt, and IV (initialization vector)
 */
export async function encryptJournalContent(
  content: string,
  passphrase: string
): Promise<{
  encrypted: string
  salt: string
  iv: string
  keyId: string
}> {
  if (!passphrase || passphrase.length < 8) {
    throw new Error('Passphrase must be at least 8 characters long')
  }

  // Generate salt and IV
  const salt = generateSalt()
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 12 bytes for AES-GCM

  // Derive encryption key from passphrase
  const key = await deriveKey(passphrase, salt)

  // Encrypt content
  const encoder = new TextEncoder()
  const data = encoder.encode(content)

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  )

  // Convert to base64 for storage
  const encrypted = arrayBufferToBase64(encryptedData)
  const saltBase64 = arrayBufferToBase64(salt)
  const ivBase64 = arrayBufferToBase64(iv)

  // Generate a key ID (hash of salt + timestamp for uniqueness)
  const keyId = arrayBufferToBase64(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(saltBase64 + Date.now().toString()))
  ).substring(0, 16) // Use first 16 chars as key ID

  return {
    encrypted,
    salt: saltBase64,
    iv: ivBase64,
    keyId
  }
}

/**
 * Decrypt journal content
 * @param encrypted - Encrypted content (base64)
 * @param passphrase - User's encryption passphrase
 * @param salt - Salt used for key derivation (base64)
 * @param iv - Initialization vector (base64)
 * @returns Decrypted plain text content
 */
// Helper function to convert hex string (from BYTEA) to base64
function hexToBase64(hex: string): string {
  // Remove \x prefix if present
  const cleanHex = hex.replace(/^\\x/, '').replace(/\\x/g, '')
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16)
  }
  // Convert to base64
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Helper function to detect and convert data format
function normalizeEncryptedData(data: any): string {
  if (!data) {
    throw new Error('Encrypted data is empty')
  }
  
  // If it's already a string
  if (typeof data === 'string') {
    const trimmed = data.trim()
    
    // Remove any whitespace/newlines
    const cleaned = trimmed.replace(/\s/g, '')
    
    // Check if it's a hex string (BYTEA format from PostgreSQL) - starts with \x
    if (cleaned.startsWith('\\x')) {
      console.log('Detected hex format (BYTEA), converting to base64')
      return hexToBase64(cleaned)
    }
    
    // Check if it looks like hex (all hex characters, even length)
    const hexPattern = /^[0-9a-fA-F]+$/
    if (hexPattern.test(cleaned) && cleaned.length % 2 === 0 && cleaned.length > 20) {
      console.log('Detected hex format (no prefix), converting to base64')
      return hexToBase64('\\x' + cleaned)
    }
    
    // Assume it's base64 - validate it looks like base64
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
    if (!base64Pattern.test(cleaned)) {
      console.warn('Data does not look like base64 or hex:', cleaned.substring(0, 50))
    }
    
    return cleaned
  }
  
  // If it's a Uint8Array or ArrayBuffer, convert to base64
  if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
  
  throw new Error(`Unsupported encrypted data format: ${typeof data}`)
}

export async function decryptJournalContent(
  encrypted: string,
  passphrase: string,
  salt: string,
  iv: string
): Promise<string> {
  if (!passphrase) {
    throw new Error('Passphrase is required for decryption')
  }

  if (!encrypted || !salt || !iv) {
    throw new Error('Missing encryption data. Encrypted content, salt, and IV are required.')
  }

  try {
    // Log the raw data we received
    console.log('Raw encryption data received:', {
      encryptedType: typeof encrypted,
      encryptedLength: encrypted?.length,
      encryptedFirst50: typeof encrypted === 'string' ? encrypted.substring(0, 50) : 'not a string',
      saltType: typeof salt,
      saltLength: salt?.length,
      saltFirst20: typeof salt === 'string' ? salt.substring(0, 20) : 'not a string',
      ivType: typeof iv,
      ivLength: iv?.length,
      ivFirst20: typeof iv === 'string' ? iv.substring(0, 20) : 'not a string'
    })
    
    // Normalize the encrypted data (handle BYTEA hex format from database)
    let normalizedEncrypted: string
    let normalizedSalt: string
    let normalizedIv: string
    
    try {
      normalizedEncrypted = normalizeEncryptedData(encrypted)
      normalizedSalt = normalizeEncryptedData(salt)
      normalizedIv = normalizeEncryptedData(iv)
    } catch (normalizeError: any) {
      console.error('Data normalization error:', {
        error: normalizeError?.message,
        encryptedType: typeof encrypted,
        saltType: typeof salt,
        ivType: typeof iv,
        encryptedPreview: typeof encrypted === 'string' ? encrypted.substring(0, 100) : String(encrypted),
        saltPreview: typeof salt === 'string' ? salt.substring(0, 50) : String(salt),
        ivPreview: typeof iv === 'string' ? iv.substring(0, 50) : String(iv)
      })
      throw new Error(`Invalid encryption data format: ${normalizeError?.message || 'Unable to normalize encrypted data'}`)
    }
    
    console.log('Normalized encryption data:', {
      normalizedEncryptedLength: normalizedEncrypted.length,
      normalizedEncryptedFirst50: normalizedEncrypted.substring(0, 50),
      normalizedSaltLength: normalizedSalt.length,
      normalizedSaltFirst20: normalizedSalt.substring(0, 20),
      normalizedIvLength: normalizedIv.length,
      normalizedIvFirst20: normalizedIv.substring(0, 20)
    })

    // Convert from base64
    let saltArray: Uint8Array
    let ivArray: Uint8Array
    let encryptedArray: Uint8Array

    try {
      saltArray = base64ToArrayBuffer(normalizedSalt)
      ivArray = base64ToArrayBuffer(normalizedIv)
      encryptedArray = base64ToArrayBuffer(normalizedEncrypted)
      
      console.log('Converted to arrays:', {
        saltArrayLength: saltArray.length,
        ivArrayLength: ivArray.length,
        encryptedArrayLength: encryptedArray.length
      })
    } catch (base64Error: any) {
      console.error('Base64 decoding error:', {
        error: base64Error,
        errorMessage: base64Error?.message,
        errorName: base64Error?.name,
        normalizedEncryptedLength: normalizedEncrypted.length,
        normalizedSaltLength: normalizedSalt.length,
        normalizedIvLength: normalizedIv.length
      })
      throw new Error('Invalid encryption data format. The encrypted content may be corrupted or double-encoded.')
    }

    // Validate array lengths
    if (saltArray.length !== 16) {
      console.error('Invalid salt length:', {
        expected: 16,
        actual: saltArray.length,
        normalizedSalt: normalizedSalt.substring(0, 30),
        originalSalt: typeof salt === 'string' ? salt.substring(0, 30) : String(salt)
      })
      throw new Error(`Invalid salt length: expected 16 bytes, got ${saltArray.length}. The encryption data may be corrupted or in an unexpected format.`)
    }
    if (ivArray.length !== 12) {
      console.error('Invalid IV length:', {
        expected: 12,
        actual: ivArray.length,
        normalizedIv: normalizedIv.substring(0, 30),
        originalIv: typeof iv === 'string' ? iv.substring(0, 30) : String(iv)
      })
      throw new Error(`Invalid IV length: expected 12 bytes, got ${ivArray.length}. The encryption data may be corrupted or in an unexpected format.`)
    }
    if (encryptedArray.length === 0) {
      console.error('Encrypted data is empty after normalization')
      throw new Error('Encrypted data is empty. The entry may not have been encrypted properly.')
    }
    
    // Additional validation: encrypted data should be at least 16 bytes (minimum for AES-GCM with tag)
    if (encryptedArray.length < 16) {
      console.error('Encrypted data too short:', {
        length: encryptedArray.length,
        expected: 'at least 16 bytes'
      })
      throw new Error('Encrypted data appears to be corrupted (too short).')
    }
    
    console.log('All validations passed, attempting decryption...')

    // Derive the same key from passphrase and salt
    const key = await deriveKey(passphrase, saltArray)

    // Decrypt content
    let decryptedData: ArrayBuffer
    try {
      console.log('Attempting decryption with:', {
        keyAlgorithm: 'AES-GCM',
        ivLength: ivArray.length,
        encryptedDataLength: encryptedArray.length,
        keyLength: '256 bits'
      })
      
      // Ensure iv and encrypted data are proper BufferSource types
      const ivBuffer: BufferSource = new Uint8Array(ivArray)
      const encryptedBuffer: BufferSource = new Uint8Array(encryptedArray)
      
      decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBuffer
        },
        key,
        encryptedBuffer
      )
      
      console.log('Decryption successful! Decrypted data length:', decryptedData.byteLength)
    } catch (decryptError: unknown) {
      // DOMException doesn't serialize well, so we need to extract properties manually
      let errorName = 'UnknownError'
      let errorMessage = 'Unknown error'
      let errorCode: number | undefined
      
      if (decryptError instanceof DOMException) {
        // Extract properties directly - use try-catch to safely access
        let domName: string | undefined
        let domMessage: string | undefined
        let domCode: number | undefined
        
        try {
          domName = decryptError.name
        } catch (e) {
          domName = 'DOMException (name inaccessible)'
        }
        
        try {
          domMessage = decryptError.message
        } catch (e) {
          domMessage = 'DOMException (message inaccessible)'
        }
        
        try {
          domCode = decryptError.code
        } catch (e) {
          // code might be undefined
        }
        
        errorName = domName || 'DOMException'
        errorMessage = domMessage || 'DOMException occurred'
        errorCode = domCode
        
        // Log DOMException properties explicitly - use console.error for each
        console.error('=== DOMException Details ===')
        console.error('Error Name:', domName)
        console.error('Error Message:', domMessage)
        console.error('Error Code:', domCode)
        
        // Try to get string representation
        try {
          console.error('Error toString():', decryptError.toString())
        } catch (e) {
          console.error('Could not call toString() on error')
        }
        
        // Try to access via bracket notation
        try {
          const errorObj = decryptError as any
          console.error('Error via bracket notation:', {
            'name': errorObj['name'],
            'message': errorObj['message'],
            'code': errorObj['code']
          })
        } catch (e) {
          console.error('Could not access error via bracket notation')
        }
        
        // Try Object.getOwnPropertyNames
        try {
          const props = Object.getOwnPropertyNames(decryptError)
          console.error('Error property names:', props)
          const descriptors: any = {}
          props.forEach(prop => {
            try {
              descriptors[prop] = Object.getOwnPropertyDescriptor(decryptError, prop)?.value
            } catch (e) {
              descriptors[prop] = 'inaccessible'
            }
          })
          console.error('Error property values:', descriptors)
        } catch (e) {
          console.error('Could not enumerate error properties')
        }
        
        console.error('===========================')
      } else if (decryptError instanceof Error) {
        errorName = decryptError.name || 'Error'
        errorMessage = decryptError.message || 'Error occurred'
        console.error('Error caught:', {
          name: decryptError.name,
          message: decryptError.message,
          stack: decryptError.stack
        })
      } else {
        // Try to extract what we can
        const errorStr = String(decryptError)
        errorMessage = errorStr
        console.error('Unknown error type:', {
          type: typeof decryptError,
          string: errorStr,
          error: decryptError
        })
      }
      
      // Log detailed error information for debugging
      const errorDetails: any = {
        errorName,
        errorMessage,
        errorType: typeof decryptError,
        encryptedLength: encryptedArray.length,
        saltLength: saltArray.length,
        ivLength: ivArray.length,
        encryptedPreview: typeof encrypted === 'string' ? encrypted.substring(0, 50) : 'not a string',
        saltPreview: typeof salt === 'string' ? salt.substring(0, 20) : 'not a string',
        ivPreview: typeof iv === 'string' ? iv.substring(0, 20) : 'not a string'
      }
      
      if (errorCode !== undefined) {
        errorDetails.errorCode = errorCode
      }
      
      // Try to get more info from the error object directly
      try {
        if (decryptError != null && typeof decryptError === 'object') {
          const errorObj = decryptError as any
          errorDetails.errorKeys = Object.keys(errorObj)
          errorDetails.errorString = String(decryptError)
          if (errorObj.stack) {
            errorDetails.errorStack = errorObj.stack.substring(0, 200) // Limit stack trace length
          }
          // Try to access common error properties
          if (errorObj.toString) {
            errorDetails.errorToString = errorObj.toString()
          }
        } else if (decryptError != null) {
          errorDetails.errorPrimitive = String(decryptError)
        }
      } catch (e) {
        errorDetails.inspectionError = String(e)
      }
      
      // Always log error details - expand the object to show all properties
      console.error('Crypto decrypt error details:', JSON.stringify(errorDetails, null, 2))
      console.error('Full error object (attempting to serialize):', {
        errorType: typeof decryptError,
        errorConstructor: decryptError?.constructor?.name,
        errorString: String(decryptError),
        // Try to get all enumerable properties
        errorKeys: decryptError && typeof decryptError === 'object' ? Object.keys(decryptError) : [],
        // Try JSON.stringify (might fail but worth trying)
        errorJSON: (() => {
          try {
            return JSON.stringify(decryptError)
          } catch {
            return 'Could not stringify error'
          }
        })()
      })
      
      // Check for specific error types
      if (errorName === 'OperationError' || errorName.includes('OperationError') || errorMessage.includes('operation')) {
        throw new Error('Decryption failed. This usually means the passphrase is incorrect, or the encrypted data is corrupted. Please verify you are using the correct passphrase that was used when encrypting this entry.')
      }
      
      throw new Error(`Decryption failed: ${errorMessage}. Please check your passphrase.`)
    }

    // Convert back to string
    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error: any) {
    // Provide more specific error messages
    if (error.message && error.message.includes('Decryption failed')) {
      // Re-throw our custom error messages
      throw error
    }
    if (error.message && error.message.includes('decrypt')) {
      // This is likely a passphrase mismatch
      console.error('Decryption failed - possible causes:', {
        error: error.message,
        errorName: error?.name,
        hasEncrypted: !!encrypted,
        hasSalt: !!salt,
        hasIv: !!iv,
        encryptedLength: encrypted?.length,
        saltLength: salt?.length,
        ivLength: iv?.length
      })
      throw new Error('Failed to decrypt content. Please check your passphrase - it may be incorrect.')
    }
    // Re-throw with original message if it's already a user-friendly error
    if (error.message && !error.message.includes('Failed to decrypt')) {
      throw error
    }
    throw new Error('Failed to decrypt content. Please check your passphrase.')
  }
}

/**
 * Check if content is encrypted
 */
export function isEncrypted(entry: {
  is_encrypted?: boolean
  content_encrypted?: string | null
}): boolean {
  return entry.is_encrypted === true && !!entry.content_encrypted
}

/**
 * Get encryption status message
 */
export function getEncryptionStatus(entry: {
  is_encrypted?: boolean
  content_encrypted?: string | null
}): string {
  if (isEncrypted(entry)) {
    return '🔒 Encrypted'
  }
  return '🔓 Not encrypted'
}

