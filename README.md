# PeerSolve

Anonymous student Q&A platform built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- 🎭 **Anonymous identities** — generated on signup (e.g. `SilentTiger42`)
- 🔐 **Email/password auth** via Supabase Auth
- 📝 **Post doubts** — title + content
- 💬 **Flat replies** — no nesting
- 👍 **Upvotes** — one per user per post, toggleable
- 🛡️ **Protected routes** — middleware-based redirect
- 📱 **Responsive** — works on mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + Postgres) |
| Deployment | Vercel |
| Language | TypeScript |

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd peersolve
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, paste and run the contents of `supabase/schema.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon` public key

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Supabase Configuration

### Authentication Settings

In your Supabase dashboard → **Authentication → Settings**:

1. **Email Auth**: Enable "Email + Password" sign-in
2. **Email Confirmation**: For MVP/development, disable "Confirm email" to allow instant login
   - Go to Auth → Settings → Email Auth → turn off "Confirm email"
3. **Site URL**: Set to `http://localhost:3000` for local dev, your Vercel URL for production

### Database Schema

The schema (`supabase/schema.sql`) creates:

```
users       id, email, anon_name, created_at
posts       id, user_id, title, content, upvotes, created_at
replies     id, post_id, user_id, content, created_at
votes       id, user_id, post_id  [UNIQUE user_id+post_id]
```

All tables have **Row Level Security (RLS)** enabled with appropriate policies.

---

## Deploying to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts, then add environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Option B: Vercel Dashboard

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables in the UI:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

### After Deploying

Update in Supabase dashboard → **Authentication → Settings**:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: Add `https://your-app.vercel.app/**`

---

## Project Structure

```
peersolve/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirect to /feed or /login
│   ├── globals.css               # Tailwind base + CSS variables
│   ├── login/page.tsx            # Login form
│   ├── signup/page.tsx           # Signup with anon name generator
│   ├── feed/page.tsx             # Post feed (server component)
│   ├── create-post/page.tsx      # Create post form
│   └── post/[id]/
│       ├── page.tsx              # Post detail (server component)
│       ├── post-detail-actions.tsx  # Upvote client component
│       └── post-detail-replies.tsx  # Replies client component
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── avatar.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── layout/
│   │   └── navbar.tsx
│   ├── posts/
│   │   └── post-card.tsx
│   └── replies/
│       ├── reply-card.tsx
│       └── reply-form.tsx
│
├── lib/
│   ├── utils.ts                  # cn(), formatRelativeTime()
│   ├── anon-names.ts             # Anonymous username generator
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       ├── server.ts             # Server Supabase client
│       └── middleware.ts         # Session management
│
├── hooks/
│   └── use-toast.ts              # Toast notification hook
│
├── types/
│   └── index.ts                  # TypeScript interfaces
│
├── supabase/
│   └── schema.sql                # Database schema + RLS
│
├── middleware.ts                  # Route protection
└── .env.local.example            # Environment template
```

---

## Architecture Decisions

**Server + Client components**: Feed and post detail pages are server components for fast initial load. Interactive elements (upvote, reply form) are client components.

**Anonymous identity**: Generated once at signup, stored in `users.anon_name`. Never changes. Email is stored but never shown in UI.

**Upvote consistency**: Vote record in `votes` table + `posts.upvotes` counter updated together. The counter is denormalized for fast reads.

**Middleware protection**: All routes except `/login`, `/signup`, and `/` redirect to login if unauthenticated.

---

## Known Limitations (MVP Scope)

- No real-time updates (refresh to see new posts/replies)
- No pagination (loads all posts)
- Upvote counter can drift if both operations don't complete atomically

These can be addressed post-MVP with Supabase Realtime, cursor pagination, and database functions.
