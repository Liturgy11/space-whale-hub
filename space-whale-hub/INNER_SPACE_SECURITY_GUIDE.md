# Inner Space Journal Security Guide

## Overview

This document outlines the comprehensive security measures implemented for Inner Space journal entries, which contain users' private thoughts and sensitive personal information.

## Current Security Status

### ✅ Implemented
- **Row Level Security (RLS)** - Users can only access their own journal entries
- **Private by Default** - All entries are private (`is_private = true`)
- **Secure API Routes** - Service role authentication for server-side operations
- **User Authentication** - All operations require authenticated users

### 🔄 To Be Implemented (Phase 1.5)
- **Content Encryption** - Encrypt sensitive content at rest
- **Access Logging** - Track all access to journal entries
- **Audit Trail** - Complete history of all changes
- **Data Retention Policies** - User-controlled data lifecycle
- **Enhanced RLS Policies** - Additional security layers

## Security Architecture

### 1. Database-Level Security

#### Row Level Security (RLS)
- **Purpose**: Ensures users can ONLY see their own journal entries
- **Implementation**: PostgreSQL RLS policies on `journal_entries` table
- **Policy**: `auth.uid() = user_id` for all operations (SELECT, INSERT, UPDATE, DELETE)

#### Encryption Support
- **Column**: `content_encrypted` (BYTEA) for encrypted content
- **Column**: `is_encrypted` (BOOLEAN) to flag encrypted entries
- **Column**: `encryption_key_id` (TEXT) for key management
- **Note**: Encryption should be done **client-side** before sending to server

### 2. Access Logging

#### Purpose
- Track who accesses what data and when
- Detect unauthorized access attempts
- Security auditing and compliance

#### Implementation
- **Table**: `journal_access_logs`
- **Fields**: entry_id, user_id, action, ip_address, user_agent, timestamp
- **Logging**: All view, create, update, delete operations

### 3. Audit Trail

#### Purpose
- Complete history of all changes to journal entries
- Track what changed, when, and by whom
- Support security investigations

#### Implementation
- **Table**: `journal_audit_trail`
- **Fields**: entry_id, user_id, action, old_values, new_values, changed_fields
- **Trigger**: Automatic logging on all INSERT, UPDATE, DELETE operations

### 4. Data Retention

#### Purpose
- User control over data lifecycle
- Automatic cleanup of expired entries
- Compliance with data retention requirements

#### Implementation
- **Column**: `retention_policy` (indefinite, 1year, 6months, 30days)
- **Column**: `auto_delete_at` (calculated timestamp)
- **Column**: `is_soft_deleted` (soft delete flag)
- **Function**: `cleanup_expired_journal_entries()` for scheduled cleanup

## Implementation Steps

### Step 1: Run Security Enhancement SQL
```bash
# Run the security enhancement script in Supabase SQL Editor
psql -f inner-space-security-enhancement.sql
```

### Step 2: Update API Routes

#### Add Access Logging
Update all journal API routes to log access:

```typescript
// In create-journal-entry-secure/route.ts
import { logJournalAccess } from '@/lib/security'

// After creating entry
await logJournalAccess({
  entryId: data.id,
  userId: userId,
  action: 'create',
  ipAddress: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent')
})
```

#### Add Encryption Support
Update API routes to handle encrypted content:

```typescript
// Check if content is encrypted
if (isEncrypted) {
  // Store in content_encrypted column
  // Don't store in plain text content column
}
```

### Step 3: Client-Side Encryption (Optional but Recommended)

For maximum security, implement client-side encryption:

```typescript
// lib/journal-encryption.ts
import { encrypt, decrypt } from '@/lib/crypto-utils'

export async function encryptJournalContent(
  content: string,
  userPassword: string
): Promise<{ encrypted: string, keyId: string }> {
  // Derive encryption key from user password
  // Encrypt content using Web Crypto API
  // Return encrypted content and key ID
}

export async function decryptJournalContent(
  encrypted: string,
  userPassword: string,
  keyId: string
): Promise<string> {
  // Decrypt content using derived key
  // Return plain text
}
```

### Step 4: Update Components

#### JournalEntryForm
- Add encryption toggle option
- Handle encrypted content display
- Show encryption status

