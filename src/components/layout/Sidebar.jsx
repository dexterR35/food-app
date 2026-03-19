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
