# FoodApp — Design System v2

Inspired by: McDonald's self-order kiosks, futuristic dark POS terminals, and modern SaaS dashboards.
Style keywords: **Bold • High-contrast • Grid-first • Icon-driven • Kiosk-clean**

---

## 1. Theme Architecture

The app supports **light** and **dark** mode via a `data-theme` attribute on `<html>`.
Toggle is stored in `localStorage` and applied by `ThemeContext`.

```
<html data-theme="light">   ← light mode (default)
<html data-theme="dark">    ← dark mode
```

CSS variables automatically flip. All Tailwind utility classes use `var(--*)` under the hood — never hardcode hex.

---

## 2. Color Tokens

### 2.1 Semantic palette (light / dark)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--food-bg` | `#f8fafc` | `#0b0614` | Page background |
| `--food-card` | `#ffffff` | `#120a1f` | Card / panel surface |
| `--food-elevated` | `#f1f5f9` | `#1b1030` | Input bg, dropdown bg |
| `--food-overlay` | `rgba(0,0,0,.04)` | `rgba(255,255,255,.03)` | Hover overlay |
| `--food-border` | `#ddd6fe` | `#2b1a45` | Default border (purple-tinted) |
| `--food-border-h` | `#a78bfa` | `#7c3aed` | Focused / hovered border |

### 2.2 Accent — Indigo (primary action)

| Token | Light | Dark |
|-------|-------|------|
| `--food-accent` | `#4f46e5` | `#6366f1` |
| `--food-accent-h` | `#4338ca` | `#4f46e5` |
| `--food-accent-d` (dim) | `#ede9fe` | `#1e1345` |
| `--food-accent-glow` | — | `rgba(99,102,241,.25)` |

### 2.3 Crimson (danger / alerts / logo secondary)

| Token | Light | Dark |
|-------|-------|------|
| `--food-crimson` | `#dc2626` | `#ef4444` |
| `--food-crimson-h` | `#b91c1c` | `#dc2626` |
| `--food-crimson-d` | `#fee2e2` | `#450a0a` |

### 2.4 Green (success / logo primary / approved)

| Token | Light | Dark |
|-------|-------|------|
| `--food-green` | `#16a34a` | `#22c55e` |
| `--food-green-h` | `#15803d` | `#16a34a` |
| `--food-green-d` | `#dcfce7` | `#052e16` |

### 2.5 Text

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--food-text` | `#0f172a` | `#eef2ff` | Headings, body |
| `--food-text-s` | `#475569` | `#c7d2fe` | Labels, secondary |
| `--food-text-m` | `#94a3b8` | `#818cf8` | Placeholders, captions |
| `--food-text-inv` | `#ffffff` | `#ffffff` | Text on accent fills |

### 2.6 Status badge tokens

| State | bg (light) | text (light) | bg (dark) | text (dark) |
|-------|-----------|--------------|-----------|-------------|
| `open` | `#ede9fe` | `#4338ca` | `#312e81` | `#c7d2fe` |
| `closed` | `#f1f5f9` | `#475569` | `#1e293b` | `#94a3b8` |
| `pending` | `#fffbeb` | `#b45309` | `#451a03` | `#fbbf24` |
| `approved` | `#dcfce7` | `#15803d` | `#052e16` | `#4ade80` |
| `rejected` | `#fee2e2` | `#b91c1c` | `#450a0a` | `#fca5a5` |
| `confirmed` | `#eff6ff` | `#1d4ed8` | `#1e3a8a` | `#93c5fd` |
| `cancelled` | `#f3f4f6` | `#6b7280` | `#111827` | `#9ca3af` |
| `admin` | `#f5f3ff` | `#6d28d9` | `#3b1a5a` | `#d8b4fe` |
| `user` | `#f1f5f9` | `#475569` | `#1f2937` | `#94a3b8` |

---

## 3. CSS Variables — full `index.css` spec

