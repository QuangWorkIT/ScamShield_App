<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.



# ScamShield VN — Frontend (`UI/`)

Vietnamese anti-scam platform: users check phone numbers/links/accounts for scams,
submit scam reports, file disputes, earn reputation. Moderators review reports;
admins configure rules/content. Monorepo: `../Server` = backend, `UI/` = this app.

**UI language: Vietnamese.** All user-facing text is Vietnamese (with diacritics,
UTF-8). Code, comments, identifiers are English.

## Stack

| Concern    | Tech                                                                 |
| ---------- | -------------------------------------------------------------------- |
| Framework  | Next.js 16 App Router, React 19, TypeScript (strict)                 |
| Styling    | Tailwind CSS v4 (CSS-first, no `tailwind.config`), `tw-animate-css`  |
| Components | shadcn (`base-vega` style) on **`@base-ui/react`** — NOT Radix       |
| Icons      | `@phosphor-icons/react` only (no lucide)                             |
| State      | `zustand` (`src/store/*.store.ts`)                                   |
| Theme      | `next-themes` (class-based dark mode) via `src/providers/theme-provider.tsx` |
| Class util | `cn` from `@/lib/utils` (re-exports the `cn` package)               |

## Commands (run inside `UI/`)

```bash
npm run dev        # dev server (usually already running — don't start another)
npm run typecheck  # tsc --noEmit — run after edits
npm run lint       # eslint
npm run format     # prettier
```

## Project Structure

```
src/
  app/
    layout.tsx              # root: fonts, ThemeProvider, dev RoleSwitcher
    globals.css             # Tailwind v4 + design tokens (oklch CSS vars, light/dark)
    (guest)/guest/...       # public area — header/footer layout
    (auth)/...              # login, register, forgot/reset-password
    (user)/user/...         # registered user portal — sidebar dashboard layout
    (moderator)/moderator/...
    (admin)/admin/...
  components/
    ui/                     # shadcn primitives (button, native-select) — add via shadcn CLI
    layout/<role>/          # per-role shells: header, sidebar, footer
    shared/                 # cross-role components (role-switcher)
    features/<domain>/      # domain UI components (mostly empty scaffolds)
  features/<domain>/{hooks,schemas,services}/   # domain logic (scaffolds)
  config/navigation/        # <role>-nav.ts: nav items + helpers
  store/                    # zustand stores (auth.store.ts)
  types/                    # shared types (user.ts: User, UserRole)
  lib/                      # utils.ts, api/, auth/, constants/, validators/
  providers/                # React context providers
  hooks/, i18n/             # scaffolds
```

Route groups `(role)` contain a real `role/` segment, so URLs are `/guest/...`,
`/user/...`, `/moderator/...`, `/admin/...`. Most `page.tsx` files are
placeholders (`<div>This is ... page</div>`) awaiting implementation.

## Roles & Auth

- `UserRole = "ADMINISTRATOR" | "REGISTERED_USER" | "MODERATOR" | "GUEST" | "BUSINESS_PARTNER"` (`src/types/user.ts`).
- `useAuthStore` (`src/store/auth.store.ts`) holds in-memory `token: string | null` and `user: User | null`.
- **Route Guarding:** Protected route groups (`/admin`, `/user`, `/moderator`) wrap layouts with `<RoleGuard allowedRoles={[...]} />` (`src/components/shared/role-guard.tsx`). Unauthorized roles redirect to `/fobidden`; unauthenticated visitors redirect to `/login`.

## API Integration & Layer Separation

All HTTP communications use centralized Axios instances defined in `src/lib/api/instance.ts`:

### 1. Axios Instances
- **`publicApi`**: For public endpoints that do not require an authorization header (e.g., login, registration, public threat lookup).
- **`authorizeApi`**: For secured endpoints. Contains an Axios request interceptor that automatically reads the JWT token from `useAuthStore.getState().token` and injects `Authorization: Bearer <token>`.

### 2. Separated Architectural Layers
Always maintain strict separation between network operations and presentation:

- **Service Layer (`src/features/<domain>/services/`)**:
  - All direct API calls (`publicApi`, `authorizeApi`) MUST be encapsulated inside feature services (e.g. `auth-services.ts`, `check.service.ts`).
  - Services handle parameter mapping, response data unpacking, store updates (such as `setToken`), and error transformation.
  - Components and pages should NEVER invoke `axios`, `publicApi`, or `authorizeApi` directly.

- **Component Layer (`src/components/features/<domain>/`)**:
  - Feature components invoke service methods to perform actions.
  - Manage user interaction, form validation, loading states, and error alerts.

- **Page Layer (`src/app/**/page.tsx`)**:
  - Pages act as thin composition roots.
  - Pages only assemble components and render data/responses. Do not perform direct API calls or heavy business logic directly in `page.tsx`.

## Navigation Pattern

- Nav items live in `src/config/navigation/<role>-nav.ts` (title, href, iconName,
  optional badge). Icons are referenced by string `iconName` and mapped to
  Phosphor components in the sidebar's `renderIcon`.
- **Active item:** use `getActiveUserNavItem(pathname)` from `user-nav.ts`. It
  picks the *longest* matching href so `/user/reports/new` doesn't also
  highlight `/user/reports`. Never use a bare `pathname.startsWith(href)`.
- The user header breadcrumb title is derived from the active nav item — adding
  a nav item automatically updates the breadcrumb.
- User layout: `UserDashboardShell` = `UserSidebar` (desktop + mobile drawer) +
  `UserHeader` + content.

## Conventions

- Prettier: no semicolons, double quotes, 2 spaces, trailing commas `es5`,
  width 80, LF line endings, Tailwind class sorting (also inside `cn`/`cva`).
- Add `"use client"` only for components using hooks/state/browser APIs; keep
  layouts and pages as Server Components when possible.
- Named exports for components (`export function UserSidebar`); default exports
  only for Next.js `page.tsx` / `layout.tsx`.
- File names: kebab-case (`user-sidebar.tsx`, `auth.store.ts`).
- Imports via `@/` alias (maps to `src/`).
- Always provide dark-mode variants (`dark:`) for colors.

## Design System

- Tokens in `globals.css` (`--primary` deep navy `#0B132B`, `--destructive`
  scam-alert red, `--radius: 0.75rem`, sidebar tokens). Prefer token classes
  (`bg-primary`, `text-muted-foreground`, `border-border`).
- Existing layouts also use literal hex colors from the design spec
  (`#0B132B` navy, `#131B2E` heading text, `#45464D` body text, `#F2F3FF` hover
  tint, `#FAF8FF` page bg, `#C6C6CE` borders, `#BA1A1A` danger). Match these
  when extending those components.
- Fonts: `font-heading` (Source Sans 3), `font-serif` (Roboto Slab, default
  body), `font-sans` (Geist), `font-mono` (Geist Mono).
- Rounded `rounded-lg`/`rounded-xl`, small text sizes (`text-xs`, `text-[11px]`).

## Gotchas

- Windows dev environment (PowerShell). Git may warn about LF→CRLF; files should
  stay LF (Prettier enforces).
- When reading Vietnamese files from PowerShell, output can look garbled — the
  files themselves are UTF-8; don't "fix" the text based on terminal output.
- `@base-ui/react` component APIs differ from Radix (e.g. `render` prop instead
  of `asChild`). Check existing `components/ui/*` before composing.
