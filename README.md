# TechPublisher

A production-grade, ad-supported consumer technology publication built with **Next.js 15 (App Router, JavaScript)**, **Supabase (PostgreSQL + RLS + Auth)**, and pure semantic CSS. Designed for rapid video-to-link conversion from Instagram traffic, high-efficiency editorial reading, and publisher monetization.

---

## Architecture & Core Features

- **Instagram Video Redemption Engine**:
  - Reusable `<CodeBox />` on the homepage and at the end of every article.
  - Server-enforced **two-step redeem flow**:
    - `POST /api/redeem/start`: Normalizes code, queries Supabase via Service Role Key, computes wait duration (`wait_seconds` override or global setting), returns a cryptographically signed HMAC-SHA256 token (`token`) containing `unlockAt` and a 10-minute expiry. Target URL is **never** sent to the client in step 1.
    - Honest client-side countdown with accessible `aria-live="polite"` feedback.
    - `POST /api/redeem/finish`: Verifies token signature and expiry. **Rejects premature requests with HTTP 425 (Too Early)** if `now < unlockAt`. Validates URL protocol (`http:`/`https:`), increments `click_count`, and returns destination URL.
  - In-memory rate limiting (8 requests/min per IP) on all redeem endpoints.
- **Reading Experience & Dynamic Auto-Scroll**:
  - Smooth linear `requestAnimationFrame` auto-scroll down to the article's code box over `scroll_seconds` seconds (configured globally via admin settings, default 40s).
  - Stops immediately and permanently for the session on any user interaction (`wheel`, `touchstart`, `keydown`, `mousedown`).
  - Automatically skipped if `prefers-reduced-motion` is enabled or `scroll_seconds` is `0`.