```css
:root {
  /* --- Surfaces --- */
  --food-bg:          #f8fafc;
  --food-card:        #ffffff;
  --food-elevated:    #f1f5f9;
  --food-overlay:     rgba(0, 0, 0, 0.04);

  /* --- Borders (purple-tinted) --- */
  --food-border:      #ddd6fe;
  --food-border-h:    #a78bfa;

  /* --- Accent: Indigo --- */
  --food-accent:      #4f46e5;
  --food-accent-h:    #4338ca;
  --food-accent-d:    #ede9fe;
  --food-accent-glow: rgba(79, 70, 229, 0.12);

  /* --- Crimson --- */
  --food-crimson:     #dc2626;
  --food-crimson-h:   #b91c1c;
  --food-crimson-d:   #fee2e2;

  /* --- Green --- */
  --food-green:       #16a34a;
  --food-green-h:     #15803d;
  --food-green-d:     #dcfce7;

  /* --- Text --- */
  --food-text:        #0f172a;
  --food-text-s:      #475569;
  --food-text-m:      #94a3b8;
  --food-text-inv:    #ffffff;

  /* --- Status badges (light) --- */
  --s-open-bg:        #ede9fe; --s-open-tx:        #4338ca;
  --s-closed-bg:      #f1f5f9; --s-closed-tx:      #475569;
  --s-pending-bg:     #fffbeb; --s-pending-tx:     #b45309;
  --s-approved-bg:    #dcfce7; --s-approved-tx:    #15803d;
  --s-rejected-bg:    #fee2e2; --s-rejected-tx:    #b91c1c;
  --s-confirmed-bg:   #eff6ff; --s-confirmed-tx:   #1d4ed8;
  --s-cancelled-bg:   #f3f4f6; --s-cancelled-tx:   #6b7280;
  --s-admin-bg:       #f5f3ff; --s-admin-tx:       #6d28d9;
  --s-user-bg:        #f1f5f9; --s-user-tx:        #475569;

  /* --- Typography --- */
  --font-sans: 'Inter', sans-serif;

  /* --- Radius --- */
  --r-sm:   6px;
  --r-md:   10px;
  --r-lg:   14px;
  --r-xl:   20px;
  --r-full: 9999px;

  /* --- Shadows --- */
  --shadow-card: 0 1px 3px rgba(0,0,0,.06), 0 0 0 1px var(--food-border);
  --shadow-lg:   0 8px 32px rgba(0,0,0,.08), 0 0 0 1px var(--food-border);
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

  --shadow-card: 0 1px 3px rgba(0,0,0,.4), 0 0 0 1px var(--food-border);
  --shadow-lg:   0 8px 32px rgba(0,0,0,.5), 0 0 0 1px var(--food-border);
}
```

---

## 4. Tailwind Config Extension

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        food: {
          bg:         'var(--food-bg)',
          card:       'var(--food-card)',
          elevated:   'var(--food-elevated)',
          border:     'var(--food-border)',
          'border-h': 'var(--food-border-h)',
          accent:     'var(--food-accent)',
          'accent-h': 'var(--food-accent-h)',
          'accent-d': 'var(--food-accent-d)',
          crimson:    'var(--food-crimson)',
          'crimson-h':'var(--food-crimson-h)',
          'crimson-d':'var(--food-crimson-d)',
          green:      'var(--food-green)',
          'green-h':  'var(--food-green-h)',
          'green-d':  'var(--food-green-d)',
          text:       'var(--food-text)',
          'text-s':   'var(--food-text-s)',
          'text-m':   'var(--food-text-m)',
          'text-inv': 'var(--food-text-inv)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:   'var(--r-sm)',
        md:   'var(--r-md)',
        lg:   'var(--r-lg)',
        xl:   'var(--r-xl)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lg:   'var(--shadow-lg)',
        glow: '0 0 20px var(--food-accent-glow)',
      },
    },
  },
}
```

---

## 5. Typography Scale

| Role | Tailwind classes |
|------|-----------------|
| Page title | `text-2xl font-bold tracking-tight text-food-text` |
| Section header | `text-lg font-semibold text-food-text` |
| Card title | `text-base font-semibold text-food-text` |
| Body / default | `text-sm text-food-text` |
| Label / secondary | `text-sm font-medium text-food-text-s` |
| Caption / muted | `text-xs text-food-text-m` |
| Stat number | `text-3xl font-bold text-food-accent` |
| Kiosk price | `text-2xl font-black text-food-accent` |
| Badge text | `text-xs font-semibold uppercase tracking-wide` |

Font: **Inter** — loaded from Google Fonts. Use `font-sans` everywhere.

---

## 6. Spacing & Layout

| Concept | Value |
|---------|-------|
| Page padding | `p-6` (24px) |
| Card padding | `p-5` (20px) |
| Card padding compact | `p-4` (16px) |
| Section gap | `gap-6` |
| Form field gap | `gap-4` |
| Sidebar width | `w-64` (256px) |
| Header height | `h-14` (56px) |
| Input height | `h-10` (40px) |
| Button height sm | `h-8` (32px) |
| Button height md | `h-10` (40px) |
| Button height lg | `h-12` (48px) |
| Border radius default | `rounded-lg` (var(--r-lg) = 14px) |
| Icon size sm | `w-4 h-4` |
| Icon size md | `w-5 h-5` |
| Icon size lg | `w-6 h-6` |

Grid layouts:
```
Stats row:    grid grid-cols-2 lg:grid-cols-4 gap-4
Food cards:   grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
Two-column:   grid grid-cols-1 lg:grid-cols-2 gap-6
Full content: flex-1 min-h-screen bg-food-bg p-6
```

---

## 7. Logo

The logo combines **green** (brand) + **crimson** (energy mark).

```jsx
// src/components/layout/Logo.jsx
import { Utensils } from 'lucide-react'

