# HubinBD — Bangladesh's Digital Hub

A clean, modular starter built with Next.js 15 App Router, TypeScript, and Tailwind CSS. The UI supports Bangla and English and uses a dark theme.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — local development
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript validation
- `npm run build` — production build
- `npm start` — serve the production build

## Tools architecture

Tool metadata is centralized in `lib/tools.ts`. The homepage reads this registry to render the tool grid. Each tool's UI is isolated in `components/tools/<slug>/` and is routed through `app/tools/[slug]/page.tsx`.

Current tools: Age Calculator and BMI Calculator.

Supabase is intentionally not connected yet. Configure the future public URL and anon key through Vercel environment variables when backend work is requested. Never expose a Supabase service-role key in client code.

See [AGENTS.md](./AGENTS.md) for mandatory repository conventions.