#### JournalList
- Display encryption indicators
- Handle decryption on view

### Step 5: Set Up Scheduled Cleanup

Configure Supabase Edge Function or external cron job:

```typescript
// supabase/functions/cleanup-journal-entries/index.ts
import { createClient } from '@supabase/supabase-js'

export default async function handler() {
  const supabase = createClient(...)
  
  // Call cleanup function
  const { data } = await supabase.rpc('cleanup_expired_journal_entries')
  
  return new Response(JSON.stringify({ deleted: data }))
}
```

## Security Best Practices

### 1. Never Log Sensitive Content
- Don't log journal content in server logs
- Don't include content in error messages
- Use entry IDs for logging, not content

### 2. Secure API Routes
- Always validate `userId` matches authenticated user
- Use service role only for server-side operations
- Never trust client-provided user IDs

### 3. Encryption Key Management
- **Never store encryption keys on server**
- Derive keys from user password (client-side)
- Consider using Supabase Vault for production key management
- Implement key rotation strategy

### 4. Access Control
- Log all access attempts
- Monitor for suspicious patterns
- Alert on multiple failed access attempts

### 5. Data Retention
- Respect user retention preferences
- Provide clear UI for retention settings
- Warn users before automatic deletion

## Compliance Considerations

### Australian Privacy Principles (APP)
- ✅ **APP 1**: Open and transparent management of personal information
- ✅ **APP 3**: Collection of solicited personal information
- ✅ **APP 6**: Use or disclosure of personal information
- ✅ **APP 7**: Direct marketing (N/A - no marketing)
- ✅ **APP 8**: Cross-border disclosure (data stays in Australia)
- ✅ **APP 11**: Security of personal information
- ✅ **APP 12**: Access to personal information (users can export)
- ✅ **APP 13**: Correction of personal information (users can edit)

### GDPR Compliance
- ✅ **Right to Access**: Users can view all their data
- ✅ **Right to Rectification**: Users can edit entries
- ✅ **Right to Erasure**: Users can delete entries
- ✅ **Right to Data Portability**: Export functionality
- ✅ **Data Minimization**: Only collect necessary data
- ✅ **Purpose Limitation**: Data used only for journaling
- ✅ **Storage Limitation**: User-controlled retention

## Monitoring & Alerts

### Recommended Monitoring
1. **Access Log Review**: Weekly review of access logs
2. **Failed Access Attempts**: Alert on multiple failures
3. **Unusual Access Patterns**: Alert on access from new locations
4. **Audit Trail Review**: Monthly review of audit trail
5. **Data Retention Compliance**: Verify cleanup jobs running

### Alert Thresholds
- 5+ failed access attempts in 1 hour
- Access from 3+ different IPs in 1 hour
- Access to 50+ entries in 1 hour
- Any admin access to journal entries

## User Education

### Privacy Settings UI
- Clear explanation of encryption options
- Data retention policy selector
- Access log viewer (user's own logs)
- Export data functionality

### Help Documentation
- How encryption works
- How to set retention policies
- How to export data
- How to permanently delete data

## Testing Checklist

### Security Testing
- [ ] Verify RLS policies prevent cross-user access
- [ ] Test encryption/decryption flow
- [ ] Verify access logging works
- [ ] Test audit trail creation
- [ ] Verify data retention cleanup
- [ ] Test soft delete functionality
- [ ] Verify API route security
- [ ] Test error handling (no sensitive data leaks)

### Compliance Testing
- [ ] Verify data export includes all fields
- [ ] Test data deletion removes all traces
- [ ] Verify retention policies work correctly
- [ ] Test access log privacy (users see only their own)

## Future Enhancements

### Phase 2 Security Features
- [ ] Two-factor authentication (2FA)
- [ ] Session management and timeout
- [ ] IP whitelisting option
- [ ] Device management
- [ ] Suspicious activity detection
- [ ] Automated security alerts
- [ ] Penetration testing
- [ ] Security audit by third party

## Support & Questions

For security concerns or questions:
- Review this guide
- Check Supabase security documentation
- Consult with security expert if needed
- Document any security incidents

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Status**: Implementation Ready

