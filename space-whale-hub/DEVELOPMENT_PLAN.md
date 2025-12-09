# Space Whale Portal - Development Plan

## Project Overview
A trauma-informed, neuroaffirming, gender-affirming digital sanctuary for creative expression, healing, and community connection. Built for LGBTIQA+ folks, NDIS participants, and anyone seeking a safe space for creative journey work.

## Current Status ✅
- **COMPLETE REBRAND** - Space Whale Hub → Space Whale Portal
- **AUTHENTIC VOICE INTEGRATION** - Lit's therapeutic voice and creative philosophy embedded throughout
- **GARDEN/NATURE METAPHORS** - Permission-giving, invitation-based language
- **COMPLETE AUTHENTICATION SYSTEM** - Supabase integration with user profiles
- **PERSONAL SPACE** - Journal entries with mood tracking and media uploads
- **COMMUNITY PORTAL** - Post creation, display, and media sharing with auto-refresh
- **COMPREHENSIVE STORAGE INFRASTRUCTURE** - Supabase Storage buckets, unified upload system, RLS policies, local fallback
- **DATABASE SCHEMA** - Complete with proper relationships and RLS policies
- **TRAUMA-INFORMED UI** - Neuroaffirming design with content warnings
- **RESPONSIVE DESIGN** - Mobile-first approach
- **PRIVACY & SAFETY FOUNDATION** - RLS policies and user data isolation
- **VOICE-ALIGNED COPY** - All text reflects authentic therapeutic approach
- **GARDEN INVITATIONS** - Creative prompts transformed to embodied, permission-giving language
- **ARCHIVE SYSTEM** - Upload and display creative work with link sharing for large files
- **UNIFIED CREATE BUTTON** - Main page Create button with dropdown for all content types
- **AUS/UK ENGLISH** - Consistent spelling throughout (honoured, etc.)
- **MOBILE NAVIGATION** - Beautiful bottom navigation bar for mobile users
- **ARCHIVE ENHANCEMENTS** - Larger images, edit functionality, delete functionality
- **DEPLOYMENT READY** - All core features working, mobile optimized, production ready

### 🎨 Visual Design & Brand Integration (Latest Update)
- **SPACE WHALE BRAND COLORS** - Integrated throughout with CSS variables
- **COSMIC TYPOGRAPHY** - Poppins (headings), Inter (body), Quicksand (accents)
- **INDIE/LOFI AESTHETIC** - Soft, minimal, cosmic but cozy design language
- **COSMIC NAMING SYSTEM** - Community Orbit, Inner Space, Deep Space, The Archive
- **TRANS FLAG ICONS** - Cosmic icons with trans colors (Star, Orbit, Sparkles, Heart)
- **FLOATING ANIMATIONS** - Gentle cosmic animations for visual appeal
- **RAINBOW BORDERS** - Soft rainbow borders and glow effects
- **CLEAN READABILITY** - White background with navy/purple text for accessibility
- **CREATE BUTTON UX** - Moved to main page to prevent cutoff, better positioning

## Strategic Vision & Key Themes 🌟

### 1. Ethical Framework
- **AI transparency**: All AI features must be opt-in with clear FAQs
- **Content attribution**: Credit sources, share learning process
- **Client involvement**: Check in about getting feedback from therapy clients
- **ND/creative/ethical clients**: Deep thinkers who care about AI ethics, copyright, electricity use

### 2. Core Use Cases (Why People Would Come)
- **Workshop/class registration** (e.g., In Our Nature, Creative Project Club)
- **Private digital journal** with photo uploads - feels "tumblr myspace indie queer kinda lofi"
- **Safe(r) community sharing** - not Meta/X, for vulnerable work
- **Connect with ND queers**, poetry/nature lovers, healing/liberation folks
- **Be witnessed in creative journey**

### 3. Portal Structure (Still Evolving) ✨
#### Current Implementation:
- **Community Orbit** ✨ (formerly Community Feed)
- **The Archive** ✨ (workshops, Pride Poetry videos, past events, qi gong, meditation)
- **Inner Space** ✨ (formerly Inner Garden) - private journal
- **Deep Space** ✨ (formerly Workshops) - for workshops/courses

#### Future Considerations:
- **Meeting Place** (or Landing Place) - for workshops/courses (invite-only?)
- **Outer Space** - ?

#### Features:
- Creative prompts/activities (curated community)
- Journaling questions
- Workshop photos, resources
- Digital books/zines from community

### 4. Safety & Access
- **Invite code to register** (gatekeeper against spam, keep it safe)
- **Opt-in/out of notifications** (likely email)
- **Moderation concerns**: How committed can you be over time? Set expectations about response times

### 5. AI Concerns (From Your Clients)
- Copyright/artist exploitation
- Electricity use (environmental)
- Ethics of use
- **Your response**: Transparency, opt-in only, clear disclaimers

#### Future: Space Whale AI Companion
- For inquiry & deeper understanding
- Clear limits: "Don't make major life decisions w/out talking to a human"
- Safety: Flag harm to self/others

