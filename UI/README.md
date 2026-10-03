# ScamShield — Frontend (UI)

Web client for **ScamShield**, built with **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4** and **shadcn/ui**.

---

## Getting started

```bash
cd UI
npm install
npm run dev        # http://localhost:3000
```

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the dev server                         |
| `npm run build`     | Build for production                         |
| `npm run start`     | Run the production build                     |
| `npm run lint`      | Lint with ESLint                             |
| `npm run format`    | Format `.ts/.tsx` files with Prettier        |
| `npm run typecheck` | Type-check with `tsc --noEmit`               |

---

## Libraries

### Core

| Library                  | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `next` (16)              | React framework — App Router, file-based routing, SSR           |
| `react` / `react-dom` (19) | UI library                                                    |
| `typescript`             | Static typing                                                   |

### UI & styling

| Library                        | Purpose                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| `tailwindcss` (v4) + `@tailwindcss/postcss` | Utility-first CSS. Theme tokens live in `src/app/globals.css` |
| `shadcn`                       | CLI that copies UI components into `src/components/ui` (style: `base-vega`, base color: `zinc`) |
| `@base-ui/react`               | Headless, accessible primitives used by shadcn components            |
| `class-variance-authority`     | Typed component variants (`cva`) — e.g. button sizes/variants        |
| `cn`                           | Class name helper used by shadcn components                          |
| `tw-animate-css`               | Tailwind animation utilities                                         |
| `@phosphor-icons/react`        | Icon set                                                             |
| `next-themes`                  | Light / dark / system theme (press **`d`** to toggle)                |

### State

| Library   | Purpose                                                                 |
| --------- | ----------------------------------------------------------------------- |
| `zustand` | Lightweight global state. Stores live in `src/store` (e.g. `auth.store.ts`) |

### Tooling (dev)

| Library                        | Purpose                                         |
| ------------------------------ | ----------------------------------------------- |
| `eslint` + `eslint-config-next`| Linting                                         |
| `prettier` + `prettier-plugin-tailwindcss` | Formatting + automatic Tailwind class sorting |

---

## Project structure

```text
UI/
├── public/                     # Static assets served from "/"
│   ├── icons/
│   ├── images/
│   └── locales/                # Translation files (i18n)
├── src/
│   ├── app/                    # Next.js App Router (routes)
│   │   ├── layout.tsx          # Root layout: fonts, ThemeProvider, RoleSwitcher
│   │   ├── globals.css         # Tailwind + design tokens
│   │   ├── (auth)/             # /login, /register, /forgot-password, /reset-password
│   │   ├── (guest)/            # Guest area — "/" and /guest/*
│   │   ├── (user)/             # Registered user area — /user/*
│   │   ├── (moderator)/        # Moderator area — /moderator/*
│   │   └── (admin)/            # Admin area — /admin/*
│   ├── components/
│   │   ├── ui/                 # shadcn components (button, native-select, ...)
│   │   ├── shared/             # Reusable app components (e.g. role-switcher)
│   │   ├── layout/             # Per-role layout parts (header, sidebar, ...)
│   │   │   └── guest | user | moderator | admin
│   │   └── features/           # Feature-specific UI components
│   │       └── admin | check | dashboard | education | moderation | report | whitelist
│   ├── features/               # Feature logic (no UI)
│   │   └── <feature>/
│   │       ├── hooks/          # React hooks for the feature
│   │       ├── schemas/        # Validation schemas / DTO types
│   │       └── services/       # API calls
│   ├── config/
│   │   └── navigation/         # Menu / nav definitions per role
│   ├── hooks/                  # Shared React hooks
│   ├── i18n/                   # Internationalization setup
│   ├── lib/
│   │   ├── api/                # HTTP client setup
│   │   ├── auth/               # Auth helpers
│   │   ├── constants/          # App-wide constants
│   │   ├── utils/              # Generic helpers
│   │   ├── validators/         # Shared validators
│   │   └── utils.ts            # `cn()` class helper
│   ├── providers/              # React context providers (theme-provider)
│   ├── store/                  # Zustand stores (auth.store.ts)
│   └── types/                  # Shared TypeScript types (user.ts)
├── components.json             # shadcn configuration
├── next.config.ts
├── tsconfig.json               # Path alias: "@/*" -> "src/*"
├── .prettierrc
└── eslint.config.mjs
```

### Routing & route groups

Folders wrapped in parentheses, e.g. `(guest)`, are **route groups**: they share a `layout.tsx` but **do not add a URL segment**.

| Route group    | URLs                     | Role        |
| -------------- | ------------------------ | ----------- |
| `(auth)`       | `/login`, `/register`, … | —           |
| `(guest)`      | `/`, `/guest/*`          | `guest`     |
| `(user)`       | `/user/*`                | `user`      |
| `(moderator)`  | `/moderator/*`           | `moderator` |
| `(admin)`      | `/admin/*`               | `admin`     |

`/` and `/guest` render the same page: `src/app/(guest)/page.tsx` re-exports `src/app/(guest)/guest/page.tsx`.

## Conventions

- **Imports:** use the `@/` alias (`@/components/ui/button`) instead of relative paths.
- **Adding shadcn components:**
  ```bash
  npx shadcn@latest add <component>
  ```
  Components are generated into `src/components/ui`.
- **Formatting:** no semicolons, double quotes, 2-space indent, LF line endings (see `.prettierrc`). Run `npm run format` before committing.
- **New feature:** put UI in `components/features/<feature>` and logic (hooks, schemas, services) in `features/<feature>`.
