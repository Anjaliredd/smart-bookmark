# 🔖 Smart Bookmark

A personal bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## Live URL

[https://smart-bookmark-em2h.vercel.app](https://smart-bookmark-em2h.vercel.app)

## GitHub Repo

[https://github.com/Anjaliredd/smart-bookmark](https://github.com/Anjaliredd/smart-bookmark)

## Features

- Google OAuth sign-in (no email/password)
- Add bookmarks with a title and URL
- Delete bookmarks
- Bookmarks are private — each user only sees their own
- Real-time sync across browser tabs

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (Authentication, PostgreSQL Database, Realtime subscriptions)
- **Tailwind CSS** for styling
- **Vercel** for deployment

## How to Run Locally

1. Clone the repo
2. Run `npm install`
3. Create a `.env.local` with your Supabase URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```
4. Run `npm run dev`
5. Open `http://localhost:3000`

## Problems I Ran Into & How I Solved Them

### 1. Google OAuth redirect not working
After deploying to Vercel, Google sign-in would fail with a redirect mismatch error.
**Solution:** I had to add my Supabase callback URL (`https://xxx.supabase.co/auth/v1/callback`) to the authorized redirect URIs in Google Cloud Console AND add my Vercel URL to the Supabase redirect allowlist under Authentication → URL Configuration.

### 2. Bookmarks not appearing in real-time
After adding a bookmark, it wouldn't appear in the list without a page refresh.
**Solution:** I enabled Supabase Realtime by adding the bookmarks table to the `supabase_realtime` publication using `ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;` and set `ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;` in the SQL editor. I also subscribed to `postgres_changes` events in the BookmarkList component so that any INSERT or DELETE is reflected instantly across all open tabs.


### 3. Other users could see my bookmarks
Initially I forgot to enable Row Level Security (RLS) on the bookmarks table.
**Solution:** I added RLS policies that restrict SELECT, INSERT, and DELETE operations to rows where `user_id` matches the authenticated user's ID (`auth.uid()`).

### 4. Input text not visible
The text color in the bookmark form inputs was too similar to the background, making typed text invisible.
**Solution:** I explicitly set `text-slate-900` and `bg-white` on the input fields, along with `placeholder:text-slate-400` for placeholder text contrast.