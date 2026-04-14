# CF React Boilerplate

A production-grade React frontend boilerplate engineered for **performance**, **scalability**, and **static deployment on Cloudflare Pages**. Built with IBM Carbon Design System principles, raw CSS only, and a strict separation of concerns.

---

## Stack

| Layer | Technology |
|---|---|
| Build Tool | Vite 6 (Rolldown/OXC pipeline) |
| Framework | React 18 (Concurrent mode) |
| Language | TypeScript 5 (strict mode) |
| Routing | React Router v6 (lazy-loaded pages) |
| State | Zustand 4 (minimal global state) |
| Styling | Raw CSS + IBM Carbon Design Tokens |
| PWA | vite-plugin-pwa + Workbox |
| Deployment | Cloudflare Pages |

---

## Project Structure

```
src/
├── app/                  # App bootstrap
│   ├── Providers.tsx     # Root provider tree
│   ├── router.tsx        # All routes (lazy-loaded)
│   └── RouteLoadingFallback.tsx
│
├── pages/                # One file per route — each is a code-split chunk
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   ├── PostsPage.tsx
│   ├── PostDetailPage.tsx
│   ├── SettingsPage.tsx
│   └── NotFoundPage.tsx
│
├── components/
│   ├── ui/               # Primitives: Button, Card, Tag, Spinner, Skeleton…
│   └── layout/           # Header, Footer, PageShell
│
├── features/             # Feature modules (add domain logic here)
│
├── hooks/                # Reusable hooks
│   ├── useFetch.ts       # Smart caching + dedup data fetcher
│   ├── useTheme.ts
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── useDocumentTitle.ts
│
├── services/
│   ├── http.ts           # Fetch wrapper — edge-compatible, typed
│   └── api.ts            # All API calls (never call fetch from UI)
│
├── store/
│   └── appStore.ts       # Zustand: theme, loading, navigation state
│
├── styles/
│   ├── tokens.css        # IBM Carbon design tokens (light + dark)
│   ├── base.css          # CSS reset + typography foundation
│   ├── layout.css        # Grid, container, flex utilities
│   ├── components.css    # Button, Card, Nav, Form, Skeleton, etc.
│   ├── utilities.css     # Text, spacing, animation helpers
│   └── index.css         # Entry (imports all above)
│
├── utils/
│   ├── cn.ts             # Class name combiner (no clsx dep)
│   ├── format.ts         # Date, number, currency, string formatting
│   ├── storage.ts        # Type-safe localStorage wrapper
│   └── env.ts            # Typed environment variables
│
├── assets/               # Static assets
├── vite-env.d.ts         # Vite + global type declarations
└── main.tsx              # Entry point
```

---

## Architecture Decisions

### Loading UX — No Blank Screens
- `LoadingBar` component shows a top progress bar during route transitions
- Every page uses `Skeleton` components while data loads
- `RouteLoadingFallback` renders immediately during lazy chunk download
- Critical CSS is inlined in `index.html` to prevent FOUC

### Data Fetching — `useFetch`
A custom hook with:
- **In-memory cache** with configurable TTL per key
- **Request deduplication** — identical in-flight requests share one promise
- **Manual mode** for user-triggered fetches
- **Stale-while-revalidate** semantics
- `refetchOnFocus` disabled by default (opt-in per call)

### API Layer
UI components **never** call `fetch` directly. All calls go through:
1. `services/http.ts` — typed fetch with timeout, error normalisation, edge compatibility
2. `services/api.ts` — domain-specific service functions (`postService`, `userService`)

### State — Zustand
Global state is kept minimal: `theme`, `loading` flags, `isNavigating`. Page-level state stays local. No context-provider hell.

### CSS Architecture
Pure CSS with IBM Carbon design tokens as CSS variables:
- `tokens.css` — all spacing, color, typography, motion tokens
- `base.css` — reset, body, type scale
- `layout.css` — 16-column grid, container, flex utilities
- `components.css` — all component styles (no CSS modules, no Tailwind)
- `utilities.css` — helpers, animations

### Code Splitting
Every page is loaded with `React.lazy`. Chunks visible in the build output:
```
vendor.js    — react + react-dom + react-router-dom (~81KB gz)
store.js     — zustand (~4KB gz)
[PageName].js — per-page chunk (1–5KB gz each)
```

---

## Getting Started

```bash
# Install
npm install

# Dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Type-check only
npm run typecheck
```

---

## Deployment — Cloudflare Pages

### Build Settings
| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | `18` or higher |

### SPA Routing
`public/_redirects` contains `/* /index.html 200` — all routes serve `index.html` and React Router handles client-side navigation.

### Headers & Caching
`public/_headers` configures:
- `assets/*` → `Cache-Control: max-age=31536000, immutable` (hashed filenames)
- `*.html` → `max-age=0, must-revalidate` + security headers

### Environment Variables
Set in Cloudflare Pages dashboard under **Settings → Environment Variables**:
```
VITE_API_BASE_URL=https://your-worker.your-subdomain.workers.dev
VITE_APP_VERSION=1.0.0
```

---

## Edge API Integration — Cloudflare Workers

The `http.ts` client is edge-compatible (standard `fetch` API). Structure your Worker as:

```
/api
  /posts      → GET, POST
  /users      → GET, POST
  /users/:id  → GET, PATCH, DELETE
```

CORS, auth headers, and request signing can be added in `http.ts` `request()` function — one place, propagates everywhere.

---

## Extending the Boilerplate

### Add a new page
```bash
# 1. Create the page
touch src/pages/AnalyticsPage.tsx

# 2. Add the route in src/app/router.tsx
const AnalyticsPage = lazy(() => import('@pages/AnalyticsPage'))
{ path: 'analytics', element: <AnalyticsPage /> }

# 3. Add the nav link in src/components/layout/Header.tsx
{ to: '/analytics', label: 'Analytics' }
```

### Add a new API resource
```ts
// In src/services/api.ts
export const analyticsService = {
  getSummary: () => http.get<AnalyticsSummary>('/analytics/summary'),
  getEvents:  (from: string, to: string) =>
    http.get<Event[]>(`/analytics/events?from=${from}&to=${to}`),
}
```

### Add a feature module
```
src/features/analytics/
  ├── AnalyticsChart.tsx    # Feature-specific component
  ├── useAnalytics.ts       # Hook using useFetch + analyticsService
  └── index.ts              # Barrel export
```

---

## PWA

The service worker is auto-generated by Workbox. On `npm run build`:
- All static assets are precached
- API responses are NetworkFirst (5 min TTL)
- Google Fonts are CacheFirst (1 year TTL)
- Full offline support for previously visited pages

Update prompt is handled by `registerSW` in Vite PWA — users get a reload prompt when a new version deploys.

---

## Performance Audit Results (build)

| Metric | Value |
|---|---|
| Initial HTML | 1.83 KB |
| CSS bundle | 22.4 KB (4.9 KB gz) |
| Vendor chunk | 250 KB (81 KB gz) |
| Largest page chunk | 4.7 KB (1.5 KB gz) |
| Total first-load (gz) | ~90 KB |
| Build time | ~800ms |