export function Logo({ size = 'md' }) {
  const sz = size === 'sm' ? 'text-base' : 'text-xl'
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon block — green bg, crimson accent dot */}
      <div className="relative">
        <div className="w-8 h-8 bg-food-green rounded-lg flex items-center justify-center">
          <Utensils className="w-4 h-4 text-white" />
        </div>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-food-crimson ring-2 ring-food-card" />
      </div>
      {/* Wordmark */}
      <div className="leading-none">
        <span className={`${sz} font-black text-food-text`}>Food</span>
        <span className={`${sz} font-black text-food-green`}>App</span>
      </div>
    </div>
  )
}
```

---

## 8. Components

### 8.1 Sidebar

McDonald's kiosk-inspired: bold category labels, large icon targets, accent rail on active item.

```jsx
<aside className="w-64 bg-food-card border-r border-food-border min-h-screen flex flex-col">

  {/* Logo area */}
  <div className="h-14 flex items-center px-5 border-b border-food-border shrink-0">
    <Logo />
  </div>

  {/* Nav groups */}
  <nav className="flex-1 overflow-y-auto p-3 space-y-6">

    {/* Group label */}
    <div>
      <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-food-text-m">
        Main
      </p>
      <div className="space-y-0.5">

        {/* Inactive item */}
        <a className="
          group flex items-center gap-3 px-3 py-2.5 rounded-lg
          text-food-text-s hover:text-food-text
          hover:bg-food-elevated
          transition-colors cursor-pointer
        ">
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Dashboard</span>
        </a>

        {/* Active item — indigo accent rail */}
        <a className="
          group flex items-center gap-3 px-3 py-2.5 rounded-lg
          text-food-accent bg-food-accent-d
          relative
          cursor-pointer
        ">
          {/* Left rail */}
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-food-accent rounded-r-full" />
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold">Today's Board</span>
        </a>

      </div>
    </div>

  </nav>

  {/* Bottom user chip */}
  <div className="p-3 border-t border-food-border shrink-0">
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-food-elevated cursor-pointer">
      <div className="w-7 h-7 rounded-full bg-food-accent-d flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-food-accent">JD</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-food-text truncate">John Doe</p>
        <p className="text-[10px] text-food-text-m truncate">Admin</p>
      </div>
      <LogOut className="w-3.5 h-3.5 text-food-text-m shrink-0" />
    </div>
  </div>

</aside>
```

### 8.2 Header / Topbar

```jsx
<header className="h-14 bg-food-card border-b border-food-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">

  {/* Left: breadcrumb */}
  <div className="flex items-center gap-2 text-sm">
    <span className="text-food-text-m">FoodApp</span>
    <ChevronRight className="w-3.5 h-3.5 text-food-text-m" />
    <span className="font-medium text-food-text">Dashboard</span>
  </div>

  {/* Right: actions */}
  <div className="flex items-center gap-2">
    {/* Theme toggle */}
    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-food-elevated text-food-text-m hover:text-food-text">
      <Sun className="w-4 h-4" />
    </button>
    {/* Notification bell */}
    <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-food-elevated text-food-text-m hover:text-food-text">
      <Bell className="w-4 h-4" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-food-crimson" />
    </button>
  </div>

