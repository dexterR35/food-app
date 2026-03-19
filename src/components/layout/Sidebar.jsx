import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, ShoppingBag, ClipboardList, UtensilsCrossed, Users, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const userLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/board', icon: CalendarDays, label: "Today's Board" },
  { to: '/my-orders', icon: ShoppingBag, label: 'My Orders' },
]
const adminLinks = [
  { to: '/orders', icon: ClipboardList, label: 'All Orders' },
  { to: '/food', icon: UtensilsCrossed, label: 'Food Catalog' },
  { to: '/users', icon: Users, label: 'Users' },
]

export default function Sidebar() {
  const { isAdmin, profile } = useAuth()
  const linkClass = ({ isActive }) =>
    cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
      isActive ? 'bg-food-accent-d text-food-accent' : 'text-food-text-s hover:text-food-text hover:bg-food-elevated')

  return (
    <aside className="w-64 bg-food-card border-r border-food-border min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-food-border">
        <span className="text-food-accent font-bold text-lg">🍽 FoodApp</span>
        {profile?.department && <p className="text-food-text-m text-xs mt-1">{profile.department}</p>}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {userLinks.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
            <Icon className="w-4 h-4" />{label}
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-food-border" />
            {adminLinks.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="w-4 h-4" />{label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="p-3 border-t border-food-border">
        <NavLink to="/profile" className={linkClass}>
          <User className="w-4 h-4" />Profile
        </NavLink>
      </div>
    </aside>
  )
}
