# Design System v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the design system documented in `docs/design/design-system-v2.md` — indigo accent, crimson + green palette, purple-tinted borders, proper light/dark mode CSS variables, kiosk-style components throughout the app.

**Architecture:** All color tokens live in CSS variables in `src/index.css` and are mapped to Tailwind utility classes via `tailwind.config.js`. Components use only Tailwind classes referencing those variables — no hardcoded hex. Changes are layered: tokens first, then shared UI components, then layout, then feature pages.

**Tech Stack:** React 18, Tailwind CSS v4, Lucide React icons, existing ThemeContext (already wired).

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `src/index.css` | Modify | New CSS variable palette: indigo accent, crimson, green, purple borders, radius vars, dual mode |
| `tailwind.config.js` | Modify | New token names: `food-crimson`, `food-green`, `food-border-h`, `food-text-inv`; new shadows; borderRadius extension |
| `src/components/ui/Badge.jsx` | Modify | Dot indicator, uppercase tracking, semantic CSS var inline styles (committed atomically with Task 1 to avoid broken state) |
| `src/components/ui/Button.jsx` | Modify | 6 variants incl. success/danger, inline-flex h-10, icon-slot support |
| `src/components/ui/StatCard.jsx` | Modify | Bold font, colored icon badge, delta trend line prop |
| `src/components/ui/Modal.jsx` | Modify | Backdrop blur, better close button ring style |
| `src/components/ui/DataTable.jsx` | Modify | Wider header padding, bold uppercase tracking, divider rows |
| `src/components/ui/LoadingSpinner.jsx` | Modify | Spinning ring (border-t-food-accent pattern) |
| `src/components/layout/Sidebar.jsx` | Modify | Logo component inline, accent left-rail on active, group labels, user chip |
| `src/components/layout/Header.jsx` | Modify | Sticky, breadcrumb area, notification bell with crimson dot |
| `src/components/layout/AppLayout.jsx` | Modify | Sticky header, remove inner max-w wrapper |
| `src/features/board/components/CartDrawer.jsx` | Modify | Kiosk cart: qty controls, calorie+price totals, green submit |
| `src/features/board/components/CartItem.jsx` | Modify | Replace `text-red-500` with `text-food-crimson` |
| `src/features/board/BoardPage.jsx` | Modify | Category tab bar, floating cart pill button |

---

## Task 1: CSS Variables + Tailwind Config

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Replace CSS variables in `src/index.css`**

Replace the entire `:root` and `[data-theme='dark']` blocks with the new v2 palette. Keep `@layer base` and font import intact. Keep the scrollbar styles.