</header>
```

### 8.3 Stat Card

```jsx
// Kiosk-style: large number, icon badge, subtle accent glow on hover
<div className="bg-food-card border border-food-border rounded-xl p-5 shadow-card
                hover:border-food-border-h hover:shadow-glow transition-shadow group">

  <div className="flex items-start justify-between mb-4">
    <p className="text-sm font-medium text-food-text-s">{label}</p>
    {/* Icon badge — color varies by card type */}
    <div className="w-9 h-9 rounded-lg bg-food-accent-d flex items-center justify-center shrink-0">
      <Icon className="w-4.5 h-4.5 text-food-accent" />
    </div>
  </div>

  <p className="text-3xl font-bold text-food-text">{value}</p>

  {/* Delta line */}
  {delta && (
    <div className="flex items-center gap-1.5 mt-2">
      <TrendingUp className="w-3.5 h-3.5 text-food-green" />
      <span className="text-xs text-food-green font-medium">{delta}</span>
      <span className="text-xs text-food-text-m">vs yesterday</span>
    </div>
  )}
</div>
```

Icon badge colors by context:
- Revenue → `bg-food-accent-d / text-food-accent` (indigo)
- Orders → `bg-food-green-d / text-food-green` (green)
- Alerts / errors → `bg-food-crimson-d / text-food-crimson` (crimson)
- Neutral → `bg-food-elevated / text-food-text-s`

### 8.4 Food Card (Kiosk style)

McDonald's menu influence: image-dominant, bold price, clear Add button.

```jsx
<div className="bg-food-card border border-food-border rounded-xl overflow-hidden
                hover:border-food-border-h shadow-card group">

  {/* Image zone — fixed aspect ratio */}
  <div className="relative aspect-[4/3] bg-food-elevated overflow-hidden">
    <img src={image} alt={name} className="w-full h-full object-cover" />
    {/* Category chip overlay */}
    <span className="absolute top-2.5 left-2.5
                     bg-food-card/90 backdrop-blur-sm
                     text-[10px] font-bold uppercase tracking-wider text-food-text-m
                     px-2 py-1 rounded-md border border-food-border">
      {category}
    </span>
    {/* Calorie badge overlay */}
    <span className="absolute top-2.5 right-2.5
                     bg-food-crimson/90 text-white
                     text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
      <Flame className="w-2.5 h-2.5" /> {calories}
    </span>
  </div>

  {/* Info zone */}
  <div className="p-4">
    <h3 className="font-semibold text-food-text text-sm leading-snug mb-0.5 line-clamp-1">{name}</h3>
    {description && (
      <p className="text-[11px] text-food-text-m line-clamp-2 mb-3">{description}</p>
    )}

    <div className="flex items-center justify-between">
      <span className="text-xl font-black text-food-accent">{price} <span className="text-xs font-medium text-food-text-m">RON</span></span>
      <button className="flex items-center gap-1.5
                         bg-food-accent hover:bg-food-accent-h
                         text-food-text-inv text-xs font-semibold
                         px-3 py-1.5 rounded-lg">
        <Plus className="w-3.5 h-3.5" />
        Add
      </button>
    </div>
  </div>
</div>
```

### 8.5 Buttons

All buttons follow: `[icon?] [label]` — icon is always on the left.

```jsx
// ── Primary (indigo)
<button className="
  inline-flex items-center gap-2
  bg-food-accent hover:bg-food-accent-h
  text-food-text-inv text-sm font-semibold
  px-4 h-10 rounded-lg
">
  <Plus className="w-4 h-4" />
  Add Item
</button>

// ── Secondary / Outline (purple border)
<button className="
  inline-flex items-center gap-2
  border border-food-border hover:border-food-border-h
  text-food-text-s hover:text-food-text
  text-sm font-medium
  px-4 h-10 rounded-lg bg-transparent hover:bg-food-elevated
">
  <Filter className="w-4 h-4" />
  Filter
</button>

// ── Danger (crimson)
<button className="
  inline-flex items-center gap-2
  bg-food-crimson-d hover:bg-food-crimson/20
  text-food-crimson text-sm font-semibold
  px-4 h-10 rounded-lg border border-food-crimson/30
">
  <Trash2 className="w-4 h-4" />
  Delete
</button>

// ── Success (green)
<button className="
  inline-flex items-center gap-2
  bg-food-green-d hover:bg-food-green/20
  text-food-green text-sm font-semibold
  px-4 h-10 rounded-lg border border-food-green/30
">
  <CheckCircle className="w-4 h-4" />
  Approve
</button>

// ── Ghost / Icon-only
<button className="
  w-8 h-8 flex items-center justify-center rounded-lg
  text-food-text-m hover:text-food-text hover:bg-food-elevated
">
  <MoreHorizontal className="w-4 h-4" />
</button>

