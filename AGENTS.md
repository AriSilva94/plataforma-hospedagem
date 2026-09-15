<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend Instructions

These instructions apply to all frontend development.

Also follow all instructions from the root `AGENTS.md`.

## Stack

Frontend:

- Next.js
- TypeScript

Follow the actual frontend dependencies and conventions already present in the project.

Do not introduce a new styling system, state management library or component library without explicit approval.

## Styling

Inline styles are prohibited.

Never use:

```tsx
style={{ ... }}
```

Prefer the existing project styling system.

Do not introduce a second styling strategy.

If inline styling is technically unavoidable:

1. verify that there is no reasonable alternative;
2. keep it minimal;
3. explain the reason to the developer.

## Components

- Prefer reusable components when there is actual reuse.
- Do not abstract components prematurely.
- Keep components focused.
- Prefer composition over highly configurable components.
- Follow existing folder and naming conventions.

## React / Next.js

- Respect Server Component and Client Component boundaries.
- Do not add `"use client"` without necessity.
- Keep business rules in the backend.
- Frontend must not be the source of truth for payments, reservations, availability or authorization.
- Avoid unnecessary client-side state.

## Code Quality

- Prefer self-documenting code.
- Do not add obvious comments.
- Do not add unnecessary JSDoc.
- Avoid `any`.
- Remove debug logs before finishing.
- Avoid overengineering.
- Avoid unnecessary abstractions.

## Before Finishing

Check specifically for:

- inline styles;
- unnecessary `"use client"`;
- duplicated components;
- business rules incorrectly implemented in the frontend;
- unnecessary comments;
- responsiveness regressions;
- TypeScript errors.
