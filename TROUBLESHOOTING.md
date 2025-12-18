# Troubleshooting Guide

## Common Supabase Integration Issues

### 1. Storage Bucket Not Found Error

**Error Message:**
```
StorageApiError: Bucket not found
Failed to upload avatar: Bucket not found
```

**Solution:**
The application requires a storage bucket named `gym-assets` in your Supabase project.

**Steps to Create the Bucket:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"** button
5. Enter bucket name: `gym-assets`
6. Choose **Public** (so images can be accessed via URL)
7. Click **"Create bucket"**

**After Creating the Bucket:**
The bucket will be used to store gym avatar images. The application will automatically upload images to the `gym-avatars/` folder within this bucket.

---

### 2. Database 406 (Not Acceptable) Errors

**Error Message:**
```
HTTP 406 (Not Acceptable)
GET /rest/v1/gyms?select=...
```

**Common Causes:**
- User doesn't have a gym yet (expected for new users)
- Session expired or invalid
- Row Level Security (RLS) policies blocking access

**Solution:**
- The application now handles these errors gracefully
- If you're a new user, you should be redirected to the gym details form
- If you see persistent 406 errors, check:
  1. Your session is valid (try signing out and back in)
  2. RLS policies are correctly set up (see `SUPABASE_SETUP.md`)
  3. Your user ID matches the `owner_id` in the gyms table

---

### 3. Database 400 (Bad Request) Errors on Registration

**Error Message:**
```
HTTP 400 (Bad Request)
POST /rest/v1/gyms
```

**Common Causes:**
- Missing required fields
- Incorrect data format (especially arrays)
- Column name mismatch
- Constraint violations

**Solution:**
Check the browser console for detailed error messages. The application now logs:
- `Error message`: The specific error from Supabase
- `Error code`: Database error code (e.g., 23502 = not null violation)
- `Error details`: Which column/field is causing the issue
- `Error hint`: Suggestions from Supabase

**Common Issues:**

1. **Facilities Array Format:**
   - The `facilities` field expects a `TEXT[]` array
   - The application sends it as a JavaScript array, which should work
   - If you see array-related errors, check that the database column type is `TEXT[]`

2. **Missing Required Fields:**
   - Required fields: `name`, `city`, `address`, `owner_id`
   - Ensure all required fields are filled in the form

3. **Column Name Mismatch:**
   - Database uses snake_case: `owner_id`, `brand_name`, `contact_email`, etc.
   - The application maps these correctly, but verify your schema matches `SUPABASE_SETUP.md`

---

### 4. Authentication Errors

**Error Message:**
```
PGRST301: JWT expired
Authentication error
```

**Solution:**
- Sign out and sign back in
- Check that your `.env` file has correct Supabase credentials
- Verify your session hasn't expired

---

## Debugging Tips

### Enable Detailed Logging

The application now includes comprehensive error logging. Check your browser console (F12) for:
- Detailed error messages
- Error codes and hints
- Data being sent to Supabase
- Storage upload progress

### Verify Your Setup

1. **Check Environment Variables:**
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Verify Database Schema:**
   - Compare your `gyms` table schema with `SUPABASE_SETUP.md`
   - Ensure all columns exist and have correct types

3. **Check RLS Policies:**
   - Verify RLS is enabled on the `gyms` table
   - Ensure INSERT policy allows gym owners to create their own gym

4. **Test Storage Bucket:**
   - Verify `gym-assets` bucket exists
   - Check bucket is public or has correct RLS policies
   - Try uploading a test file manually in Supabase Dashboard

---

## Getting Help

If you continue to experience issues:

1. **Check the Console:**
   - Open browser DevTools (F12)
   - Look for detailed error messages
   - Copy the full error object

2. **Verify Supabase Setup:**
   - Review `SUPABASE_SETUP.md` for complete setup instructions
   - Ensure all SQL scripts have been run
   - Verify storage bucket and policies are set up

3. **Test Database Connection:**
   - Try a simple query in Supabase SQL Editor
   - Verify your user exists in `auth.users`
   - Check that a profile exists in `profiles` table

4. **Check Network Tab:**
   - Open Network tab in DevTools
   - Look for failed requests
   - Check request/response details

---

## Quick Checklist

Before reporting an issue, verify:

- [ ] Storage bucket `gym-assets` exists and is public
- [ ] All database tables are created (see `SUPABASE_SETUP.md`)
- [ ] RLS policies are set up correctly
- [ ] Environment variables are set in `.env` file
- [ ] User is signed in and session is valid
- [ ] Browser console shows detailed error messages
- [ ] Database schema matches the expected structure