// ── Small inline
<button className="
  inline-flex items-center gap-1.5
  text-food-accent hover:text-food-accent-h
  text-xs font-semibold
  px-2.5 h-7 rounded-md bg-food-accent-d
">
  <Edit className="w-3 h-3" />
  Edit
</button>
```

### 8.6 Badges

Badges use **semantic status tokens** and have a consistent pill shape.

```jsx
// Generic badge function
function Badge({ status }) {
  const map = {
    open:      'bg-[var(--s-open-bg)]      text-[var(--s-open-tx)]',
    closed:    'bg-[var(--s-closed-bg)]    text-[var(--s-closed-tx)]',
    pending:   'bg-[var(--s-pending-bg)]   text-[var(--s-pending-tx)]',
    approved:  'bg-[var(--s-approved-bg)]  text-[var(--s-approved-tx)]',
    rejected:  'bg-[var(--s-rejected-bg)]  text-[var(--s-rejected-tx)]',
    confirmed: 'bg-[var(--s-confirmed-bg)] text-[var(--s-confirmed-tx)]',
    cancelled: 'bg-[var(--s-cancelled-bg)] text-[var(--s-cancelled-tx)]',
    admin:     'bg-[var(--s-admin-bg)]     text-[var(--s-admin-tx)]',
    user:      'bg-[var(--s-user-bg)]      text-[var(--s-user-tx)]',
  }
  return (
    <span className={`
      inline-flex items-center gap-1
      px-2.5 py-0.5 rounded-full
      text-xs font-semibold uppercase tracking-wide
      ${map[status] ?? map.closed}
    `}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  )
}
```

Special logo badges (for category pills on kiosk board):
```jsx
// Crimson category
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                 bg-food-crimson-d text-food-crimson
                 text-xs font-bold uppercase tracking-wider border border-food-crimson/30">
  <Flame className="w-2.5 h-2.5" />
  Hot
</span>

// Green category
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                 bg-food-green-d text-food-green
                 text-xs font-bold uppercase tracking-wider border border-food-green/30">
  <Leaf className="w-2.5 h-2.5" />
  Vegan
</span>
```

### 8.7 Inputs & Form Fields

```jsx
// Standard input
<input className="
  w-full h-10
  bg-food-elevated
  border border-food-border
  hover:border-food-border-h
  focus:border-food-accent focus:ring-2 focus:ring-food-accent/20
  rounded-lg px-3
  text-sm text-food-text
  placeholder:text-food-text-m
  outline-none
" />

// Input with icon prefix
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-food-text-m pointer-events-none" />
  <input className="w-full h-10 bg-food-elevated border border-food-border hover:border-food-border-h
                    focus:border-food-accent focus:ring-2 focus:ring-food-accent/20
                    rounded-lg pl-9 pr-3 text-sm text-food-text placeholder:text-food-text-m outline-none" />
</div>

// Select
<select className="
  w-full h-10
  bg-food-elevated border border-food-border
  hover:border-food-border-h
  focus:border-food-accent focus:ring-2 focus:ring-food-accent/20
  rounded-lg px-3
  text-sm text-food-text
  outline-none appearance-none cursor-pointer
" />

// Textarea
<textarea className="
  w-full
  bg-food-elevated border border-food-border
  hover:border-food-border-h
  focus:border-food-accent focus:ring-2 focus:ring-food-accent/20
  rounded-lg px-3 py-2.5
  text-sm text-food-text
  placeholder:text-food-text-m
  outline-none resize-none
  rows-4
" />

// Form label
<label className="block text-sm font-medium text-food-text-s mb-1.5">
  Email address
</label>

// Error message
<p className="text-xs text-food-crimson mt-1 flex items-center gap-1">
  <AlertCircle className="w-3 h-3" />
  This field is required
</p>

// Helper text
<p className="text-xs text-food-text-m mt-1">
  We'll never share your email with anyone.
</p>
```

#### Form Card wrapper

```jsx
<div className="bg-food-card border border-food-border rounded-xl p-6 shadow-card">
  <h2 className="text-base font-semibold text-food-text mb-5">Section Title</h2>
  <div className="space-y-4">
    {/* fields */}
  </div>
  <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-food-border">
    <button className="/* cancel / secondary */">Cancel</button>
    <button className="/* primary */">Save Changes</button>
  </div>