```css
/* src/index.css — replace :root and [data-theme='dark'] blocks */

:root {
  /* Surfaces */
  --food-bg:          #f8fafc;
  --food-card:        #ffffff;
  --food-elevated:    #f1f5f9;
  --food-overlay:     rgba(0, 0, 0, 0.04);

  /* Borders — purple-tinted */
  --food-border:      #ddd6fe;
  --food-border-h:    #a78bfa;

  /* Accent: Indigo */
  --food-accent:      #4f46e5;
  --food-accent-h:    #4338ca;
  --food-accent-d:    #ede9fe;
  --food-accent-glow: rgba(79, 70, 229, 0.12);

  /* Crimson */
  --food-crimson:     #dc2626;
  --food-crimson-h:   #b91c1c;
  --food-crimson-d:   #fee2e2;

  /* Green */
  --food-green:       #16a34a;
  --food-green-h:     #15803d;
  --food-green-d:     #dcfce7;

  /* Text */
  --food-text:        #0f172a;
  --food-text-s:      #475569;
  --food-text-m:      #94a3b8;
  --food-text-inv:    #ffffff;

  /* Status badges */
  --s-open-bg:        #ede9fe; --s-open-tx:        #4338ca;
  --s-closed-bg:      #f1f5f9; --s-closed-tx:      #475569;
  --s-pending-bg:     #fffbeb; --s-pending-tx:     #b45309;
  --s-approved-bg:    #dcfce7; --s-approved-tx:    #15803d;
  --s-rejected-bg:    #fee2e2; --s-rejected-tx:    #b91c1c;
  --s-confirmed-bg:   #eff6ff; --s-confirmed-tx:   #1d4ed8;
  --s-cancelled-bg:   #f3f4f6; --s-cancelled-tx:   #6b7280;
  --s-admin-bg:       #f5f3ff; --s-admin-tx:       #6d28d9;
  --s-user-bg:        #f1f5f9; --s-user-tx:        #475569;

  /* Typography */
  --font-sans: 'Inter', sans-serif;

  /* Border radius */
  --r-sm:   6px;
  --r-md:   10px;
  --r-lg:   14px;
  --r-xl:   20px;
  --r-full: 9999px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,.06), 0 0 0 1px var(--food-border);
  --shadow-lg:   0 8px 32px rgba(0,0,0,.08), 0 0 0 1px var(--food-border);
  --shadow-glow: 0 0 20px var(--food-accent-glow);
}

[data-theme='dark'] {
  --food-bg:          #0b0614;
  --food-card:        #120a1f;
  --food-elevated:    #1b1030;
  --food-overlay:     rgba(255, 255, 255, 0.03);

  --food-border:      #2b1a45;
  --food-border-h:    #7c3aed;

  --food-accent:      #6366f1;
  --food-accent-h:    #4f46e5;
  --food-accent-d:    #1e1345;
  --food-accent-glow: rgba(99, 102, 241, 0.25);

  --food-crimson:     #ef4444;
  --food-crimson-h:   #dc2626;
  --food-crimson-d:   #450a0a;

  --food-green:       #22c55e;
  --food-green-h:     #16a34a;
  --food-green-d:     #052e16;

  --food-text:        #eef2ff;
  --food-text-s:      #c7d2fe;
  --food-text-m:      #818cf8;
  --food-text-inv:    #ffffff;

  --s-open-bg:        #312e81; --s-open-tx:        #c7d2fe;
  --s-closed-bg:      #1e293b; --s-closed-tx:      #94a3b8;
  --s-pending-bg:     #451a03; --s-pending-tx:     #fbbf24;
  --s-approved-bg:    #052e16; --s-approved-tx:    #4ade80;
  --s-rejected-bg:    #450a0a; --s-rejected-tx:    #fca5a5;
  --s-confirmed-bg:   #1e3a8a; --s-confirmed-tx:   #93c5fd;
  --s-cancelled-bg:   #111827; --s-cancelled-tx:   #9ca3af;
  --s-admin-bg:       #3b1a5a; --s-admin-tx:       #d8b4fe;
  --s-user-bg:        #1f2937; --s-user-tx:        #94a3b8;

  --shadow-card: 0 1px 3px rgba(0,0,0,.4),  0 0 0 1px var(--food-border);
  --shadow-lg:   0 8px 32px rgba(0,0,0,.5), 0 0 0 1px var(--food-border);
  --shadow-glow: 0 0 20px var(--food-accent-glow);
}
```

Replace the entire contents of `@layer base` with the block below. This removes the `transition: none !important` / `animation: none !important` override that previously disabled all animations globally.

```css
@layer base {
  body {
    background-color: var(--food-bg);
    color: var(--food-text);
    font-family: var(--font-sans);
  }
  * { border-color: var(--food-border); }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background-color: var(--food-bg); }
  ::-webkit-scrollbar-thumb { background-color: var(--food-border); border-radius: 9999px; }
}
```

Do **not** include the old `* { transition: none !important; animation: none !important; }` block — removing it is what allows button hover transitions, spinner animation, and drawer slide to work.

- [ ] **Step 2: Update `tailwind.config.js`**