### 6. Monetization Ideas
- **Free**: Basic access, community, journal
- **Paid**: Workshops, courses (via Stripe)
- **Scholarship fund**: "Pay it forward"
- **Sponsor a trans/ND person** for subsidized therapy
- **Future**: Invite practitioners to host (they can monetize)
- **Substack integration** - somehow?

### 7. Expansion Vision
- **Invite friends/colleagues** to host workshops
- **Community members** can eventually offer workshops
- **Opportunity to monetize** for other practitioners
- **The Nest, The Network** (community building)
- **"We dream/idream"** (holodeck?) - digital books, zines
- **Filmmaking/screencraft** remain somehow?
- **Web 3 integration** and ability to mint art as NFT much further down the track and if wanted by the community

## ⚠️ Temporary Solutions & Known Issues

### 🔴 Password Reset Flow (IN PROGRESS - Needs Resolution)
- **Status**: Partially implemented, not fully working
- **What We Built Today**:
  - ✅ **Resend SMTP Integration** - Set up custom SMTP with Resend service
  - ✅ **Custom Domain Email** - Configured `hello@spacewhale.com.au` for sending emails
  - ✅ **Domain Verification** - Verified `spacewhale.com.au` domain in Resend with DNS records
  - ✅ **Supabase SMTP Configuration** - Connected Supabase to Resend SMTP
  - ✅ **Password Reset UI** - Built forgot password form and reset password page
  - ✅ **Error Handling** - Added comprehensive error detection and user-friendly messages
  - ✅ **Redirect URL Configuration** - Added production URL to Supabase redirect URLs list
- **Current Issues**:
  - 🔴 **Password reset links not working** - Links in emails are either expired or redirect incorrectly
  - 🔴 **Email links contain errors** - Some reset emails contain error parameters in the URL itself
  - 🔴 **Redirect to /auth instead of /auth/reset-password** - Users sometimes redirected to login page
  - 🔴 **Rate limiting** - Supabase rate limits after multiple reset attempts
- **What We Tried**:
  - Redirecting through Supabase verification endpoint when code detected in query params
  - Using `token` parameter instead of `code` for verification
  - Checking for errors before redirecting
  - Waiting for auto-session establishment
  - Multiple iterations of error handling and session detection
- **Next Steps** (To Come Back To):
  - Investigate why Supabase is generating links with error parameters
  - Check if email template is using correct `{{ .ConfirmationURL }}` variable
  - Verify redirect URL matches exactly in Supabase configuration
  - Test with fresh reset email after all configuration changes
  - Consider using Supabase's built-in password reset flow more directly
  - Check if custom SMTP is causing issues with link generation
  - Review Supabase documentation for password reset best practices
- **Temporary Workaround**: Users can contact admin for manual password reset if needed

### Storage & Media Upload Infrastructure (Major Overhaul Completed)
- **Previous Status**: Using base64 encoding for all media uploads to bypass Supabase Storage RLS issues
- **Current Status**: Comprehensive storage infrastructure built with multiple approaches
- **What We Built Today**:
  - ✅ **Supabase Storage buckets** with proper RLS policies (avatars, posts, journal, archive)
  - ✅ **Unified uploadMedia() system** with API routes and fallback mechanisms
  - ✅ **Local storage fallback** system for development
  - ✅ **File size limits** and HEIC support for all media types
  - ✅ **Updated all components** (journal, mood boards, posts) to use new storage system
- **Current Issue**: RLS policy data type mismatch (`auth.uid()` vs `user_id` column types)
- **Next Steps**: 
  - Fix RLS policy definitions to use `auth.uid()::text = user_id`
  - Test file uploads with corrected policies
  - Complete UI rendering updates (render from URLs instead of base64)
  - Implement mood board styling improvements

## Recent Achievements (Latest Session) 🎉

### Password Reset & Email Infrastructure (Today - Session 1)
- ✅ **Resend SMTP Setup**
  - Set up Resend account and API key
  - Configured custom domain (`spacewhale.com.au`) in Resend
  - Added DNS records (DKIM, SPF, MX) to Squarespace/GoDaddy
  - Verified domain successfully
- ✅ **Supabase Email Configuration**
  - Configured Supabase to use Resend SMTP
  - Set sender email to `hello@spacewhale.com.au`
  - Updated Site URL to production domain
  - Added redirect URLs for password reset
- ✅ **Password Reset UI Components**
  - Created `ForgotPasswordForm` component
  - Built `/auth/reset-password` page with Suspense boundary
  - Added error handling for expired/invalid links
  - Improved user experience with clear error messages
  - Added "Request New Reset Link" button
- ✅ **Code Improvements**
  - Added `resetPassword` and `updatePassword` functions to AuthContext
  - Implemented dynamic redirect URL handling
  - Added comprehensive error detection (query params and hash fragments)
  - Prevented redirect loops when errors are present
  - Added extensive logging for debugging
- ⚠️ **Note**: Password reset flow still not fully working - see Known Issues section

### Invite Code System (Today - Session 2)
- ✅ **Temporarily Disabled Invite Code Requirement**
  - Commented out invite code validation in SignUpForm
  - Removed invite code field from signup form
  - Added TODO comments for easy re-enablement
  - Allows testing with friends without invite codes

