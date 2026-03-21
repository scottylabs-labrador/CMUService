# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CMUService is a peer-to-peer service marketplace for CMU students to trade skills/services. Built with Next.js 15 App Router, Supabase (PostgreSQL + real-time), Clerk (auth), Stripe (payments), and MinIO (file storage).

## Commands

All commands run from the `app/` directory:

```bash
cd app
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npm start        # Start production server
```

No test framework is configured.

## Architecture

### Service Dependencies
- **Clerk** — Authentication. Middleware in `src/middleware.ts` protects all routes except `/`, `/login`, `/register`, `/services`, `/requests`, `/api/*`. User sync happens via `POST /api/webhooks/clerk`.
- **Supabase** — PostgreSQL database + real-time subscriptions for chat and order status updates.
- **Stripe** — Payment processing. Checkout initiated via `src/app/actions/stripe.ts`, payment confirmation via `POST /api/webhooks/stripe`.
- **MinIO** — S3-compatible object storage hosted on Railway. File operations via `src/lib/minio.ts`. Upload via `POST /api/upload`, delete via `DELETE /api/delete-image`.

### Route Structure
The `src/app/(main)/` route group shares a layout with Navbar and Sidebar. Key routes:
- `/` — Homepage with Hero and ScrollJourney landing
- `/services`, `/requests` — Public marketplace browsing
- `/dashboard/*` — Authenticated user area (my-requests, my-services, buying, selling, settings)
- `/checkout/[serviceId]` — Stripe checkout flow
- `/orders/[orderId]` — Order management + in-order chat
- `/profile/[userId]` — Public user profiles
- `/review/[orderId]` — Post-order review/ratings

### Data Flow
- **Reads:** Components query Supabase client directly
- **Mutations:** Next.js Server Actions (`src/app/actions/`)
- **Real-time:** Supabase subscriptions in `OrderChat.tsx` and order status components
- **Auth state:** `src/context/AuthContext.tsx` provides app-wide auth state from Clerk

### UI Stack
- Shadcn/ui (New York style) + Radix UI primitives
- Tailwind CSS v4 with `@/*` path alias pointing to `src/`
- Framer Motion for animations, Three.js for 3D effects (LiquidEther, 3d-marquee)
- `cn()` utility from `src/lib/utils.ts` for conditional class merging

## Required Environment Variables

Create `app/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_BASE_URL=
MINIO_ENDPOINT=
MINIO_REGION=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_NAME=
NEXT_PUBLIC_MINIO_PUBLIC_URL=
```

Clerk keys are also required — check Clerk dashboard for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