</div>
```

### 8.8 Login Page

Full-screen split: left brand panel, right form.

```jsx
<div className="min-h-screen flex bg-food-bg">

  {/* Left — brand panel (hidden on mobile) */}
  <div className="hidden lg:flex w-1/2 bg-food-card border-r border-food-border
                  flex-col items-center justify-center p-16 relative overflow-hidden">
    {/* Radial glow */}
    <div className="absolute inset-0 pointer-events-none
                    bg-[radial-gradient(ellipse_at_center,var(--food-accent-glow)_0%,transparent_70%)]" />

    <Logo size="lg" />
    <p className="mt-6 text-xl font-semibold text-food-text text-center max-w-xs leading-snug">
      Your daily lunch, <span className="text-food-accent">ordered in seconds.</span>
    </p>
    <p className="mt-3 text-sm text-food-text-s text-center max-w-xs">
      Smart food ordering for teams — track orders, calories, and budgets in one place.
    </p>

    {/* Decorative chips */}
    <div className="flex flex-wrap gap-2 mt-8 justify-center">
      {['Realtime orders','Calorie tracking','Team dashboard'].map(t => (
        <span key={t} className="text-xs px-3 py-1.5 rounded-full
                                  bg-food-elevated border border-food-border text-food-text-s">
          {t}
        </span>
      ))}
    </div>
  </div>

  {/* Right — form */}
  <div className="flex-1 flex items-center justify-center p-6">
    <div className="w-full max-w-sm">

      {/* Mobile logo */}
      <div className="lg:hidden mb-8 flex justify-center"><Logo /></div>

      <h1 className="text-2xl font-bold text-food-text mb-1">Welcome back</h1>
      <p className="text-sm text-food-text-s mb-8">Sign in to your account</p>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-food-text-s mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-food-text-m" />
            <input type="email" placeholder="you@company.com"
              className="w-full h-10 bg-food-elevated border border-food-border
                         hover:border-food-border-h focus:border-food-accent
                         focus:ring-2 focus:ring-food-accent/20
                         rounded-lg pl-9 pr-3 text-sm text-food-text
                         placeholder:text-food-text-m outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-food-text-s mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-food-text-m" />
            <input type="password" placeholder="••••••••"
              className="w-full h-10 bg-food-elevated border border-food-border
                         hover:border-food-border-h focus:border-food-accent
                         focus:ring-2 focus:ring-food-accent/20
                         rounded-lg pl-9 pr-3 text-sm text-food-text
                         placeholder:text-food-text-m outline-none" />
          </div>
        </div>

        <button type="submit"
          className="w-full h-11 bg-food-accent hover:bg-food-accent-h
                     text-food-text-inv font-semibold text-sm rounded-lg
                     flex items-center justify-center gap-2 mt-2">
          <LogIn className="w-4 h-4" />
          Sign in
        </button>
      </form>

      <p className="text-center text-xs text-food-text-m mt-6">
        Don't have an account?{' '}
        <a className="text-food-accent font-medium cursor-pointer hover:underline">Request access</a>
      </p>

    </div>
  </div>

</div>
```

### 8.9 Data Table

```jsx
<div className="bg-food-card border border-food-border rounded-xl overflow-hidden shadow-card">

  {/* Table toolbar */}
  <div className="flex items-center justify-between px-5 py-3.5 border-b border-food-border">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-food-text-m" />
      <input placeholder="Search…"
        className="h-8 bg-food-elevated border border-food-border rounded-lg
                   pl-8 pr-3 text-xs text-food-text placeholder:text-food-text-m
                   focus:border-food-accent focus:ring-1 focus:ring-food-accent/20 outline-none w-48" />
    </div>
    <div className="flex items-center gap-2">
      <button className="/* secondary button */">
        <Download className="w-4 h-4" /> Export
      </button>
    </div>
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-food-border bg-food-elevated/50">
          <th className="text-left text-[11px] font-bold uppercase tracking-widest
                         text-food-text-m py-3 px-5">
            Column
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-food-border">
        <tr className="hover:bg-food-overlay">
          <td className="py-3.5 px-5 text-food-text">Value</td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <div className="flex items-center justify-between px-5 py-3 border-t border-food-border">
    <p className="text-xs text-food-text-m">Showing 1–10 of 48</p>
    <div className="flex items-center gap-1">
      <button className="w-7 h-7 flex items-center justify-center rounded-md
                         hover:bg-food-elevated text-food-text-m hover:text-food-text">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <button className="w-7 h-7 flex items-center justify-center rounded-md
                         bg-food-accent text-food-text-inv text-xs font-semibold">
        1
      </button>
      <button className="w-7 h-7 flex items-center justify-center rounded-md
                         hover:bg-food-elevated text-food-text-m hover:text-food-text text-xs">
        2
      </button>
      <button className="w-7 h-7 flex items-center justify-center rounded-md
                         hover:bg-food-elevated text-food-text-m hover:text-food-text">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>

