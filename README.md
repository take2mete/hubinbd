# HubinBD v2 - Bangladesh's Digital Hub

Rebuilt from HTML to Next.js (like TripBD pattern)

## Getting Started
npm install
npm run dev

## Structure
- app/page.tsx -> Homepage with tool grid
- app/tools/[slug]/page.tsx -> Each tool
- components/tools/ -> Tool logic components
- lib/tools.ts -> Tool list config

## Add New Tool
1. Add entry in lib/tools.ts
2. Create folder app/tools/your-tool/
3. Create component in components/tools/YourTool.tsx
4. Create page.tsx that imports component

See age-calculator as example.
