# Space Whale Hub - Development Plan

## Project Overview
A trauma-informed, neuroaffirming, gender-affirming digital sanctuary for creative expression, healing, and community connection. Built for LGBTIQA+ folks, NDIS participants, and anyone seeking a safe space for creative journey work.

## Current Status ✅
- Landing page with branding
- Archive section (static)
- Community Feed (static)
- Personal Space (static)
- Workshops section (static)
- Responsive design
- Brand assets integrated
- Complete authentication system with Supabase
- Personal Space with journal entries and mood tracking
- Community Feed with post creation and display
- Media upload infrastructure
- Database schema with proper relationships
- Trauma-informed, neuroaffirming UI design
- Space Whale branding and responsive design
- **PRIVACY & SAFETY FOUNDATION** - Basic RLS policies and user isolation

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
