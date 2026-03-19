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
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-food-elevated text-food-text-m hover:text-food-text transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-food-crimson" />
        </button>
        <ThemeToggle />
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
