# Environment Setup Instructions

## Database Connection Issue Fix

If you're seeing database connection errors, you need to set up your environment variables:

1. **Copy the environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **The .env.local file should contain:**
   ```
   REACT_APP_SUPABASE_URL=https://eflkitdxlifnobgelrvu.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbGtpdGR4bGlmbm9iZ2VscnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTU0NzQsImV4cCI6MjA3ODc5MTQ3NH0.m6Rr8hi874fD9nhRXrgIOC85sceKh5RhCiKt94yxKFU
   ```

3. **Restart your development server:**
   ```bash
   npm start
   ```

## Expected Behavior After Fix

- ✅ Location permission prompt appears
- ✅ Console shows "✅ Location saved to database successfully"
- ✅ Console shows "🔄 Periodic location update check..." every 60 seconds
- ✅ New records appear in Supabase database every minute
- ✅ Tracking continues after page reload

## Troubleshooting

If still not working:
1. Check browser console for specific error messages
2. Verify Supabase project is active
3. Check network tab for failed API requests
4. Ensure location permission is granted in browser settings