</div>
```

### 8.10 Modal / Dialog

```jsx
{/* Backdrop */}
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

  {/* Panel */}
  <div className="bg-food-card border border-food-border rounded-xl shadow-lg w-full max-w-md">

    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-food-border">
      <h2 className="text-base font-semibold text-food-text">Modal Title</h2>
      <button className="w-7 h-7 flex items-center justify-center rounded-lg
                         hover:bg-food-elevated text-food-text-m hover:text-food-text">
        <X className="w-4 h-4" />
      </button>
    </div>

    {/* Body */}
    <div className="px-6 py-5 space-y-4">
      {/* content */}
    </div>

    {/* Footer */}
    <div className="flex justify-end gap-3 px-6 py-4 border-t border-food-border">
      <button className="/* secondary */">Cancel</button>
      <button className="/* primary */">Confirm</button>
    </div>

  </div>
</div>
```

### 8.11 Cart Drawer

Slides in from right. Kiosk order-summary style.

```jsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

{/* Drawer */}
<aside className="fixed right-0 top-0 h-full w-96 bg-food-card border-l border-food-border
                  z-50 flex flex-col shadow-lg">

  {/* Drawer header */}
  <div className="flex items-center justify-between px-5 py-4 border-b border-food-border shrink-0">
    <div className="flex items-center gap-2">
      <ShoppingCart className="w-5 h-5 text-food-accent" />
      <h2 className="font-semibold text-food-text">Your Order</h2>
      <span className="w-5 h-5 rounded-full bg-food-accent text-food-text-inv
                       text-[10px] font-bold flex items-center justify-center">
        {count}
      </span>
    </div>
    <button onClick={onClose}
      className="w-7 h-7 flex items-center justify-center rounded-lg
                 hover:bg-food-elevated text-food-text-m">
      <X className="w-4 h-4" />
    </button>
  </div>

  {/* Items */}
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
    {/* CartItem */}
    <div className="flex items-center gap-3 p-3 bg-food-elevated rounded-lg border border-food-border">
      <img className="w-12 h-12 rounded-lg object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-food-text truncate">{name}</p>
        <p className="text-xs text-food-text-m">{calories} kcal</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button className="w-6 h-6 rounded-md bg-food-card border border-food-border
                           flex items-center justify-center text-food-text-s hover:text-food-text">
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-sm font-semibold text-food-text w-4 text-center">{qty}</span>
        <button className="w-6 h-6 rounded-md bg-food-card border border-food-border
                           flex items-center justify-center text-food-text-s hover:text-food-text">
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <span className="text-sm font-bold text-food-accent shrink-0 ml-2">{price} RON</span>
    </div>
  </div>

  {/* Summary & submit */}
  <div className="p-4 border-t border-food-border shrink-0 space-y-3">
    <div className="flex justify-between text-sm">
      <span className="text-food-text-s">Total calories</span>
      <span className="font-semibold text-food-crimson flex items-center gap-1">
        <Flame className="w-3.5 h-3.5" /> {totalCal} kcal
      </span>
    </div>
    <div className="flex justify-between text-base font-bold">
      <span className="text-food-text">Total</span>
      <span className="text-food-accent">{totalPrice} RON</span>
    </div>
    <button className="w-full h-11 bg-food-accent hover:bg-food-accent-h
                       text-food-text-inv font-semibold rounded-lg
                       flex items-center justify-center gap-2">
      <CheckCircle className="w-4 h-4" />
      Place Order
    </button>
  </div>

</aside>
```

### 8.12 Empty State

```jsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-14 h-14 rounded-2xl bg-food-elevated border border-food-border
                  flex items-center justify-center mb-4">
    <InboxIcon className="w-6 h-6 text-food-text-m" />
  </div>
  <h3 className="text-sm font-semibold text-food-text mb-1">{title}</h3>
  <p className="text-xs text-food-text-m max-w-xs">{description}</p>
  {action && (
    <button className="mt-4 /* primary button */">{action}</button>
  )}
</div>
```

### 8.13 Loading Spinner

```jsx
<div className="flex items-center justify-center py-16">
  <div className="w-8 h-8 rounded-full border-2 border-food-border border-t-food-accent animate-spin" />
