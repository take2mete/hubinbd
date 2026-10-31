# HubinBD Agent Rules - MUST FOLLOW

This is HubinBD - Bangladesh's Digital Hub.
Stack: Next.js 15 + TypeScript + Tailwind CSS

## RULES FOR AI (ChatGPT/Claude)
1. NEVER write all tools in one file (like index.html). Each tool must be a separate component in /components/tools/
2. Keep /app/page.tsx lightweight - only listing tools
3. Each tool page lives in /app/tools/[tool-name]/page.tsx
4. Use TypeScript, no 'any'
5. Use client components only when needed ('use client')
6. Follow TripBD pattern: lib/ for logic, components/ for UI
7. No inline huge CSS - use Tailwind classes
8. Always export metadata for SEO

## Tool Template
- Title, Description, Input, Result, How to Use
- Must work offline (no API needed for basic tools)
- Bengali + English support
- Mobile responsive

## DO NOT
- Delete other tools while editing one
- Create run.html or single huge HTML file
- Use 100% HTML
