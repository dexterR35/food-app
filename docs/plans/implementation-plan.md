# FoodApp — Implementation Plan

## Phase 0: Project Setup
- [ ] `npm create vite@latest food-app -- --template react`
- [ ] Install dependencies: `@supabase/supabase-js`, `@tanstack/react-query`, `@tanstack/react-table`, `react-hook-form`, `zod`, `@hookform/resolvers`, `react-router-dom`, `lucide-react`
- [ ] Install dev: `tailwindcss`, `@tailwindcss/vite`, `autoprefixer`
- [ ] Configure Tailwind with custom tokens (`tailwind.config.js`)
- [ ] Set up `src/index.css` with CSS variables and dark base
- [ ] Create `src/lib/supabase.js`
- [ ] Set up `.env` and `.env.example`
- [ ] Configure `vite.config.js`
- [ ] Set up `vercel.json` (SPA fallback)
- [ ] Init git, add `.gitignore`

## Phase 1: Database & Auth
- [ ] Create Supabase project
- [ ] Run `supabase/migrations/001_schema.sql`
- [ ] Run `supabase/migrations/002_rls.sql`
- [ ] Run `supabase/migrations/003_triggers.sql`
- [ ] Create Storage bucket `avatars` with policies
- [ ] Run `supabase/seeds/001_food_items.sql`
- [ ] Set first admin manually in SQL editor

## Phase 2: Auth UI & Routing
- [ ] `src/lib/supabase.js` — client setup
- [ ] `src/context/AuthContext.jsx` — session, profile, isAdmin, status
- [ ] `src/app/router.jsx` — all routes + guards
- [ ] `src/pages/LoginPage.jsx`
- [ ] `src/pages/RegisterPage.jsx`
- [ ] `src/pages/PendingPage.jsx`
- [ ] `src/pages/RejectedPage.jsx`
- [ ] `src/components/layout/AppLayout.jsx` — sidebar + main area
- [ ] `src/components/layout/Sidebar.jsx`
- [ ] `src/components/layout/Header.jsx`

## Phase 3: Dashboard
- [ ] `src/features/dashboard/DashboardPage.jsx`
- [ ] `src/components/ui/StatCard.jsx`
- [ ] Admin cards: total orders, revenue, calories, pending count
- [ ] User cards: my items, my spend, my calories, goal remaining

## Phase 4: Board & Ordering (Core Feature)
- [ ] `src/features/board/BoardPage.jsx` — today's board shell
- [ ] `src/hooks/useBoard.js` — get/create today's board
- [ ] `src/features/board/components/FoodGrid.jsx` — catalog grid
- [ ] `src/components/ui/FoodCard.jsx`
- [ ] `src/features/board/components/CartDrawer.jsx` — slide-in cart
- [ ] Cart state: local `useState` (items, quantities)
- [ ] `src/features/board/hooks/useSubmitOrder.js` — useMutation
- [ ] Board closed state (show lock message)
- [ ] No board state (show "no board today" message)

## Phase 5: Orders Tables
- [ ] `src/components/ui/DataTable.jsx` — TanStack Table wrapper
- [ ] `src/features/orders/AdminOrdersPage.jsx`
- [ ] `src/features/orders/MyOrdersPage.jsx`
- [ ] `src/hooks/useOrders.js` — queries for both admin + user
- [ ] Admin table columns: user, department, items, total price, total calories, status, time
- [ ] User filter input (admin search by username)
- [ ] CSV export button (`src/utils/exportCsv.js`)
- [ ] Edit/cancel order flow (for user, while board open)

## Phase 6: Real-time
- [ ] `src/hooks/useRealtime.js`
- [ ] Admin: subscribe to `orders` on `board_id`
- [ ] User: subscribe to own orders
- [ ] Board status subscription (open/close live update)
- [ ] Invalidate TanStack Query on events

## Phase 7: Food Catalog (Admin CRUD)
- [ ] `src/features/food/FoodCatalogPage.jsx`
- [ ] `src/features/food/components/FoodForm.jsx` — create/edit modal
- [ ] `src/features/food/hooks/useFoodItems.js`
- [ ] Table with all items, edit/deactivate/delete actions
- [ ] Image URL input (no file upload for food images — use URL)

## Phase 8: User Management (Admin)
- [ ] `src/features/users/AdminUsersPage.jsx`
- [ ] Pending approvals section (top)
- [ ] All users table with role/status filters
- [ ] Approve/reject/edit/delete actions

## Phase 9: Profile & Body Calculator
- [ ] `src/features/users/ProfilePage.jsx`
- [ ] Avatar upload to Supabase Storage
- [ ] Profile form (username, nickname, department, avatar)
- [ ] Body stats form (height, weight, age, gender, activity, goal)
- [ ] `src/utils/bodyCalc.js` — BMR, TDEE, targets, macros
- [ ] `src/hooks/useBodyCalc.js` — computed values from profile
- [ ] Calorie target card + progress bar
- [ ] Macro breakdown display

## Phase 10: Admin Board Management
- [ ] "Create Today's Board" button (dashboard or board page)
- [ ] "Close Board" button with confirmation
- [ ] Board history page (optional)

## Phase 11: Polish & Deploy
- [ ] Loading skeletons for all async states
- [ ] Empty states for all lists/tables
- [ ] Error boundaries
- [ ] Toast notifications (order submitted, board closed, etc.)
- [ ] Responsive cleanup at 1024px
- [ ] Deploy to Vercel
- [ ] Set env vars in Vercel dashboard
- [ ] Smoke test: register → pending → approve → order → admin sees live

---

## Dependency Order

```
Phase 0 → Phase 1 → Phase 2 → Phase 3
                              ↓
                         Phase 4 (core)
                              ↓
                    Phase 5 + Phase 6 (parallel)
                              ↓
              Phase 7 + Phase 8 + Phase 9 (parallel)
                              ↓
                         Phase 10
                              ↓
                         Phase 11
```

## Migration Order

```
001_schema.sql     — all tables (users, food_items, boards, orders, order_items)
002_rls.sql        — all RLS policies
003_triggers.sql   — user auto-create on auth.users insert
004_storage.sql    — avatars bucket + policies (or set in dashboard)
```
