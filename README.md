# Prompt2Video AI

Turn any text prompt into a studio-quality video. Prompt2Video AI writes the script, fetches visuals, generates voiceover, builds a Remotion timeline, and exports an MP4 — all in one platform.

---

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Tech Stack](#tech-stack)
3. [User Flows](#user-flows)
4. [Video Pipeline (Technical Flow)](#video-pipeline-technical-flow)
5. [Project Structure](#project-structure)
6. [Setup & Installation](#setup--installation)
7. [Environment Variables](#environment-variables)
8. [How to Use](#how-to-use)
9. [Scripts & Commands](#scripts--commands)
10. [API Overview](#api-overview)

---

## What This App Does

| Area | Description |
|------|-------------|
| **Landing page** | Marketing site with features, templates, pricing, FAQ, and demo video |
| **Dashboard** | User home — stats, quick actions, recent projects |
| **Create flow** | Enter a prompt → AI generates script, scenes, assets, and voiceover |
| **Video editor** | Timeline, scene list, voice controls, captions, platform presets, export |
| **Templates** | Browse free/premium templates and start a video from a template |
| **Store** | Buy premium templates (Stripe in production, instant unlock in demo mode) |
| **Billing** | Subscription plans (Free, Starter, Pro, Enterprise) via Stripe |
| **Admin panel** | Users, templates, orders, coupons, render queue, audit logs |
| **Render worker** | Background BullMQ worker renders final MP4 with Remotion |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | App Router, API routes, server components |
| **React 19** | UI components and client interactivity |
| **TypeScript** | Type-safe codebase |
| **Tailwind CSS v4** | Styling and responsive layout |
| **shadcn/ui + Radix UI** | Buttons, cards, dialogs, forms, etc. |
| **Framer Motion** | Page animations and transitions |
| **GSAP** | Advanced motion (where used) |
| **Zustand** | Editor state, UI state (sidebar, command palette) |
| **TanStack Query** | Server state / data fetching |
| **Remotion Player** | Live video preview in the editor |
| **Lucide React** | Icons |
| **Sonner** | Toast notifications |
| **next-themes** | Light / dark mode |

### Backend & Data

| Technology | Purpose |
|------------|---------|
| **Prisma 7** | ORM and database schema (25+ models) |
| **SQLite** | Local demo database (`prisma/demo.db`) |
| **PostgreSQL** | Production database (via `@prisma/adapter-pg`) |
| **Redis** | Cache, rate limiting, BullMQ job queue |
| **BullMQ** | Async render job queue |
| **Zod** | API request validation |

### Auth & Billing

| Technology | Purpose |
|------------|---------|
| **Clerk** | Sign-in, sign-up, user sessions (production) |
| **Demo mode** | Cookie-based auth with 3 seeded demo users (no Clerk needed) |
| **Stripe** | Subscriptions and template purchases |
| **AES-256-GCM** | Encrypted storage of user API keys |

### AI & Media

| Technology | Purpose |
|------------|---------|
| **Google Gemini** | Script generation (free mode) |
| **OpenRouter** | AI fallback |
| **OpenAI / Anthropic** | Premium BYOK script generation |
| **Pexels / Pixabay / Unsplash** | Stock images and video |
| **msedge-tts (Edge TTS)** | Free neural voiceover (no API key) |
| **ElevenLabs** | Premium voiceover (BYOK) |
| **picsum.photos** | Demo placeholder images when no asset API keys |

### Video & Storage

| Technology | Purpose |
|------------|---------|
| **Remotion 4** | Video compositions, transitions, captions |
| **@remotion/renderer** | Server-side MP4 rendering |
| **FFmpeg** | Required by Remotion render worker |
| **Cloudflare R2** | Production file storage (S3-compatible) |
| **Local `public/demo-assets/`** | Demo mode file storage |

### DevOps

| Technology | Purpose |
|------------|---------|
| **Docker Compose** | PostgreSQL + Redis + app containers |
| **Vitest** | Unit tests |
| **ESLint + Prettier** | Linting and formatting |
| **tsx** | Run TypeScript workers directly |

---

## User Flows

### 1. Landing Page → Sign Up / Demo

```
Visitor lands on /
  → Browse Features, Templates, Pricing, FAQ (anchor links)
  → Click "Start creating" or "Enter demo"
  → Demo mode: pick a demo user (Alex / Jordan / Sam)
  → Production: Clerk sign-up → onboarding → dashboard
```

### 2. Create a Video

```
Dashboard → Create (/create)
  → Enter prompt (min 10 characters)
  → Choose style (cinematic, educational, social, etc.)
  → Choose duration (30s – 3 min)
  → Optional: pick a template (/create?templateId=...)
  → Click "Generate Video"
  → API creates video record and runs AI pipeline
  → Redirect to /videos/[id] (progress view)
  → When ready → open /editor/[id]
```

### 3. Video Editor

```
/editor/[id]
  → Left: scene list (reorder, select scenes)
  → Center: Remotion preview player
  → Bottom: timeline with scene blocks
  → Right: voiceover panel (voice select, regenerate, preview)
  → Right: scene controls (narration, duration, transition)
  → Right: caption editor
  → Top: export dialog → triggers BullMQ render job
  → Render worker produces final MP4
```

### 4. Templates

```
/templates
  → Browse all published templates (search, filter, categories)
  → Favorite templates (heart icon)
  → Free or owned templates → "Use template" → /create?templateId=...
  → Locked premium templates → redirect to Store to purchase
```

### 5. Template Store

```
/store
  → Browse premium templates
  → "Buy template" → Stripe checkout (production)
  → Demo mode: instant unlock (no payment)
  → "My purchases" shows owned templates
  → Purchased templates → "Use template" → create flow
```

### 6. Projects & Dashboard

```
/dashboard     → overview, stats, quick actions
/projects      → all videos with status filters
/settings      → profile, appearance, notifications
/settings/api-keys → add OpenAI, Gemini, ElevenLabs, etc. (BYOK)
/billing       → view plan, upgrade via Stripe
```

### 7. Admin Panel (admin users only)

```
/admin
  → /admin/users        — manage users
  → /admin/templates    — CRUD templates
  → /admin/orders       — purchase history
  → /admin/coupons      — discount codes
  → /admin/render-queue — monitor render jobs
  → /admin/audit-logs   — security audit trail
```

### 8. Voice Regeneration

```
Editor → Voice panel → select voice (Jenny, Guy, Davis, etc.)
  → Click "Regenerate Voice"
  → Edge TTS synthesizes narration MP3
  → If a voice fails, auto-fallback to another voice
  → Audio + subtitles saved to scene
```

---

## Video Pipeline (Technical Flow)

```
User prompt
    │
    ▼
┌─────────────────┐
│  AI Script Gen  │  Gemini / OpenRouter / OpenAI / Anthropic
│  (lib/ai/script)│  Demo: mock script if no API keys
└────────┬────────┘
         ▼
┌─────────────────┐
│ Scene Breakdown │  Title, narration, visual prompt, duration
└────────┬────────┘
         ▼
┌─────────────────┐
│  Asset Fetch    │  Pexels / Pixabay / Unsplash
│  (lib/ai/assets)│  Demo: picsum.photos placeholders
└────────┬────────┘
         ▼
┌─────────────────┐
│  TTS Voiceover  │  Edge TTS (free) / ElevenLabs (BYOK)
│  (lib/ai/tts)   │  Generates MP3 + word-level subtitles
└────────┬────────┘
         ▼
┌─────────────────┐
│ Remotion Build  │  Scenes → composition JSON (lib/remotion/builder)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Video Editor   │  User edits scenes, voice, captions
└────────┬────────┘
         ▼
┌─────────────────┐
│  Render Queue   │  BullMQ job → render worker
│  (BullMQ/Redis) │  Remotion bundles + renders MP4
└────────┬────────┘
         ▼
┌─────────────────┐
│  File Storage   │  R2 (production) or local demo-assets/
└────────┬────────┘
         ▼
    MP4 download
```

---

## Project Structure

```
prompt2video-ai/
├── prisma/
│   ├── schema.prisma      # 25+ models (User, Video, Scene, Template, etc.)
│   ├── seed.ts            # Demo users, templates, settings
│   └── demo.db            # SQLite database (local demo)
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── (dashboard)/                # Dashboard layout + sidebar
│   │   │   ├── dashboard/              # Home
│   │   │   ├── create/                 # Video creation form
│   │   │   ├── projects/               # Video list
│   │   │   ├── videos/[id]/            # Generation progress
│   │   │   ├── templates/              # Template library
│   │   │   ├── store/                  # Premium template store
│   │   │   ├── settings/               # User settings
│   │   │   └── billing/                # Subscription plans
│   │   ├── (editor)/editor/[id]/       # Full-screen video editor
│   │   ├── (admin)/admin/              # Admin portal
│   │   └── api/                        # REST API routes
│   ├── components/
│   │   ├── landing/       # Navbar, hero, pricing, FAQ, footer
│   │   ├── editor/        # Timeline, scenes, voice, captions, export
│   │   ├── templates/     # Template cards and browser
│   │   ├── layout/        # Sidebar, header, command palette
│   │   └── demo/          # Demo auth, user switcher, banners
│   ├── lib/
│   │   ├── ai/            # Script, assets, TTS
│   │   ├── remotion/      # Composition builder, renderer
│   │   ├── pipeline.ts    # End-to-end video generation
│   │   ├── queue.ts       # BullMQ setup
│   │   ├── storage.ts     # R2 / local file upload
│   │   ├── stripe.ts      # Checkout sessions
│   │   ├── auth.ts        # Clerk + demo auth
│   │   └── templates.ts   # Template helpers
│   ├── remotion/          # Remotion compositions and components
│   ├── stores/            # Zustand (editor, UI)
│   └── workers/           # Background render worker
├── public/demo-assets/    # Local uploads in demo mode
├── .env.example           # Environment template
└── docker-compose.yml     # PostgreSQL + Redis + app
```

---

## Setup & Installation

### Prerequisites

- **Node.js 22+**
- **npm**
- **Redis** (for render queue — optional for basic demo)
- **FFmpeg** (only needed for the render worker)

### Option A — Local Demo (Recommended, No Docker)

Works without Clerk, Stripe, PostgreSQL, or API keys.

```bash
# 1. Go to project folder
cd prompt2video-ai

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

Make sure `.env` has at minimum:

```env
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
DATABASE_URL=file:./prisma/demo.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
ENCRYPTION_KEY=<run command below to generate>
```

Generate encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
# 4. Create database and seed demo data
npm run db:push
npm run db:seed

# 5. Start the app
npm run dev
```

Open **http://localhost:3000**

> **Optional:** Start Redis and the render worker for full MP4 export:
> ```bash
> # Terminal 2 — render worker (requires Redis + FFmpeg)
> npm run worker
> ```

### Option B — Production Setup (PostgreSQL + Docker)

```bash
cd prompt2video-ai
npm install
cp .env.example .env
```

Edit `.env`:
- Set `DEMO_MODE=false` and `NEXT_PUBLIC_DEMO_MODE=false`
- Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prompt2video`
- Add real Clerk, Stripe, and R2 credentials

```bash
# Start PostgreSQL and Redis
docker compose up postgres redis -d

# Initialize database
npm run db:push
npm run db:seed

# Terminal 1 — app
npm run dev

# Terminal 2 — render worker
npm run worker
```

### Demo Users (No Login Required)

When `DEMO_MODE=true`, pick a user on the sign-in page or switch via the header menu:

| User | Plan | Access |
|------|------|--------|
| **Alex Creator** | Free | 5 videos/month, watermarked exports |
| **Jordan Pro** | Pro | Unlimited videos, premium templates, BYOK |
| **Sam Admin** | Enterprise | Everything + `/admin` panel |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEMO_MODE` | Demo | `true` = skip Clerk/Stripe, use cookie auth |
| `NEXT_PUBLIC_DEMO_MODE` | Demo | Shows demo UI on client |
| `DATABASE_URL` | Yes | `file:./prisma/demo.db` (SQLite) or PostgreSQL URL |
| `REDIS_URL` | Worker | Redis connection for BullMQ render queue |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` |
| `ENCRYPTION_KEY` | Yes | 64-char hex string for API key encryption |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Prod | Clerk public key |
| `CLERK_SECRET_KEY` | Prod | Clerk secret key |
| `STRIPE_SECRET_KEY` | Prod | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Prod | Stripe webhook signing secret |
| `R2_*` | Prod | Cloudflare R2 storage credentials |
| `GEMINI_API_KEY` | Optional | Free AI script generation |
| `OPENROUTER_API_KEY` | Optional | AI fallback |
| `PEXELS_API_KEY` | Optional | Stock assets |
| `EDGE_TTS_ENABLED` | Optional | Free TTS (enabled by default) |

See `.env.example` for the full list.

---

## How to Use

### Step 1 — Open the App

1. Run `npm run dev` in the project folder.
2. Go to **http://localhost:3000**.
3. Click **Enter demo** or **Try free** on the landing page.
4. You land on the **Dashboard** with the sidebar on the left.

### Step 2 — Create Your First Video

1. Click **Create** in the sidebar (or the **Create Video** button in the header).
2. Type a prompt, for example:
   > Create a 60-second product launch video for an AI writing app called WriteFlow. Highlight speed, quality, and ease of use.
3. Pick a **visual style** (e.g. Cinematic) and **duration** (e.g. 1 min).
4. Click **Generate Video**.
5. Wait on the progress page — the AI pipeline writes the script, creates scenes, fetches images, and generates voiceover.
6. When status is **Editing**, click **Open Editor**.

### Step 3 — Edit in the Video Editor

1. **Scene list** (left) — click scenes to select, drag to reorder.
2. **Preview** (center) — play/pause the Remotion preview.
3. **Timeline** (bottom) — see scene durations and transitions.
4. **Voice panel** (right):
   - Pick a voice (Jenny, Guy, Davis, etc.).
   - Click **Regenerate Voice** to re-synthesize narration.
5. **Scene controls** (right) — edit narration text per scene.
6. **Captions** — adjust subtitle style and position.
7. **Platform selector** — switch aspect ratio (16:9, 9:16, 1:1).

### Step 4 — Use a Template

1. Go to **Templates** in the sidebar.
2. Browse or search templates.
3. Click **Use template** on any free template.
4. You are taken to **Create** with the template pre-selected and a starter prompt filled in.
5. Edit the prompt and click **Generate Video**.

### Step 5 — Buy a Premium Template (Store)

1. Go to **Store** in the sidebar.
2. Browse premium templates.
3. Click **Buy template**.
   - **Demo mode:** unlocks instantly.
   - **Production:** redirects to Stripe checkout.
4. After purchase, the template appears under **My purchases**.
5. Click **Use template** to create a video with it.

### Step 6 — Export the Final Video

1. In the editor, click **Export** in the toolbar.
2. Choose resolution and format.
3. Click **Start Render** — a BullMQ job is queued.
4. The render worker (Terminal 2: `npm run worker`) processes the job.
5. When complete, download the MP4 from the export dialog or video page.

### Step 7 — Manage Account

| Page | What you can do |
|------|-----------------|
| **Projects** | View all videos, filter by status, open editor |
| **Settings** | Change theme, update profile |
| **API Keys** | Add your own OpenAI, Gemini, ElevenLabs keys (BYOK) |
| **Billing** | View plan, upgrade (Stripe or demo simulation) |

### Step 8 — Admin (Sam Admin demo user only)

1. Switch to **Sam Admin** via the user menu in the header.
2. Open **Admin panel** from the sidebar bottom.
3. Manage users, templates, orders, coupons, and render queue.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette (quick navigation) |

### Example Prompts to Try

```
Create a 30-second product launch video for an AI writing app called WriteFlow.

Write a 40-second cinematic video script about a robot discovering music in a neon city.

Generate a 50-second video pitch for a coffee subscription startup named BeanBox.

Make a 30-second educational explainer about how solar panels work for homeowners.
```

---

## Scripts & Commands

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run worker       # Start BullMQ render worker
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed demo users, templates, settings
npm run db:studio    # Open Prisma Studio (database GUI)
npm run test         # Run Vitest tests
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET/POST | `/api/videos` | List / create videos |
| GET/PATCH/DELETE | `/api/videos/[id]` | Video CRUD |
| POST | `/api/videos/[id]/render` | Queue render job |
| POST | `/api/videos/[id]/scenes/[sceneId]/voice` | Regenerate scene voice |
| POST | `/api/videos/[id]/voice` | Regenerate all voices |
| GET | `/api/templates` | List templates (auth) |
| GET | `/api/templates/public` | Public template list |
| POST | `/api/templates/[id]/favorite` | Toggle favorite |
| POST | `/api/templates/[id]/checkout` | Buy premium template |
| GET/POST | `/api/api-keys` | Manage BYOK API keys |
| POST | `/api/billing/checkout` | Stripe subscription checkout |
| GET | `/api/demo/users` | List demo users |
| GET | `/api/admin/stats` | Admin analytics |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` on database | Use SQLite: `DATABASE_URL=file:./prisma/demo.db` and run `npm run db:push` |
| Clerk key error | Set `DEMO_MODE=true` to bypass Clerk |
| Voice regenerate fails | Edge TTS auto-falls back to another voice; try Jenny or Guy |
| Render stuck | Ensure Redis is running and `npm run worker` is started |
| 404 on /templates or /store | Run latest code — pages are under `(dashboard)/templates` and `(dashboard)/store` |
| Port 3000 in use | Kill the old process or use `npx next dev -p 3001` |

---

## License

Proprietary — All rights reserved.
#   P r o m t 2 v i d e o  
 