Replace the entire file with:

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        food: {
          bg:           'var(--food-bg)',
          card:         'var(--food-card)',
          elevated:     'var(--food-elevated)',
          overlay:      'var(--food-overlay)',
          border:       'var(--food-border)',
          'border-h':   'var(--food-border-h)',
          accent:       'var(--food-accent)',
          'accent-h':   'var(--food-accent-h)',
          'accent-d':   'var(--food-accent-d)',
          crimson:      'var(--food-crimson)',
          'crimson-h':  'var(--food-crimson-h)',
          'crimson-d':  'var(--food-crimson-d)',
          green:        'var(--food-green)',
          'green-h':    'var(--food-green-h)',
          'green-d':    'var(--food-green-d)',
          text:         'var(--food-text)',
          'text-s':     'var(--food-text-s)',
          'text-m':     'var(--food-text-m)',
          'text-inv':   'var(--food-text-inv)',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: {
        sm:   'var(--r-sm)',
        md:   'var(--r-md)',
        lg:   'var(--r-lg)',
        xl:   'var(--r-xl)',
        '2xl': '1rem',
        full: 'var(--r-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lg:   'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },
    },
  },
}
```

Note: We remove the old `status.*` Tailwind colors because badges now use inline CSS var classes directly — Badge is updated atomically in this same task before committing.

- [ ] **Step 3: Rewrite Badge atomically (must happen before commit — old Badge uses dead `status.*` Tailwind classes)**

Task 1 removes the `status.*` Tailwind color map. Badge currently reads `bg-status-*-bg` classes that will no longer exist after the config change. Rewrite Badge now, before committing, so both changes land in the same atomic commit.

```jsx
// src/components/ui/Badge.jsx
const styles = {
  open:      { bg: 'var(--s-open-bg)',      tx: 'var(--s-open-tx)'      },
  closed:    { bg: 'var(--s-closed-bg)',    tx: 'var(--s-closed-tx)'    },
  pending:   { bg: 'var(--s-pending-bg)',   tx: 'var(--s-pending-tx)'   },
  approved:  { bg: 'var(--s-approved-bg)',  tx: 'var(--s-approved-tx)'  },
  rejected:  { bg: 'var(--s-rejected-bg)',  tx: 'var(--s-rejected-tx)'  },
  confirmed: { bg: 'var(--s-confirmed-bg)', tx: 'var(--s-confirmed-tx)' },
  cancelled: { bg: 'var(--s-cancelled-bg)', tx: 'var(--s-cancelled-tx)' },
  admin:     { bg: 'var(--s-admin-bg)',     tx: 'var(--s-admin-tx)'     },
  user:      { bg: 'var(--s-user-bg)',      tx: 'var(--s-user-tx)'      },
}

export default function Badge({ variant = 'pending', children }) {
  const s = styles[variant] ?? styles.pending
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.tx }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Start dev server and verify no build errors, badges still render**

```bash
npm run dev
```

Expected: dev server starts, badges show on Orders/Users pages with correct colors.

- [ ] **Step 5: Commit all three files atomically**

```bash
git add src/index.css tailwind.config.js src/components/ui/Badge.jsx
git commit -m "feat: design system v2 — tokens, radius vars, dual-mode CSS vars, badge v2"
```

---

## Task 2: Button Component

**Files:**
- Modify: `src/components/ui/Button.jsx`

- [ ] **Step 1: Rewrite Button with 6 variants, inline-flex, h-10 height, icon slot**

```jsx
// src/components/ui/Button.jsx
import { cn } from '../../utils/cn'

const variants = {
  primary:   'bg-food-accent hover:bg-food-accent-h text-food-text-inv',
  secondary: 'border border-food-border hover:border-food-border-h text-food-text-s hover:text-food-text bg-transparent hover:bg-food-elevated',
  danger:    'bg-food-crimson-d hover:bg-food-crimson/20 text-food-crimson border border-food-crimson/30',
  success:   'bg-food-green-d hover:bg-food-green/20 text-food-green border border-food-green/30',
  ghost:     'text-food-text-m hover:text-food-text hover:bg-food-elevated',
  link:      'text-food-accent hover:text-food-accent-h underline-offset-2 hover:underline p-0 h-auto',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold',
        'transition-colors duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Verify existing buttons in app still work (Dashboard, Board page)**

Check that "Create Today's Board", "Close Board", etc. still render correctly.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.jsx
git commit -m "feat: button v2 — 6 variants, inline-flex h-10, transition-colors"
```

---

## Task 3: StatCard Component

**Files:**
- Modify: `src/components/ui/StatCard.jsx`

- [ ] **Step 1: Rewrite StatCard with bold font, colored icon badges, delta prop**

