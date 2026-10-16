# SKY Forge — Storefront UI

Animated e-commerce frontend: Vite + React 18 + TypeScript, Tailwind, Framer Motion, GSAP/ScrollTrigger, Lenis, React Router v6, Zustand, TanStack Query, Embla, react-hook-form + zod.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
```

## Data flow (API-ready)

```
UI (pages/components)
  └─ hooks/queries.ts        TanStack Query hooks — the only thing the UI calls
       └─ services/index.ts  picks mock or HTTP implementation from VITE_USE_MOCK
            ├─ services/mock/   in-browser fakes over src/data/mock (latency, paging, 404s)
            └─ services/http/   fetch client → ASP.NET Core
```

- **The UI never imports `src/data/mock`.** Only `services/mock` does.
- Contracts live in `src/services/contracts.ts`. Each interface maps to one controller, and the endpoint is noted in a comment above each method.
- Types in `src/types` are camelCase, matching System.Text.Json defaults.
- Static editorial imagery (hero, lookbook, about) lives in `src/config/media.ts`. It's brand content, not API data.

### Switching to the real API

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=/api      # proxied to https://localhost:7001 by vite.config.ts
```

The HTTP client sends `Authorization: Bearer <token>` once the user signs in, and parses errors as `ProblemDetails`. Arrays go out as repeated query keys (`?sizes=S&sizes=M`), which bind to `string[]` in ASP.NET Core.

| Endpoint | Notes |
| --- | --- |
| `GET /products` | `category, collection, tag, sizes[], colors[], minPrice, maxPrice, search, sort, page, pageSize` → `PagedResult<Product>` |
| `GET /products/{slug}` | 404 → "not found" page |
| `GET /products/{id}/related?type=similar\|complete-the-look&limit=` | |
| `GET /products/search?q=&limit=` | instant search overlay |
| `GET /products/facets?category=` | `{ sizes, colors:[{name,hex}], minPrice, maxPrice }` |
| `GET /categories`, `GET /collections` | |
| `GET /orders`, `POST /orders` | `CreateOrderRequest` |
| `POST /auth/login`, `POST /auth/register` | → `{ token, user }` |
| `GET /account/me`, `GET /account/addresses` | |
| `GET /content/ugc`, `POST /newsletter`, `POST /contact` | |

Colour filters use **colour families** (Black, Blue, Red…), not exact hexes. The mock derives the family from the hex in `colorFamily()`. The API should either store a family per colour or use the same mapping.

## Motion notes

- Route changes use a curtain wipe. The page wrapper only fades, because a transformed parent would break GSAP `pin`.
- Card → product page is a FLIP via `SharedImageOverlay`. `layoutId` can't span routes that unmount and reset scroll. `layoutId` is used for card → quick view, tabs, and the step indicator.
- Every GSAP effect is inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`. Lenis is disabled for reduced motion, and `MotionConfig reducedMotion="user"` limits Framer to fades.
- The brand loader shows once per browser (`localStorage["skyforge-visited"]`). Clear that key to see it again.
