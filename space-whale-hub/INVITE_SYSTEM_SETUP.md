# Space Whale Portal - Invite System Setup Guide

## 🚀 Quick Setup Instructions

### 1. Run the SQL Script
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-invite-system-complete.sql`
4. Click **Run** to execute the script

### 2. Verify Setup
After running the script, you should see:
- ✅ Tables created: `invite_codes`, `invite_code_usage`
- ✅ Functions created: `validate_invite_code`, `use_invite_code`
- ✅ Initial invite codes: `SPACEWHALE2025`, `BETA-TESTER`, `COMMUNITY-FRIEND`

### 3. Test the System
1. Go to your portal at `http://localhost:3000`
2. Try to sign up with one of these codes:
   - `SPACEWHALE2025` (10 uses, expires in 30 days)
   - `BETA-TESTER` (5 uses, expires in 14 days)
   - `COMMUNITY-FRIEND` (3 uses, expires in 7 days)

## 🔐 Initial Invite Codes

| Code | Max Uses | Expires | Purpose |
|------|----------|---------|---------|
| `SPACEWHALE2025` | 10 | 30 days | General community access |
| `BETA-TESTER` | 5 | 14 days | Beta testing feedback |
| `COMMUNITY-FRIEND` | 3 | 7 days | Limited community access |

## 🛠️ Admin Features

### Access Admin Dashboard
- Go to `/admin` (only accessible to `lizwamc@gmail.com`)
- Manage invite codes
- View usage statistics
- Create new codes

### Create New Invite Codes
1. Go to `/admin/invite-codes`
2. Click "Create Code"
3. Set code name, max uses, and expiration
4. Share with community members

## 📱 Mobile Testing Strategy

### Phase 1: Trusted Beta Testers
1. Create invite codes for 5-10 trusted community members
2. Test signup flow on various mobile devices
3. Gather feedback on:
   - Mobile navigation
   - Create button functionality
   - All four spaces (Constellation, Community Orbit, Deep Space, Inner Space)

### Phase 2: Community Feedback
1. Expand to 15-20 beta testers
2. Focus on:
   - Content creation workflows
   - Community interaction features
   - Archive/album functionality

### Phase 3: Polish & Launch
1. Address feedback and polish UX
2. Create final invite codes for launch
3. Open to broader community

## 🎯 Benefits of Invite-Only Beta

✅ **Safety First** - Maintains trauma-informed, curated community
✅ **Quality Control** - Only users who understand your values join
✅ **Mobile Testing** - Perfect for testing with trusted community members
✅ **Community Building** - Creates anticipation and exclusivity
✅ **Moderation** - Easier to manage smaller, vetted community
✅ **Feedback Quality** - Beta testers will give thoughtful, constructive feedback

## 🚨 Troubleshooting

### If invite codes don't work:
1. Check you're logged in as `lizwamc@gmail.com`
2. Verify the SQL script ran successfully
3. Check Supabase logs for errors

### If signup fails:
1. Check browser console for errors
2. Verify API endpoints are working
3. Test with a simple invite code first

## 📞 Support

If you run into any issues:
1. Check the Supabase logs
2. Test the API endpoints directly
3. Verify RLS policies are working correctly

---

**Ready to launch your invite-only Space Whale Portal! 🐋✨**