```jsx
// src/components/ui/StatCard.jsx
export default function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconColor = 'accent',  // 'accent' | 'green' | 'crimson'
  delta,
}) {
  const iconStyles = {
    accent:  { wrap: 'bg-food-accent-d', icon: 'text-food-accent' },
    green:   { wrap: 'bg-food-green-d',  icon: 'text-food-green'  },
    crimson: { wrap: 'bg-food-crimson-d',icon: 'text-food-crimson'},
  }
  const ic = iconStyles[iconColor] ?? iconStyles.accent

  return (
    <div className="bg-food-card border border-food-border rounded-xl p-5 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-food-text-s">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ic.wrap}`}>
            <Icon className={`w-4 h-4 ${ic.icon}`} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-food-text">{value}</p>
      {sublabel && <p className="text-xs text-food-text-m mt-1">{sublabel}</p>}
      {delta && (
        <p className="text-xs text-food-green font-medium mt-2">{delta}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update Dashboard to pass `iconColor` where appropriate**

In `src/features/dashboard/DashboardPage.jsx`, update the three StatCard calls:

```jsx
// Admin stats
<StatCard label="Total Orders"   value={stats.totalOrders}                icon={ClipboardList} iconColor="accent"  sublabel="today" />
<StatCard label="Revenue"        value={`${stats.totalRevenue?.toFixed(2)} RON`} icon={DollarSign}   iconColor="green"   sublabel="today" />
<StatCard label="Total Calories" value={`${stats.totalCalories} kcal`}   icon={Flame}         iconColor="crimson" sublabel="ordered today" />

// User stats
<StatCard label="Items Ordered" value={stats.myItems}                    icon={ClipboardList} iconColor="accent"  sublabel="today" />
<StatCard label="My Spend"      value={`${stats.mySpend?.toFixed(2)} RON`} icon={DollarSign}  iconColor="green"   sublabel="today" />
<StatCard label="My Calories"   value={`${stats.myCalories} kcal`}       icon={Flame}        iconColor="crimson" sublabel="today" />
```

Remove the `accent` boolean prop — it's replaced by `iconColor`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/StatCard.jsx src/features/dashboard/DashboardPage.jsx
git commit -m "feat: stat card v2 — bold font, colored icon badges, iconColor prop"
```

---

## Task 4: Modal + LoadingSpinner

**Files:**
- Modify: `src/components/ui/Modal.jsx`
- Modify: `src/components/ui/LoadingSpinner.jsx`

- [ ] **Step 1: Rewrite Modal with backdrop blur + styled close button**

```jsx
// src/components/ui/Modal.jsx
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-food-card border border-food-border rounded-xl shadow-lg w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-food-border">
          <h2 className="text-base font-semibold text-food-text">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-food-elevated text-food-text-m hover:text-food-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite LoadingSpinner as spinning ring**

```jsx
// src/components/ui/LoadingSpinner.jsx
export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <div className="w-8 h-8 rounded-full border-2 border-food-border border-t-food-accent animate-spin" />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Modal.jsx src/components/ui/LoadingSpinner.jsx
git commit -m "feat: modal backdrop-blur, loading spinner ring style"
```

---

## Task 5: DataTable Component

**Files:**
- Modify: `src/components/ui/DataTable.jsx`

- [ ] **Step 1: Update DataTable header + row styles**

```jsx
// src/components/ui/DataTable.jsx
import { flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'

export default function DataTable({
  columns, data, loading,
  emptyTitle = 'No data', emptyDescription,
  globalFilter, onGlobalFilterChange,
}) {
  const [sorting, setSorting] = useState([])

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-food-card border border-food-border rounded-xl overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-food-border bg-food-elevated/50">
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    className="text-left text-[11px] font-bold uppercase tracking-widest text-food-text-m py-3 px-5 cursor-pointer select-none whitespace-nowrap"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === 'asc'  && <ChevronUp   className="w-3 h-3 text-food-accent" />}
                      {h.column.getIsSorted() === 'desc' && <ChevronDown  className="w-3 h-3 text-food-accent" />}
                      {!h.column.getIsSorted() && h.column.getCanSort() && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-food-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-food-overlay transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="py-3.5 px-5 text-food-text">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify table renders on Dashboard and Orders pages**

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/DataTable.jsx
git commit -m "feat: data table v2 — bold headers, sort icons, card wrapper, divide-y rows"
```

---

## Task 6: Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Rewrite Sidebar with logo, group labels, accent rail, user chip**

```jsx
// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, ShoppingBag,
  UtensilsCrossed, Users, UserCircle, ClipboardList,
  Utensils, LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const userLinks = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/board',     icon: CalendarDays,    label: "Today's Board" },
  { to: '/my-orders', icon: ShoppingBag,     label: 'My Orders'     },
]
const adminLinks = [
  { to: '/orders', icon: ClipboardList,   label: 'All Orders'   },
  { to: '/food',   icon: UtensilsCrossed, label: 'Food Catalog' },
  { to: '/users',  icon: Users,           label: 'Users'        },
]

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-food-accent-d text-food-accent'
          : 'text-food-text-s hover:text-food-text hover:bg-food-elevated'
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-food-accent rounded-r-full" />
          )}
          <Icon className="w-4 h-4 shrink-0" />
          {label}
        </>
      )}
    </NavLink>
  )
}

function GroupLabel({ children }) {
  return (
    <p className="px-3 mb-1 mt-2 text-[10px] font-bold uppercase tracking-widest text-food-text-m select-none">
      {children}
    </p>
  )
}

export default function Sidebar() {
  const { isAdmin, profile, signOut } = useAuth()
  const initials = profile?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className="w-64 bg-food-card border-r border-food-border min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-food-border shrink-0">
        <div className="flex items-center gap-2.5 select-none">
          <div className="relative">
            <div className="w-8 h-8 bg-food-green rounded-lg flex items-center justify-center">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-food-crimson ring-2 ring-food-card" />
          </div>
          <div className="leading-none">
            <span className="text-lg font-black text-food-text">Food</span>
            <span className="text-lg font-black text-food-green">App</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <GroupLabel>Menu</GroupLabel>
        <div className="space-y-0.5">
          {userLinks.map(l => <NavItem key={l.to} {...l} end={l.to === '/'} />)}
        </div>

        {isAdmin && (
          <>
            <GroupLabel>Admin</GroupLabel>
            <div className="space-y-0.5">
              {adminLinks.map(l => <NavItem key={l.to} {...l} />)}
            </div>
          </>
        )}
      </nav>

      {/* User chip */}
      <div className="p-3 border-t border-food-border shrink-0 space-y-0.5">
        <NavItem to="/profile" icon={UserCircle} label="Profile" />
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-food-text-s hover:text-food-crimson hover:bg-food-crimson-d transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verify sidebar renders, active items show accent rail, sign out button is crimson**

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "feat: sidebar v2 — logo with green+crimson, group labels, accent rail, user chip"
```

---

## Task 7: Header + AppLayout

**Files:**
- Modify: `src/components/layout/Header.jsx`
- Modify: `src/components/layout/AppLayout.jsx`

- [ ] **Step 1: Rewrite Header — sticky, breadcrumb area, bell with crimson dot**

```jsx
// src/components/layout/Header.jsx
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'
import Breadcrumbs from './Breadcrumbs'

export default function Header() {
  const { profile } = useAuth()

  return (
    <header className="h-14 bg-food-card border-b border-food-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <Breadcrumbs />
      <div className="flex items-center gap-1.5">
        {/* Bell with notification dot */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-food-elevated text-food-text-m hover:text-food-text transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-food-crimson" />
        </button>
        <ThemeToggle />
        {/* Avatar */}
        <div className="ml-1 flex items-center gap-2">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} className="w-7 h-7 rounded-full border border-food-border object-cover" alt="" />
            : <div className="w-7 h-7 rounded-full bg-food-accent-d flex items-center justify-center text-food-accent text-xs font-bold select-none">
                {profile?.username?.[0]?.toUpperCase()}
              </div>
          }
          <span className="text-sm font-medium text-food-text-s hidden sm:block">{profile?.username}</span>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Update AppLayout — remove inner max-w wrapper so pages control their own width**

```jsx
// src/components/layout/AppLayout.jsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-food-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

Note: Removing `<Breadcrumbs />` from AppLayout since Header now contains it.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.jsx src/components/layout/AppLayout.jsx
git commit -m "feat: header v2 — sticky, breadcrumb, bell+crimson dot; layout removes max-w wrapper"
```

---

## Task 8: CartDrawer + CartItem (Kiosk Style)

**Files:**
- Modify: `src/features/board/components/CartDrawer.jsx`

- [ ] **Step 1: Rewrite CartDrawer — kiosk style with qty controls row, totals, green submit**

```jsx
// src/features/board/components/CartDrawer.jsx
import { X, ShoppingCart, Flame, CheckCircle } from 'lucide-react'
import CartItem from './CartItem'
import EmptyState from '../../../components/ui/EmptyState'

export default function CartDrawer({ open, onClose, cart, onSubmit, submitting, existingOrder }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={onClose} />}
      <aside className={`fixed right-0 top-0 h-full w-96 bg-food-card border-l border-food-border z-40 flex flex-col shadow-lg transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-food-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-food-accent" />
            <h2 className="font-semibold text-food-text">Your Order</h2>
            {!cart.isEmpty && (
              <span className="w-5 h-5 rounded-full bg-food-accent text-food-text-inv text-[10px] font-bold flex items-center justify-center">
                {cart.items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-food-elevated text-food-text-m hover:text-food-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.isEmpty
            ? <EmptyState icon={ShoppingCart} title="Empty cart" description="Add items from the menu" />
            : cart.items.map(item => (
                <CartItem key={item.food_item_id} item={item} onUpdateQty={cart.updateQty} onRemove={cart.remove} />
              ))
          }
        </div>

        {/* Footer */}
        {!cart.isEmpty && (
          <div className="p-4 border-t border-food-border shrink-0 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-food-text-s flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-food-crimson" />
                Total calories
              </span>
              <span className="font-semibold text-food-crimson">{cart.totalCalories} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-food-text">Total</span>
              <span className="text-lg font-bold text-food-accent">{cart.totalPrice.toFixed(2)} RON</span>
            </div>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full h-11 bg-food-green hover:bg-food-green-h text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              {submitting ? 'Submitting…' : existingOrder ? 'Update Order' : 'Place Order'}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
```

- [ ] **Step 2: Fix CartItem — replace hardcoded `text-red-500` with `text-food-crimson`**

`CartItem.jsx` line 21 uses `text-red-500 hover:text-red-400` for the delete button. Replace with design-system tokens:

```jsx
// src/features/board/components/CartItem.jsx — change only line 21
<button onClick={() => onRemove(item.food_item_id)} className="text-food-crimson hover:text-food-crimson-h">
  <Trash2 className="w-4 h-4" />
</button>
```

- [ ] **Step 3: Verify cart drawer opens/closes on Board page, submit button is green, delete is crimson**

- [ ] **Step 4: Commit**

```bash
git add src/features/board/components/CartDrawer.jsx src/features/board/components/CartItem.jsx
git commit -m "feat: cart drawer v2 — kiosk style, crimson calories/delete, green submit"
```

---

## Task 9: BoardPage — Category Tabs + Floating Cart

**Files:**
- Modify: `src/features/board/BoardPage.jsx`

- [ ] **Step 1: Add category tabs and floating cart pill button to BoardPage**

The food items have a `category` field. We'll derive unique categories from `foodItems` and use local state for the active one.

```jsx
// src/features/board/BoardPage.jsx
import { useState, useMemo } from 'react'
import { Lock, CalendarDays, ShoppingCart, ChevronRight, Unlock } from 'lucide-react'
import { useBoard, useCreateBoard, useCloseBoard, useReopenBoard, useFoodItems } from './hooks/useBoard'
import { useMyOrder, useSubmitOrder } from './hooks/useSubmitOrder'
import { useCart } from './hooks/useCart'
import { useAuth } from '../../context/AuthContext'
import { useRealtime } from '../../hooks/useRealtime'
import FoodGrid from './components/FoodGrid'
import CartDrawer from './components/CartDrawer'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function BoardPage() {
  const { isAdmin } = useAuth()
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  const { data: board, isLoading: boardLoading } = useBoard()
  const { data: foodItems = [], isLoading: foodLoading } = useFoodItems()
  const { data: existingOrder } = useMyOrder(board?.id)
  const cart = useCart(existingOrder?.order_items ?? [])
  const submitOrder = useSubmitOrder()
  const createBoard = useCreateBoard()
  const closeBoard = useCloseBoard()
  const reopenBoard = useReopenBoard()

  useRealtime({
    channel: `board-status-${board?.id}`,
    table: 'boards',
    filter: board?.id ? `id=eq.${board.id}` : null,
    queryKeys: [['board', 'today']],
  })

  const categories = useMemo(() => {
    const cats = [...new Set(foodItems.map(i => i.category).filter(Boolean))]
    return ['All', ...cats]
  }, [foodItems])

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return foodItems
    return foodItems.filter(i => i.category === activeCategory)
  }, [foodItems, activeCategory])

  async function handleSubmit() {
    if (cart.isEmpty) return
    await submitOrder.mutateAsync({
      boardId: board.id,
      items: cart.items,
      totalPrice: cart.totalPrice,
      totalCalories: cart.totalCalories,
      existingOrderId: existingOrder?.id,
    })
    setCartOpen(false)
  }

  if (boardLoading || foodLoading) return <LoadingSpinner />

  if (!board) return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-food-text">Today's Board</h1>
      <EmptyState
        icon={CalendarDays}
        title="No board today"
        description={isAdmin ? "Create today's board to open ordering." : "Admin hasn't created today's board yet."}
        action={isAdmin && (
          <Button onClick={() => createBoard.mutate()} disabled={createBoard.isPending}>
            {createBoard.isPending ? 'Creating…' : "Create Today's Board"}
          </Button>
        )}
      />
    </div>
  )

  const isClosed = board.status === 'closed'

  return (
    <div className="space-y-0 -m-6">
      {/* Board header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-food-border bg-food-card">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-food-text">{board.title}</h1>
          <Badge variant={board.status}>{isClosed ? 'Closed' : 'Open'}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && !isClosed && (
            <Button variant="danger" size="sm" onClick={() => closeBoard.mutate(board.id)} disabled={closeBoard.isPending}>
              <Lock className="w-3.5 h-3.5" />
              {closeBoard.isPending ? 'Closing…' : 'Close Board'}
            </Button>
          )}
          {isAdmin && isClosed && (
            <Button size="sm" onClick={() => reopenBoard.mutate(board.id)} disabled={reopenBoard.isPending}>
              <Unlock className="w-3.5 h-3.5" />
              {reopenBoard.isPending ? 'Reopening…' : 'Reopen Board'}
            </Button>
          )}
        </div>
      </div>

      {isClosed ? (
        <div className="p-6">
          <div className="bg-food-card border border-food-border rounded-xl p-10 text-center">
            <Lock className="w-10 h-10 text-food-text-m mx-auto mb-3" />
            <p className="text-food-text font-semibold">Ordering is closed for today</p>
            {existingOrder && <p className="text-food-text-m text-sm mt-1">Your order has been submitted.</p>}
          </div>
        </div>
      ) : (
        <>
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 px-6 py-3 bg-food-card border-b border-food-border overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center px-3.5 h-8 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-food-accent text-food-text-inv'
                    : 'bg-food-elevated text-food-text-s hover:text-food-text border border-food-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food grid */}
          <div className="p-6 pb-24">
            <FoodGrid
              items={filteredItems}
              onAdd={cart.add}
              cartItemIds={cart.items.map(i => i.food_item_id)}
            />
          </div>

          {/* Floating cart pill */}
          {!cart.isEmpty && (
            <div className="fixed bottom-6 right-6 z-20">
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-3 px-5 h-12 rounded-full bg-food-accent hover:bg-food-accent-h text-food-text-inv font-semibold text-sm shadow-glow transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
                <span className="h-4 w-px bg-white/30" />
                <span>{cart.totalPrice.toFixed(2)} RON</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onSubmit={handleSubmit}
        submitting={submitOrder.isPending}
        existingOrder={existingOrder}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify on Board page — category tabs filter items, floating pill appears when items in cart, cart drawer opens**

- [ ] **Step 3: Commit**

```bash
git add src/features/board/BoardPage.jsx
git commit -m "feat: board page v2 — category tabs, floating cart pill, kiosk layout"
```

---

## Task 10: ThemeToggle Polish

**Files:**
- Modify: `src/components/ui/ThemeToggle.jsx`

- [ ] **Step 1: Update ThemeToggle to match new button style**

```jsx
// src/components/ui/ThemeToggle.jsx
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-food-elevated text-food-text-m hover:text-food-text transition-colors"
    >
      {isDark
        ? <Sun  className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ThemeToggle.jsx
git commit -m "feat: theme toggle v2 — consistent w-8 h-8 icon button style"
```

---

## Task 11: Final Smoke Test

- [ ] **Step 1: Build and verify no errors**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run dev server and manually check each page**

```bash
npm run dev
```

Checklist:
- [ ] Login page — light mode: white card, indigo button, purple border inputs
- [ ] Login page — dark mode: dark purple bg, indigo button, dark purple borders
- [ ] Sidebar — green logo + crimson dot, accent rail on active item
- [ ] Dashboard — stat cards with colored icon badges
- [ ] Board — category tabs, food cards visible, floating cart pill on item add
- [ ] Cart drawer — crimson calories, green submit button
- [ ] Tables — bold uppercase headers, divide-y rows
- [ ] Badges — dot indicator, uppercase
- [ ] Theme toggle — switches cleanly between light and dark
- [ ] Modal — backdrop blur on open

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: design system v2 complete — theme toggle polish, smoke test pass"
```