### Deployment Fixes & Infrastructure (Previous Session)
- ✅ **Fixed critical deployment issues**
  - Fixed hardcoded Supabase URL in `supabase.ts` to use environment variables
  - Added proper error handling for missing env vars in all API routes
  - Fixed typo in environment variable name (`XT_PUBLIC_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`)
  - Improved error messages to guide deployment configuration
- ✅ **Fixed albums not displaying in archive**
  - Improved albums API count query syntax
  - Enhanced error handling and logging in ArchivePage
  - Fixed useEffect dependency to wait for client mount
  - Added comprehensive logging for debugging
- ✅ **Fixed personal space Supabase URL issues**
  - Removed unused supabase import from JournalEntryForm
  - All API routes now properly check for environment variables

### UI/UX Improvements (Today)
- ✅ **Simplified web copy throughout**
  - Removed redundant and verbose text from forms
  - Shortened placeholders to be more concise
  - Removed unnecessary helper text
  - Made UI more scannable and less cluttered
- ✅ **Enhanced PostForm**
  - Removed suggested tags section to reduce clutter
  - Simplified tag input with cleaner placeholder
  - Added drag-and-drop functionality for media upload
- ✅ **Improved Personal Space**
  - Enhanced "What feels right today?" section with better visual design
  - Changed "Write" to "Journal" for more accurate labeling
  - Updated icons (PenTool, Images, Sparkles) for more playful aesthetic
  - Vertical card layout with icon containers and better hover effects
- ✅ **Fixed journal list layout**
  - Fixed horizontal scrolling issues on mobile
  - Ensured icons stay within bounds with proper flex wrapping
  - Improved responsive layout (stacks on mobile, horizontal on desktop)
  - Better text wrapping and spacing

### Performance Optimizations (Today)
- ✅ **Image loading optimizations**
  - Added lazy loading to all below-the-fold images
  - Added async decoding for better performance
  - Added width/height attributes to prevent layout shift
  - Improved initial page load and reduced bandwidth usage

### Visual Enhancements (Today)
- ✅ **Enhanced mood board display in Community Orbit**
  - Created engaging collage layout with hero image
  - First image displayed large, remaining in compact grid
  - Better visual hierarchy and engagement
  - Smooth hover effects and remaining count overlay
- ✅ **Fixed mood board modal sizing**
  - Matched personal space modal to Community Orbit sizing
  - Reduced image size from max-w-6xl to max-w-4xl
  - Less purple space, more focused display

### Previous Achievements
- Onboarding and Safety
  - One‑time Welcome modal after first login (values-based, UK/AUS spelling)
  - First‑post gentle note for Community Orbit (content warnings, care/kindness)
- Community Orbit UX
  - Header copy aligned to values
  - Media prioritized in post cards (larger images/videos, tighter padding)
  - Skeleton loading for feed
- Archive (Constellation)
  - Albums detail lightbox upgraded to carousel (keyboard, buttons, swipe on mobile)
  - Close on background and reliable X button
  - Skeleton loading for albums grid
- Profile
  - Avatar upload streamlined (upsert, cache‑busting, immediate refresh)
  - Bio removed; focused on name, pronouns, avatar
- About/Guidelines
  - Concrete, actionable community guidelines; invite‑only copy; UK/AUS spellings
- Albums (Constellation)
  - Public Albums grid on `Archive` showing curated collections
  - Album detail page with item gallery (images/videos) using signed URLs
  - Admin-only batch upload to album (multi-file) with auto association
  - Admin-only album selection in regular upload flow (one-step add-to-album)
  - Admin-only "Set as cover" from any item + live header update
  - Admin-only drag-to-reorder within album (persisted `sort_order`)
  - Clickable items open full `ArchiveItemModal` (likes, comments, owner actions)
- Storage & Media
  - Signed URL service (`/api/get-signed-url`) and client utilities
  - Archive/Album components now render via signed URLs (secure, long‑term)
  - Fixed batch upload bug to store `media_url` as the actual URL
- Community Orbit
  - Posts rendering restored via secure posts endpoint fallback (`/api/get-posts-secure`)
- Navigation & Admin UX
  - Back‑to‑Portal link on Album Management
  - Admin checks centralized (email) for manager links/actions
  
All changes are committed and pushed to GitHub.

## Next Priority Features 🎯

### Immediate Next Steps (High Priority)
1. **Inner Space Encryption Testing** ⚠️
   - **Status**: Encryption infrastructure implemented, decryption needs testing
   - **What's Done**:
     - ✅ Client-side encryption with AES-GCM and PBKDF2 key derivation
     - ✅ Encryption UI with passphrase input and user-friendly explanations
     - ✅ Database migration from BYTEA to TEXT for content_encrypted column
     - ✅ Comprehensive error logging for debugging
   - **What's Needed**:
     - 🔄 Test decryption with existing encrypted entries
     - 🔄 Verify passphrase validation and error handling
     - 🔄 Check if data format issues are resolved after migration
     - 🔄 Test creating new encrypted entries and decrypting them
   - **Note**: Currently debugging decryption - may need to verify data format or re-encrypt existing entries