- **Editorial & SEO Suite**:
  - Cool white (#f5f7fa), ink text (#10151c), and blue accent (#1b4dff) styling with Georgia body and system sans typography.
  - Fully responsive, mobile-first, and semantic (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`).
  - Single `<h1>` per page.
  - Structured JSON-LD metadata: `NewsMediaOrganization` on layout, `Article` and `BreadcrumbList` on article detail pages.
  - Dynamic `sitemap.xml` (`app/sitemap.js`) and `robots.txt` (`app/robots.js`).
  - Commented Google AdSense slots in layout and between article paragraphs, controllable via `NEXT_PUBLIC_ADS_ENABLED`.
  - Zero advertisements permitted inside or adjacent to the redemption box or countdown.
- **Admin Control Center (`/admin`)**:
  - Client-side Supabase Auth (email + password).
  - Excluded from search indexing (`noindex, nofollow`).
  - **Articles Tab**: Full CRUD with auto-slug generation, draft/published toggle, and plain-text paragraph formatting.
  - **Codes Tab**: Add/edit/delete video codes (enforced uppercase, validates `https://`), per-code wait override, active toggle, and click counts.
  - **Settings Tab**: Configure global countdown wait (0–30s) and auto-scroll duration (0–180s).

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Select your closest database region and set a database password.

### 2. Run Database Migrations and Seed Data

1. In your Supabase Dashboard, open the **SQL Editor** from the left sidebar.
2. Create a new query, paste the entire contents of [`supabase/schema.sql`](file:///Users/krishnachaitanya/Documents/project_cornVS/supabase/schema.sql), and click **Run**.
   - This creates `articles`, `codes`, and `settings` tables with constraints, indexes, and strict Row Level Security (RLS) policies.
   - Note: The `codes` table has **no public read policy** for maximum security; only authenticated admins and the server API (via the Service Role Key) can access codes.
3. Open another SQL query, paste the contents of [`supabase/seed.sql`](file:///Users/krishnachaitanya/Documents/project_cornVS/supabase/seed.sql), and click **Run**.
   - This populates three comprehensive, 500+ word articles, initial video codes (`TECH26`, `SMARTPAD`, `QUANTUM`), and initial site settings.

### 3. Create the Admin User

1. In the Supabase Dashboard, navigate to **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
3. Enter your admin email (e.g. `admin@techpublisher.example.com`) and a strong password.
4. Set **Auto Confirm User** to `ON` so the user can log in immediately.

### 4. Turn Off Public Sign-Ups in Supabase

1. Navigate to **Authentication** -> **Providers** -> **Email**.
2. Uncheck **Enable Signups** (or toggle "Allow new users to sign up" to `OFF`).
3. Click **Save**. This guarantees that only users created in the Supabase Dashboard can access the `/admin` control center.

### 5. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Public Site URL (Used for metadataBase, canonical URLs, and OpenGraph cards)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase API Settings (Found in Supabase Dashboard -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Supabase Private Service Role Key (Keep confidential, server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Cryptographic secret for signing HMAC-SHA256 redeem tokens (32+ random characters)
REDEEM_SECRET=replace-with-a-random-32-character-secret-key

# Commercial AdSense Feature Flag (true | false)
NEXT_PUBLIC_ADS_ENABLED=false
```

### 6. Local Development Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to view the public website and `http://localhost:3000/admin` to access the admin portal.

---

## Deployment to Vercel (Free Tier)

1. Push your repository to GitHub or GitLab.
2. Log in to [vercel.com](https://vercel.com) and click **Add New** -> **Project**.
3. Import your repository.
4. In the **Environment Variables** section, add all variables defined in `.env.example`:
   - `NEXT_PUBLIC_SITE_URL`: Your production domain (e.g. `https://techpublisher.com`).
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REDEEM_SECRET`: A newly generated high-entropy random string.
   - `NEXT_PUBLIC_ADS_ENABLED`: `false` (or `true` if your AdSense account is approved).
5. Click **Deploy**.

### Custom Domain Setup

1. In Vercel, navigate to **Project Settings** -> **Domains**.
2. Enter your custom domain (e.g. `techpublisher.com`).
3. Follow the DNS instructions:
   - For apex domain: Point an `A` record to `76.76.21.21`.
   - For `www` subdomain: Point a `CNAME` record to `cname.vercel-dns.com`.
4. Vercel automatically issues and renews an SSL/TLS certificate.

### Google Search Console Verification

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add your property using **URL Prefix** (`https://techpublisher.com`).
3. Select **HTML tag** or **DNS TXT record** verification:
   - If using HTML tag, place the verification code in `app/layout.js` inside `<head>`.
4. Once verified, submit your sitemap at `https://techpublisher.com/sitemap.xml`.

---

## Manual Test Checklist

Before going live, execute these 5 verification tests:

| # | Test Scenario | Steps to Execute | Expected Behavior |
|---|---|---|---|
| 1 | **Wrong / Inactive Code** | Enter `INVALID99` in the code box on homepage or article page and click "Get link". | Returns HTTP 404. Shows error message: *"Code not found. Please double-check the Instagram video."* |
| 2 | **Valid Code with Countdown** | Enter valid seed code `TECH26` or `SMARTPAD` and click "Get link". | Initiates an honest countdown *"Your link opens in Ns"*. When reaching 0, automatically redirects to the destination link. |
| 3 | **Premature Finish Call (Early Bypass Attempt)** | Call `POST /api/redeem/start` via curl to get a token, then immediately send `POST /api/redeem/finish` with that token before countdown expires. | **Fails immediately with HTTP 425 (Too Early)**: `{"error":"Too early. Link unlocks in N seconds."}`. |
| 4 | **Auto-Scroll Cancellation** | Open any article (`/articles/review-aura-one-minimalist-e-ink-tablet`). Wait 1 second for smooth auto-scroll to begin. Touch screen, move mouse wheel, or press a key. | Auto-scroll halts immediately and permanently for the rest of that page session. |
| 5 | **Settings Propagation** | Log into `/admin`, navigate to **Settings**, change Default Countdown to `4` seconds and Auto-Scroll to `20` seconds, then click "Save Settings". | New article visits auto-scroll over 20s; codes without specific overrides now trigger a 4-second countdown. |
# techpublisher
# techpublisher
