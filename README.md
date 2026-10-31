# HubinBD — Next.js + TypeScript migration

This branch is the isolated migration workspace for HubinBD.

## Stack

- Next.js App Router
- React + TypeScript (strict mode)
- ESLint with Next.js Core Web Vitals and TypeScript rules

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm start
```

## Current migration state

- `app/` contains the App Router entry point and global stylesheet.
- `components/legacy-frame.tsx` is a temporary compatibility renderer.
- `public/hubinbd-legacy.html` preserves the existing storefront source unchanged.
- `lib/site-config.ts` contains typed category and external destination metadata.
- The legacy storefront is still rendered through a same-origin iframe. This is an interim bridge, **not** a completed React migration.

## Remaining before production cutover

1. Extract the storefront header, navigation, banners, category pages and product cards into React components.
2. Port product CRUD and admin authorization with server-side Supabase checks and RLS policies.
3. Port authentication and all existing routes, then verify mobile and desktop behavior.
4. Configure production environment variables in Vercel; never commit secrets.
5. Run lint, typecheck and production build; test a preview deployment and verify the live domain before switching production.

Do not promote this branch to production until the checklist above has been tested.
