# Quick User Creation Guide

Since login isn't working, the user account likely wasn't created properly. Here's the fastest way to create it:

## Option 1: Use Supabase Dashboard (Fastest)

1. Go to: https://supabase.com/dashboard/project/inulencomnwpnbrteryc/auth/users
2. Click **"Add User"** → **"Create New User"**
3. Fill in:
   - **Email**: `abhijeet@calibrate.edu`
   - **Password**: `0176`
   - **✅ Auto Confirm User**: CHECK THIS BOX (important!)
4. Click **"Create User"**
5. Copy the User ID that appears

## Option 2: Add Profile Entry

After creating the user, add their profile:

1. Go to: https://supabase.com/dashboard/project/inulencomnwpnbrteryc/editor
2. Click on the **"profiles"** table
3. Click **"Insert"** → **"Insert row"**
4. Fill in:
   - **id**: Paste the User ID from step 1
   - **email**: `abhijeet@calibrate.edu`
   - **role**: `student`
   - **full_name**: `Abhijeet Senapati`
5. Click **"Save"**

## Option 3: Use SQL (All-in-One)

If the profiles table exists, run this in SQL Editor:

```sql
-- This will show you if the user exists
SELECT id, email, confirmed_at FROM auth.users WHERE email = 'abhijeet@calibrate.edu';
```

If no user exists, you need to create one via the dashboard (Option 1).

---

**After completing these steps, try logging in again!**

The error message will now show: **"Account does not exist or wrong credentials"** if the login fails.
