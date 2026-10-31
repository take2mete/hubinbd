# HubinBD Agent Rules

## Architecture
- Use Next.js 15 App Router, TypeScript strict mode, and Tailwind CSS.
- Never put the application in a single `index.html` or `run.html`. Do not add either file.
- Keep routes in `app/`, reusable UI in `components/`, and shared data/helpers in `lib/`.
- Tool metadata belongs only in `lib/tools.ts`. Tool UI belongs in its own folder under `components/tools/<tool-slug>/`.
- The homepage must stay lightweight and render its tool grid from `lib/tools.ts`.
- Each tool must be isolated; do not couple tools through shared mutable state.
- Use `'use client'` only for components that require browser state or events.
- Keep server components as the default.

## Quality and safety
- Preserve strict TypeScript; avoid `any` and unsafe casts.
- Keep accessible labels, keyboard operation, and responsive layouts.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` before release.
- Never commit secrets, service-role keys, or real environment values.
- Supabase is future-ready only: add integration through `lib/supabase/` and environment variables when explicitly requested. Do not add a client or connect it in this starter.
- Do not overwrite or delete user data or change deployment targets without explicit instruction.
- Keep changes focused; one tool's errors must not break another tool or the homepage.