</div>
```

---

## 9. Iconography Map

Library: **Lucide React** — import individually.

| Feature | Icon |
|---------|------|
| Dashboard | `LayoutDashboard` |
| Today's Board | `CalendarDays` |
| My Orders | `ShoppingBag` |
| All Orders (admin) | `ClipboardList` |
| Food Catalog | `UtensilsCrossed` |
| Users | `Users` |
| Profile | `UserCircle` |
| Cart | `ShoppingCart` |
| Export | `Download` |
| Close board | `Lock` |
| Open board | `Unlock` |
| Calories | `Flame` |
| Revenue | `CircleDollarSign` |
| Body calc | `Scale` |
| Settings | `Settings` |
| Add | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Approve | `CheckCircle` |
| Reject | `XCircle` |
| Sign in | `LogIn` |
| Sign out | `LogOut` |
| Search | `Search` |
| Filter | `Filter` |
| Sort | `ArrowUpDown` |
| More actions | `MoreHorizontal` |
| Theme: light | `Sun` |
| Theme: dark | `Moon` |
| Alert | `AlertCircle` |
| Vegan | `Leaf` |
| Hot item | `Flame` |
| Notification | `Bell` |

---

## 10. Theme Toggle Component

```jsx
// src/components/ui/ThemeToggle.jsx
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-8 h-8 flex items-center justify-center rounded-lg
                 hover:bg-food-elevated text-food-text-m hover:text-food-text"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
```

```jsx
// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

---

## 11. Kiosk Board Page Layout

McDonald's self-order kiosk inspiration:
- Fixed top category nav bar
- Scrollable food grid below
- Floating cart button / drawer

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (w-64)  │  Header (h-14, sticky)               │
│                  ├─────────────────────────────────────  │
│  [Logo]          │  [Category tabs: All | Hot | Vegan…]  │
│  [Nav items]     ├─────────────────────────────────────  │
│                  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│                  │  │Card  │ │Card  │ │Card  │ │Card  │ │
│                  │  └──────┘ └──────┘ └──────┘ └──────┘ │
│                  │  ┌──────┐ ┌──────┐ …                  │
│  [User chip]     │  └──────┘ └──────┘                    │
│                  │  [Floating cart: 3 items | 47 RON →]  │
└─────────────────────────────────────────────────────────┘
```

Category tabs:
```jsx
<div className="flex items-center gap-1 px-6 py-3 border-b border-food-border
                bg-food-card overflow-x-auto shrink-0">
  {categories.map(cat => (
    <button key={cat} className={`
      inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg text-xs font-semibold whitespace-nowrap
      ${active === cat
        ? 'bg-food-accent text-food-text-inv'
        : 'bg-food-elevated text-food-text-s hover:text-food-text border border-food-border'}
    `}>
      {cat}
    </button>
  ))}
</div>
```

Floating cart button:
```jsx
<div className="fixed bottom-6 right-6 z-30">
  <button onClick={openCart}
    className="flex items-center gap-3 px-5 h-12 rounded-full
               bg-food-accent hover:bg-food-accent-h
               text-food-text-inv font-semibold text-sm shadow-lg shadow-food-accent/30">
    <ShoppingCart className="w-4 h-4" />
    <span>{count} items</span>
    <span className="h-5 w-px bg-white/30" />
    <span>{total} RON</span>
    <ChevronRight className="w-4 h-4" />
  </button>
</div>
```

---

## 12. Animation Notes

> Current `index.css` disables all transitions globally for performance.
> To re-enable selectively, remove the global override and apply per-component:

```css
/* Remove from @layer base: */
* { transition: none !important; animation: none !important; }

/* Then use Tailwind per-element: */
.btn { @apply transition-colors duration-150; }
.card { @apply transition-shadow duration-200; }
```

Recommended motion:
- Buttons: `transition-colors duration-150`
- Cards (hover border/shadow): `transition-shadow duration-200`
- Sidebar items: `transition-colors duration-100`
- Drawer open/close: `transition-transform duration-250 ease-out`
- Badge: no transition needed
- Spinner: `animate-spin`

---

## 13. Responsive Targets

| Breakpoint | Behaviour |
|-----------|-----------|
| `< 1024px` | Sidebar collapses to icon-only or hidden |
| `1024px` | Single column food grid, sidebar visible |
| `1280px` | Default 4-col food grid, full sidebar |
| `1440px+` | Comfortable spacing, no changes |

Mobile (< 768px): not required for v1, but do not break layout.