2. **Deployment Verification**
   - ✅ Environment variables properly configured
   - Test all features in production deployment
   - Verify albums display correctly
   - Verify personal space loads without errors
   - Monitor for any remaining environment variable issues

2. **UX Polish & Refinement**
   - Continue simplifying web copy where needed
   - Review and refine any remaining verbose text
   - Ensure consistent, minimal copy throughout
   - Consider adding loading skeletons for better perceived performance

3. **Mobile Experience**
   - Test all features on mobile devices
   - Verify scrolling works smoothly everywhere
   - Ensure all modals are properly sized on mobile
   - Check touch targets are adequate

### Medium Priority
- **Archive Enhancements**
  - Optional captions/credits per item displayed in lightbox
  - Share/copy link for album and items
  - Public share link buttons for albums
  - Optional "Albums vs All Items" toggle in Constellation
- **Community Orbit**
  - Infinite scroll or pagination
  - Basic tag filters
  - Tags/filters for posts
- **Performance**
  - Shimmer skeleton variant
  - Lazy image preloading in carousels
  - Further optimize image loading strategies
- **Uploads & Data Quality**
  - Normalize any legacy `media_url` values that aren't plain URLs
  - Add brief signed‑URL refresh strategy (re-sign on page load)
- **Roles & Access**
  - Convert admin email check to role/allowlist
  - Optional: allow trusted contributors to add to specific albums

### Lower Priority / Future Enhancements
- Post form: lightweight "Add content warning" chip + badge on cards
- Image pinch‑to‑zoom and swipe‑to‑close in archive lightbox
- Toast notifications for saves/uploads (partially implemented)
- Cover-first layout option (hero full-width) for albums

## Development Phases

---

## 🚀 PHASE 1: Core Functionality (Weeks 1-4)
**Goal:** Make the platform actually work with real user accounts and data persistence.

### Sprint 1: Authentication & User Management (Week 1-2)

#### Backend Setup
- [ ] Set up Supabase project
  - [ ] Create database
  - [ ] Configure authentication providers
  - [ ] Set up storage buckets for user uploads
  - [ ] Configure Row Level Security (RLS) policies

#### User Authentication
- [ ] Sign up flow
  - [ ] Email/password registration
  - [ ] Email verification
  - [ ] Optional: Social auth (Google, Apple)
- [ ] Login flow
  - [ ] Email/password login
  - [ ] "Remember me" functionality
  - [ ] Session management
- [ ] Password management
  - [ ] Password reset via email
  - [ ] Password strength requirements
  - [ ] Change password in settings
- [ ] Logout functionality

#### User Profiles
- [ ] Profile creation form
  - [ ] Display name (cosmic name option)
  - [ ] Pronouns (custom text field)
  - [ ] Bio (optional)
  - [ ] Profile picture upload
  - [ ] Privacy settings (public/private profile)
- [ ] Profile editing
- [ ] Profile viewing (own + others)

#### Onboarding Flow
- [ ] Welcome screen after signup
  - [ ] "Choose your cosmic name"
  - [ ] "Set your intentions" (why are you here?)
  - [ ] Quick tour of four spaces
- [ ] Community guidelines acceptance (required)
- [ ] Optional: Accessibility preferences
  - [ ] Reduced motion
  - [ ] Content warning preferences
  - [ ] Text size preferences

### Sprint 2: Database Schema & Models (Week 2)

#### Core Tables
```sql
- users (extended profile data)
  - id, email, display_name, pronouns, bio, avatar_url, created_at, settings
  
- journal_entries (Personal Space)
  - id, user_id, title, content, mood, is_private, created_at, updated_at
  
- posts (Community Feed)
  - id, user_id, content, post_type, tags, created_at, updated_at
  
- comments
  - id, post_id, user_id, content, created_at, updated_at
  
- likes
  - id, post_id, user_id, created_at
  
- archive_items (Archive content)
  - id, user_id, title, description, content_type, media_url, tags, created_at
  
- workshops
  - id, title, description, date, time, capacity, price, registration_open, created_at
  
- workshop_registrations
  - id, workshop_id, user_id, participant_info, registration_date, status
  
- content_reports (moderation)
  - id, content_type, content_id, reporter_id, reason, status, created_at
```

#### Row Level Security Policies
- [ ] Users can only read their own private data
- [ ] Users can read public posts/profiles
- [ ] Users can only edit/delete their own content
- [ ] Admins can access everything

### Sprint 3: Personal Space Functionality (Week 3-4)

#### Journal System
- [ ] Create new journal entry
  - [ ] Rich text editor (formatting, links)
  - [ ] Mood selector (emoji or scale)
  - [ ] Tags/categories
  - [ ] Privacy toggle (private by default)
- [ ] Edit existing entries
- [ ] Delete entries (soft delete with confirmation)
- [ ] View journal history
  - [ ] Timeline view
  - [ ] Search by date/mood/tag
  - [ ] Filter by mood

#### Draft System
- [ ] Create draft artwork/projects
  - [ ] Title, description, media upload
  - [ ] Work-in-progress status
  - [ ] Private by default
