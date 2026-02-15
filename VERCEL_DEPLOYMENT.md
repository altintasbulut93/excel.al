# Vercel Deployment Guide for Riskora.al

Since you've decided to deploy on Vercel, here are the steps to get your **Riskora.al** application running. Vercel is the creator of Next.js, so the deployment process is seamless.

## 1. Environment Variables
You MUST configure the following environment variables in your Vercel Project Settings.

Go to **Settings > Environment Variables** in your Vercel dashboard and add:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Your Supabase Anon Key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | **CRITICAL**: Required for Cron Jobs & Notifications |
| `RESEND_API_KEY` | `re_123...` | Your Resend API Key for emails |
| `CRON_SECRET` | `your-secure-random-string` | Secret key to protect your cron jobs |

> **Note:** You can copy these values from your local `.env.local` file.

## 2. Cron Jobs (Notifications)
Vercel supports Cron Jobs natively via `vercel.json` or config. Since we are using Next.js App Router, we can use Vercel Cron.

1. Create a `vercel.json` file in the root directory (I will create this for you automatically).
2. The cron job is configured to run daily at 09:00 UTC to check for notifications.

## 3. Database & Permissions
Ensure your Supabase project has the correct SQL migrations applied.
- The `share_system.sql` must be running for share links to work.
- The `cron` schedules are handled by Vercel now, calling your API route.

## 4. Deployment Steps
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New > Project**.
3. Select your GitHub repository: `excel.al`.
4. Vercel will auto-detect "Next.js".
5. **IMPORTANT:** Open the "Environment Variables" section and add the keys from Step 1.
6. Click **Deploy**.

## 5. Verifying Deployment
Once deployed:
1. Check the "Logs" tab in Vercel to ensure no build errors.
2. Visit your Vercel URL (e.g., `riskora-al.vercel.app`).
3. Test a "Share Link" to confirm API routes are working.
4. Test "Login" to confirm Supabase connection.
