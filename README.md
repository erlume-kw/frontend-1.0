# erlume — web storefront

Next.js (App Router) + Tailwind CSS frontend for the erlume luxury consignment store.

## Run

```bash
npm install
npm run dev        # http://127.0.0.1:8081
```

The backend API is expected at `http://127.0.0.1:3000` (configurable via
`NEXT_PUBLIC_API_URL` — all URL fallbacks live in `src/lib/config.ts`).

## Structure

- `src/app/` — routes (one folder per page)
- `src/components/` — layout shell, UI, checkout widgets
- `src/contexts/` — cart (persisted) and wishlist state
- `src/services/` — backend API client, email verification
- `src/lib/` — config, brand data, hooks, interactions
- `docs/DESIGN_SYSTEM.md` — design tokens and conventions