- [ ] Edit drafts
- [ ] Publish to Archive or Community Feed
- [ ] Delete drafts

#### Creative Prompts (Basic)
- [ ] Display daily prompt (hardcoded initially)
- [ ] Prompt history/archive
- [ ] Mark prompts as favorites
- [ ] Create journal entry from prompt

#### Journey Statistics
- [ ] Track entries created
- [ ] Track moods over time (simple chart)
- [ ] Track creative output
- [ ] Milestone badges (first entry, 10 entries, etc.)

---

## 🛡️ PHASE 1.5: Privacy & Safety Enhancement (Week 4-5)
**Goal:** Implement comprehensive privacy and safety measures for trauma-informed, neuroaffirming platform.

### Sprint 1.5: Enhanced Privacy & Security (Week 4-5)

#### Database Privacy Enhancements
- [ ] **Run privacy-enhancements.sql** in Supabase
  - [ ] Add encryption for sensitive content
  - [ ] Implement access logging for journal entries
  - [ ] Create data retention policies
  - [ ] Add audit trail functionality
  - [ ] Enhanced RLS policies for maximum security

#### Privacy Settings Interface
- [ ] **PrivacySettings component** integration
  - [ ] Data retention preferences (indefinite, 1yr, 6mo, 30days)
  - [ ] Anonymous analytics toggle
  - [ ] Content warning preferences
  - [ ] Accessibility settings (reduced motion, high contrast, screen reader)
  - [ ] Clear privacy policy display

#### Data Protection Features
- [ ] **Content encryption** for sensitive journal entries
  - [ ] Encrypt journal content at rest
  - [ ] Decrypt only when user accesses their own content
  - [ ] Secure key management
- [ ] **Access logging** system
  - [ ] Track who accesses what data and when
  - [ ] IP address logging for security
  - [ ] User agent tracking for device identification
- [ ] **Data export functionality**
  - [ ] Users can download all their data
  - [ ] JSON format with complete data export
  - [ ] Include journal entries, posts, comments, profile data
- [ ] **Data deletion functionality**
  - [ ] Complete data removal option
  - [ ] Cascade delete all user data
  - [ ] Audit trail of deletion actions

#### Trauma-Informed Safety Features
- [ ] **Content warning system**
  - [ ] Trigger warnings for sensitive material
  - [ ] Custom warning categories
  - [ ] User preference settings for warnings
  - [ ] "Show content" confirmation for sensitive posts
- [ ] **Consent management**
  - [ ] Clear consent checkboxes during signup
  - [ ] Granular privacy controls
  - [ ] Data sharing preferences
  - [ ] Analytics participation opt-in/out

#### Security Audit & Compliance
- [ ] **Security audit checklist**
  - [ ] Verify all RLS policies are working
  - [ ] Test data isolation between users
  - [ ] Confirm encryption is functioning
  - [ ] Validate access logging
- [ ] **Privacy policy page**
  - [ ] Clear explanation of data handling
  - [ ] User rights and controls
  - [ ] Contact information for privacy concerns
  - [ ] Compliance with Australian privacy laws
- [ ] **Terms of service**
  - [ ] Platform usage guidelines
  - [ ] Community safety standards
  - [ ] Data protection commitments

#### User Education & Transparency
- [ ] **Privacy onboarding**
  - [ ] Explain privacy settings during signup
  - [ ] Show users how their data is protected
  - [ ] Demonstrate privacy controls
- [ ] **Help documentation**
  - [ ] How to manage privacy settings
  - [ ] How to export/delete data
  - [ ] Understanding content warnings
  - [ ] Reporting privacy concerns

---

## 🎨 PHASE 2: Community Features (Weeks 5-8)

### Sprint 4: Community Feed Functionality (Week 5-6)

#### Post Creation
- [ ] Create new post
  - [ ] Text content (rich text)
  - [ ] Image upload (single or gallery)
  - [ ] Tag system
  - [ ] Content warning toggle + description
- [ ] Edit own posts (within time limit)
- [ ] Delete own posts

#### Engagement
- [ ] Like posts
- [ ] Comment on posts
- [ ] Reply to comments (threaded)
- [ ] Edit/delete own comments

