# Deployment Guide

## Environment Setup

Copy `.env.example` to `.env` and configure all variables before deploying.

### Required Services

| Service | Purpose |
|---------|---------|
| PostgreSQL 16 | Primary database |
| Redis 7 | Cache, rate limiting, BullMQ |
| Cloudflare R2 | Video/asset storage |
| Clerk | Authentication |
| Stripe | Billing |

### Optional (Free Mode)

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Free AI script generation |
| `OPENROUTER_API_KEY` | Free AI fallback |
| `PEXELS_API_KEY` | Stock video/images |
| `PIXABAY_API_KEY` | Stock assets |
| `UNSPLASH_ACCESS_KEY` | Stock images |

## Local Development

```bash
docker compose up postgres redis -d
npm install
npm run db:push
npm run db:seed
npm run dev          # Terminal 1
npm run worker       # Terminal 2
```

## Docker Production

```bash
docker compose up -d
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
```

## Vercel Deployment

1. Connect repository to Vercel
2. Set all environment variables from `.env.example`
3. Add build command: `prisma generate && next build`
4. Deploy render worker separately (Railway, Fly.io, or EC2):

```bash
npm run worker
```

The render worker requires:
- FFmpeg installed
- Chromium (for Remotion rendering)
- Access to same PostgreSQL, Redis, and R2

## Clerk Setup

1. Create Clerk application
2. Enable Email + Google + GitHub providers
3. Set redirect URLs:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/onboarding`
4. Add webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
5. For admin access, set user metadata: `{ "role": "admin" }`

## Stripe Setup

1. Create products and prices for Starter, Pro, Enterprise plans
2. Set price IDs in environment variables
3. Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Enable events: `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`

## Cloudflare R2 Setup

1. Create R2 bucket
2. Generate API tokens with read/write access
3. Enable public access or custom domain for `R2_PUBLIC_URL`
4. Configure CORS for browser uploads

## Render Worker Scaling

- Run multiple worker instances for parallel rendering
- Each worker processes 2 concurrent jobs (configurable in `queue.ts`)
- Monitor via `/admin/render-queue`
- Failed jobs auto-retry 3 times with exponential backoff

## Security Checklist

- [ ] Generate unique `ENCRYPTION_KEY` (64-char hex)
- [ ] Enable HTTPS everywhere
- [ ] Configure Clerk production keys
- [ ] Set Stripe webhook secret
- [ ] Restrict admin routes to admin users
- [ ] Set up database backups
- [ ] Configure R2 bucket policies
