# FoodApp — Design System

Inspired by: Behance/Dribbble dark food delivery dashboards.
Theme: Dark mode only. Dark green palette. Modern, clean, professional.

---

## Color Tokens

```css
/* src/index.css */
:root {
  /* Backgrounds */
  --bg-page:      #0a0f0a;   /* deepest background */
  --bg-card:      #111811;   /* card/panel surface */
  --bg-elevated:  #1a2a1a;   /* inputs, dropdown, hover */
  --bg-hover:     #1f321f;   /* hover overlay */

  /* Borders */
  --border:       #1a4d1a;   /* default border */
  --border-hover: #22c55e;   /* focused / hovered border */
  --border-dim:   #14280f;   /* subtle dividers */

  /* Accent (Green) */
  --accent:       #22c55e;   /* primary CTA, active */
  --accent-hover: #16a34a;   /* button hover */
  --accent-dim:   #14532d;   /* badges, subtle highlights */
  --accent-muted: #166534;   /* secondary elements */

  /* Text */
  --text-primary:   #f0fdf4; /* headings, primary content */
  --text-secondary: #86efac; /* secondary labels, stats */
  --text-muted:     #4ade80; /* placeholders, captions */
  --text-disabled:  #1f4d2a; /* disabled states */

  /* Status */
  --status-success: #22c55e;
  --status-warning: #f59e0b;
  --status-error:   #ef4444;
  --status-info:    #3b82f6;

  /* Status backgrounds */
  --status-success-bg: #14532d;
  --status-warning-bg: #451a03;
  --status-error-bg:   #450a0a;
  --status-info-bg:    #1e3a5f;
}
```

---

## Tailwind Config Extension

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      food: {
        'bg':        '#0a0f0a',
        'card':      '#111811',
        'elevated':  '#1a2a1a',
        'border':    '#1a4d1a',
        'accent':    '#22c55e',
        'accent-h':  '#16a34a',
        'accent-d':  '#14532d',
        'text':      '#f0fdf4',
        'text-s':    '#86efac',
        'text-m':    '#4ade80',
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif']
    },
    boxShadow: {
      'card': '0 0 0 1px #1a4d1a, 0 4px 24px rgba(0,0,0,0.4)',
      'glow': '0 0 20px rgba(34, 197, 94, 0.15)',
    }
  }
}
```

---

## Typography

| Element | Classes |
|---------|---------|
| Page title | `text-2xl font-bold text-food-text` |
| Section title | `text-lg font-semibold text-food-text` |
| Card label | `text-sm font-medium text-food-text-s` |
| Body text | `text-sm text-food-text` |
| Caption / muted | `text-xs text-food-text-m` |
| Stat number | `text-3xl font-bold text-food-accent` |

---

## Spacing & Layout

- Page padding: `p-6`
- Card padding: `p-5`
- Section gap: `gap-6`
- Grid (stats): `grid grid-cols-2 lg:grid-cols-4 gap-4`
- Sidebar width: `w-64` (fixed)
- Content area: `flex-1 min-h-screen bg-food-bg`

---

## Component Specifications

### StatCard
```jsx
<div className="bg-food-card border border-food-border rounded-xl p-5 shadow-card">
  <div className="flex items-center justify-between mb-3">
    <span className="text-sm font-medium text-food-text-s">{label}</span>
    <div className="p-2 bg-food-accent-d rounded-lg">
      <Icon className="w-4 h-4 text-food-accent" />
    </div>
  </div>
  <div className="text-3xl font-bold text-food-text">{value}</div>
  <div className="text-xs text-food-text-m mt-1">{sublabel}</div>
</div>
```

### FoodCard
```jsx
<div className="bg-food-card border border-food-border rounded-xl overflow-hidden hover:border-food-accent transition-colors">
  <img className="w-full h-36 object-cover" />
  <div className="p-4">
    <span className="text-xs bg-food-accent-d text-food-accent px-2 py-0.5 rounded-full">{category}</span>
    <h3 className="text-food-text font-semibold mt-2">{name}</h3>
    <div className="flex items-center justify-between mt-3">
      <span className="text-food-accent font-bold">{price} RON</span>
      <span className="text-food-text-m text-xs">{calories} kcal</span>
    </div>
    <button className="mt-3 w-full bg-food-accent hover:bg-food-accent-h text-white rounded-lg py-2 text-sm font-medium transition-colors">
      Add to Cart
    </button>
  </div>
</div>
```

### Button Variants
```jsx
// Primary
<button className="bg-food-accent hover:bg-food-accent-h text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">

// Secondary / Outline
<button className="border border-food-border hover:border-food-accent text-food-text-s hover:text-food-text rounded-lg px-4 py-2 text-sm transition-colors">

// Danger
<button className="bg-status-error-bg hover:bg-red-900 text-status-error rounded-lg px-4 py-2 text-sm transition-colors">

// Ghost
<button className="text-food-text-m hover:text-food-text hover:bg-food-elevated rounded-lg px-3 py-2 text-sm transition-colors">
```

### Input / Form Fields
```jsx
<input className="w-full bg-food-elevated border border-food-border hover:border-food-border-hover focus:border-food-accent focus:ring-1 focus:ring-food-accent rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none transition-colors" />
```

### Badge / Status Pill
```jsx
// Open (green)
<span className="text-xs bg-food-accent-d text-food-accent px-2.5 py-0.5 rounded-full font-medium">Open</span>

// Closed (gray)
<span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full font-medium">Closed</span>

// Pending (yellow)
<span className="text-xs bg-status-warning-bg text-status-warning px-2.5 py-0.5 rounded-full font-medium">Pending</span>
```

### Table
```jsx
<table className="w-full">
  <thead>
    <tr className="border-b border-food-border">
      <th className="text-left text-xs font-medium text-food-text-m py-3 px-4 uppercase tracking-wide">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-food-border hover:bg-food-elevated transition-colors">
      <td className="py-3 px-4 text-sm text-food-text">Value</td>
    </tr>
  </tbody>
</table>
```

### Sidebar
```jsx
<aside className="w-64 bg-food-card border-r border-food-border min-h-screen flex flex-col">
  {/* Logo */}
  <div className="p-5 border-b border-food-border">
    <span className="text-food-accent font-bold text-lg">🍽 FoodApp</span>
  </div>
  {/* Nav items */}
  <nav className="flex-1 p-3 space-y-1">
    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-food-text-s hover:text-food-text hover:bg-food-elevated transition-colors">
      {/* Active state: bg-food-accent-d text-food-accent */}
    </a>
  </nav>
</aside>
```

---

## Iconography

Library: **Lucide React**

| Feature | Icon |
|---------|------|
| Dashboard | `LayoutDashboard` |
| Board / Today | `CalendarDays` |
| My Orders | `ShoppingBag` |
| All Orders (admin) | `ClipboardList` |
| Food Catalog | `UtensilsCrossed` |
| Users | `Users` |
| Profile | `User` |
| Cart | `ShoppingCart` |
| Export | `Download` |
| Close board | `Lock` |
| Calories | `Flame` |
| Revenue | `DollarSign` |
| Weight/body | `Scale` |
| Settings | `Settings` |

---

## Responsive Target

Primary target: **1280px+ desktop** (internal tool, used on work monitors).
Minimum supported: 1024px.
Mobile: not required for v1, but don't break at smaller sizes.