#### Feed Experience
- [ ] Chronological feed (newest first)
- [ ] Filter by tags
- [ ] Filter by content warnings (hide CW'd content)
- [ ] Search posts
- [ ] Pagination/infinite scroll

#### AI Prompts for Community
- [ ] Generate community prompt daily
- [ ] Display on feed
- [ ] Users can respond to prompts
- [ ] Track prompt engagement

### Sprint 5: Archive Functionality (Week 6-7)

#### Content Upload
- [ ] Upload artwork
  - [ ] Image files (JPG, PNG, GIF)
  - [ ] Title, description, artist credit
  - [ ] Tags
- [ ] Upload videos
  - [ ] Video files or YouTube/Vimeo embeds
  - [ ] Poetry/performance category
- [ ] Upload zines
  - [ ] PDF upload
  - [ ] Preview thumbnail
- [ ] Upload audio
  - [ ] Audio files (MP3, WAV)
  - [ ] Spoken word category

#### Moderation Queue
- [ ] Admin review system for new uploads
- [ ] Approve/reject uploads
- [ ] Edit metadata before publishing
- [ ] Flagged content review

#### Archive Browsing
- [ ] Grid view of content
- [ ] Filter by content type
- [ ] Filter by tags
- [ ] Search by title/artist
- [ ] Sort by newest/most liked
- [ ] Individual content pages
  - [ ] Full media viewer
  - [ ] Artist info
  - [ ] Engagement (likes, comments)

### Sprint 6: Workshop Registration (Week 7-8)

#### Workshop Management (Admin)
- [ ] Create new workshop
  - [ ] Title, description, image
  - [ ] Date, time, duration
  - [ ] Capacity limit
  - [ ] Price (free or paid)
  - [ ] NDIS eligible toggle
  - [ ] Registration deadline
- [ ] Edit workshop details
- [ ] Close registrations
- [ ] View registrations list
- [ ] Export registrations (CSV)

#### Registration Flow (User)
- [ ] Browse upcoming workshops
- [ ] View workshop details
- [ ] Register for workshop
  - [ ] Contact info collection
  - [ ] Accessibility needs (optional)
  - [ ] NDIS participant info (if applicable)
  - [ ] Dietary requirements (if applicable)
- [ ] Registration confirmation page
- [ ] View "My Registrations" page
- [ ] Cancel registration (with deadline)

#### Payment Integration (If Paid Workshops)
- [ ] Stripe integration
- [ ] Checkout flow
- [ ] Payment confirmation
- [ ] Refund processing
- [ ] Sliding scale pricing options

#### Email System
- [ ] Registration confirmation email
- [ ] Workshop reminder email (24hrs before)
- [ ] Cancellation confirmation
- [ ] Workshop updates/changes

---

## 🛡️ PHASE 3: Safety & Moderation (Weeks 9-10)

### Sprint 7: Content Moderation & Safety (Week 9-10)

#### Reporting System
- [ ] Report post/comment button
  - [ ] Report reason selection
  - [ ] Additional context (optional)
- [ ] Report queue for admin
- [ ] Review reported content
- [ ] Take action (remove, warn, ban)
- [ ] Notify reporter of outcome

#### Moderation Tools
- [ ] Admin dashboard
  - [ ] Recent reports
  - [ ] Flagged content
  - [ ] User management
- [ ] Content removal
  - [ ] Remove post/comment
  - [ ] Notify user of removal
  - [ ] Track moderation actions
- [ ] User management
  - [ ] Warning system
  - [ ] Temporary ban
  - [ ] Permanent ban
  - [ ] View user activity

#### Blocking & Privacy
- [ ] Block user functionality
  - [ ] Blocked users can't see your content
  - [ ] You can't see blocked user's content
- [ ] Manage blocked users list
- [ ] Privacy settings
  - [ ] Profile visibility (public/private)
  - [ ] Who can comment on posts
  - [ ] Who can message you (future)

#### Content Warnings
- [ ] CW tag system
  - [ ] Common CW categories (trauma, body image, etc.)
  - [ ] Custom CW text
- [ ] User preferences for CW
  - [ ] Auto-hide CW'd content
  - [ ] Show/hide specific categories
- [ ] "Click to reveal" CW'd content

---

## 🤖 PHASE 4: AI Features & Polish (Weeks 11-14)

### Sprint 8: AI Creative Prompts (Week 11-12)

#### AI Integration
- [ ] Set up Anthropic Claude API or OpenAI
- [ ] Secure API key management
- [ ] Usage tracking and limits

#### Personal Space AI
- [ ] Generate personalized journal prompts
  - [ ] Based on user's mood history
  - [ ] Based on themes (grief, joy, identity)
  - [ ] Based on time of day/season
- [ ] Prompt refinement
  - [ ] Regenerate if prompt doesn't resonate
  - [ ] Save favorite prompts
- [ ] AI reflection companion
  - [ ] Optional: AI responds to journal entries with gentle questions
  - [ ] Must be clearly labeled as AI
  - [ ] Easy to disable

#### Community AI
- [ ] Daily community prompt generation
- [ ] Themed prompt weeks/months
- [ ] AI-suggested tags for posts
- [ ] Optional: AI content summarization for accessibility

### Sprint 9: Notifications & Communication (Week 12-13)

#### Email Notifications
- [ ] Welcome email with onboarding guide
- [ ] Weekly digest (optional)
  - [ ] Top community posts
  - [ ] Upcoming workshops
  - [ ] Personal milestones
- [ ] Engagement notifications
  - [ ] Someone liked your post
  - [ ] Someone commented on your post
  - [ ] Someone replied to your comment
- [ ] Workshop notifications
  - [ ] Registration confirmation
  - [ ] 24hr reminder
  - [ ] Workshop updates
- [ ] Notification preferences
  - [ ] Email frequency settings
  - [ ] Choose which notifications to receive
  - [ ] Unsubscribe options

#### In-App Notifications
- [ ] Notification bell icon
- [ ] Notification dropdown
  - [ ] Mark as read
  - [ ] Clear all
  - [ ] Filter by type
- [ ] Real-time updates (Supabase Realtime)

### Sprint 10: Polish & Accessibility (Week 13-14)

#### Accessibility Improvements
- [ ] Keyboard navigation audit
  - [ ] All interactive elements keyboard accessible
  - [ ] Focus indicators clear and visible
  - [ ] Skip to content link
- [ ] Screen reader optimization
  - [ ] Alt text for all images
  - [ ] ARIA labels for complex components
  - [ ] Semantic HTML throughout
- [ ] Color contrast audit
  - [ ] Meet WCAG AA standards minimum
  - [ ] Test with contrast checker tools
- [ ] Form accessibility
  - [ ] Clear labels and error messages
  - [ ] Helpful placeholder text
  - [ ] Field validation feedback
- [ ] Media accessibility
  - [ ] Video captions (required for uploads)
  - [ ] Audio transcripts (optional but encouraged)
  - [ ] Image alt text (required)

#### Performance Optimization
- [ ] Image optimization
  - [ ] Automatic resizing on upload
  - [ ] WebP format support
  - [ ] Lazy loading
- [ ] Code splitting
  - [ ] Route-based splitting
  - [ ] Component lazy loading
- [ ] Database query optimization
  - [ ] Pagination for large lists
  - [ ] Indexed columns for searches
  - [ ] Caching strategy

#### Enhanced UX
- [ ] Loading states everywhere
- [ ] Error handling and messaging
- [ ] Empty states (no content yet)
- [ ] Confirmation modals for destructive actions
- [ ] Smooth animations (respecting reduced motion)
- [ ] Toast notifications for actions
- [ ] Breadcrumb navigation
- [ ] Search functionality across platform

---

## 🎯 PHASE 5: Beta Testing & Iteration (Weeks 15-18)

### Sprint 11: Beta Launch Preparation (Week 15)

#### Pre-Launch Checklist
- [ ] Security audit
  - [ ] SQL injection protection
  - [ ] XSS protection
  - [ ] CSRF protection
  - [ ] Rate limiting on API endpoints
  - [ ] Secure file upload validation
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Community guidelines page (detailed)
- [ ] Contact page
- [ ] About page
- [ ] FAQ page
- [ ] Help documentation
  - [ ] How to create journal entries
  - [ ] How to post in community
  - [ ] How to register for workshops
  - [ ] Content warning guide
  - [ ] Reporting guide

#### Beta Tester Recruitment
- [ ] Identify 10-15 beta testers
  - [ ] Mix of tech-savvy and non-tech users
  - [ ] Diverse backgrounds and needs
  - [ ] Trusted community members
- [ ] Create beta tester agreement
- [ ] Set up feedback channels
  - [ ] Feedback form in platform
  - [ ] Private Discord/Slack for testers
  - [ ] Weekly check-in calls
- [ ] Prepare onboarding for beta testers

### Sprint 12: Beta Testing (Week 16-17)

#### Week 1 of Beta
- [ ] Soft launch to first 5 testers
- [ ] Monitor for critical bugs
- [ ] Daily check-ins
- [ ] Hotfix critical issues immediately

#### Week 2 of Beta
- [ ] Expand to all 15 testers
- [ ] Conduct user interviews
  - [ ] What's working well?
  - [ ] What's confusing?
  - [ ] What's missing?
  - [ ] How does it feel to use?
- [ ] Collect quantitative data
  - [ ] Which features get used most?
  - [ ] Where do users drop off?
  - [ ] Average session length
  - [ ] Common error messages

#### Feedback Analysis
- [ ] Compile all feedback
- [ ] Prioritize issues (critical, high, medium, low)
- [ ] Identify patterns in feedback
- [ ] Create iteration plan

### Sprint 13: Iteration Based on Feedback (Week 18)

#### High-Priority Fixes
- [ ] Critical bugs (blocking functionality)
- [ ] Major usability issues
- [ ] Accessibility problems
- [ ] Security concerns

#### Feature Adjustments
- [ ] Modify confusing workflows
- [ ] Add most-requested features
- [ ] Remove unused features
- [ ] Simplify complex interactions

#### Content & Copy Improvements
- [ ] Clarify confusing instructions
- [ ] Improve onboarding flow
- [ ] Update help documentation
- [ ] Refine community guidelines

---

## 🚢 PHASE 6: Public Launch (Week 19+)

### Pre-Launch Marketing
- [ ] Update spacewhale.com.au website with platform info
- [ ] Create launch announcement
- [ ] Social media posts
- [ ] Email to existing community
- [ ] Press release (local LGBTIQA+ media)

### Launch Day
- [ ] Open public registration
- [ ] Monitor for issues
- [ ] Respond to user questions
- [ ] Celebrate with community!

### Post-Launch Support
- [ ] Daily monitoring first week
- [ ] Quick response to bug reports
- [ ] User support via email/contact form
- [ ] Ongoing community management

### Metrics to Track
- [ ] User signups
- [ ] Active users (daily/weekly/monthly)
- [ ] Content creation (posts, journals, archive items)
- [ ] Workshop registrations
- [ ] User retention (do people come back?)
- [ ] Support requests/bug reports

---

## 🔮 FUTURE FEATURES (Post-Launch)

### Phase 7+: Advanced Features
- [ ] Direct messaging between users
- [ ] Collaborative storyworlds
- [ ] Community challenges/projects
- [ ] User portfolios (public showcase)
- [ ] Advanced AI features
  - [ ] AI art generation
  - [ ] AI creative writing assistance
  - [ ] AI-guided reflection exercises
- [ ] Mobile app (iOS/Android)
- [ ] Integration with external tools
  - [ ] Calendar sync
  - [ ] Export journal as PDF
  - [ ] Connect to art platforms
- [ ] Advanced analytics for users
  - [ ] Detailed mood tracking over time
  - [ ] Creative output visualization
  - [ ] Personal growth insights
- [ ] Cohort-based experiences
  - [ ] Private groups for workshops
  - [ ] Peer support circles
  - [ ] Long-term programs (8-week courses)

---

## 🛠️ Technical Stack

### Frontend
- **Framework:** Next.js or Nuxt.js (React/Vue)
- **Styling:** Tailwind CSS (already implemented)
- **State Management:** React Context / Zustand or Pinia
- **Forms:** React Hook Form or VeeValidate
- **Rich Text:** TipTap or Lexical

### Backend
- **BaaS:** Supabase
  - Authentication
  - PostgreSQL Database
  - Storage (file uploads)
  - Real-time subscriptions
  - Edge Functions (serverless)
- **API Design:** RESTful or GraphQL

### External Services
- **AI:** Anthropic Claude API or OpenAI
- **Email:** Resend or SendGrid
- **Payments:** Stripe (if needed)
- **Video Hosting:** Cloudflare Stream or Vimeo
- **Analytics:** Plausible (privacy-friendly)
- **Error Tracking:** Sentry
- **Hosting:** Vercel or Netlify

### Development Tools
- **Code Editor:** Cursor AI
- **Version Control:** Git + GitHub
- **Database Management:** Supabase Studio
- **API Testing:** Postman or Insomnia
- **Design:** Figma (for refinements)

---

## 📋 Development Best Practices

### Code Quality
- [ ] Write clean, commented code
- [ ] Use TypeScript for type safety
- [ ] Component-based architecture
- [ ] Reusable components library
- [ ] Consistent naming conventions

### Testing
- [ ] Manual testing of all features
- [ ] User acceptance testing (beta)
- [ ] Accessibility testing
- [ ] Cross-browser testing
- [ ] Mobile responsive testing

### Security
- [ ] Never store sensitive data in plain text
- [ ] Use environment variables for secrets
- [ ] Validate all user inputs
- [ ] Sanitize user-generated content
- [ ] Implement rate limiting
- [ ] Regular security audits

### Documentation
- [ ] Code comments for complex logic
- [ ] README with setup instructions
- [ ] API documentation
- [ ] User help documentation
- [ ] Admin documentation

### Version Control
- [ ] Commit frequently with clear messages
- [ ] Use feature branches
- [ ] Create releases/tags for versions
- [ ] Keep main branch stable

---

## 🎯 Success Metrics

### Technical Success
- Site loads in under 3 seconds
- 99% uptime
- Zero critical security vulnerabilities
- Accessible (WCAG AA compliance)
- Mobile responsive on all devices

### User Success
- 80%+ beta tester satisfaction
- Users create journal entries regularly
- Active community engagement (posts, comments)
- Workshop registrations successful
- Low support request volume (intuitive UX)

### Community Success
- Safe, welcoming environment
- Low moderation incidents
- Positive user testimonials
- Community growth over time
- Workshops at capacity

### Privacy & Safety Success
- **Zero data breaches** or privacy incidents
- **100% user data isolation** - no cross-user data access
- **Complete encryption** of sensitive journal content
- **User trust metrics** - high confidence in data protection
- **Transparent privacy controls** - users understand their data rights
- **Trauma-informed safety** - content warnings working effectively
- **Accessibility compliance** - neurodivergent-friendly privacy settings
- **Data sovereignty** - users can export/delete all their data

---

## 📞 Support & Resources

### When You Get Stuck
- **Cursor AI:** Ask for help with specific code problems
- **Supabase Docs:** https://supabase.com/docs
- **Stack Overflow:** Search for error messages
- **Next.js Docs:** https://nextjs.org/docs
- **Claude:** Ask me for guidance anytime!

### Community Resources
- Supabase Discord community
- Next.js GitHub discussions
- Web accessibility communities (a11y)

---

## 🌟 Final Notes

Remember:
- **Progress over perfection** - Ship features iteratively
- **Users first** - Always prioritize safety and accessibility
- **Stay trauma-informed** - Every design decision should consider user wellbeing
- **Celebrate wins** - Each feature completed is a milestone!
- **Rest when needed** - Sustainable development is a marathon, not a sprint

This is a living document. Update it as priorities shift based on user feedback and your own creative vision for Space Whale Hub.

You're building something beautiful and needed. Trust the process. 🐋✨
