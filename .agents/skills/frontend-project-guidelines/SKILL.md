---
name: frontend-project-guidelines
description: Project-specific React, TypeScript, CSS Modules, and shared component conventions for the onboarding frontend. Use when editing or reviewing files in this frontend repo, especially React components, CSS module files, shared components, layout code, or page code.
---

# Frontend Project Guidelines

Apply these conventions when changing this repository.

## Components

- Keep components small and colocate component-only styles next to the component.
- Name a CSS module like the component with the first letter lowercased: `MainLayout.tsx` -> `mainLayout.module.css`, `UserInfo.tsx` -> `userInfo.module.css`.
- Import CSS modules as `classes`:

```tsx
import classes from './mainLayout.module.css';
```

- Put reusable UI in `src/shared/components/<ComponentName>/<ComponentName>.tsx`.
- Export shared components from `src/shared/components/index.ts` for short imports:

```tsx
import { UserRoleBadge } from '@/shared/components';
```

- Do not add `index.ts` files inside each individual component folder unless the project convention changes.
- Use explicit prop types or small `interface Props` declarations.
