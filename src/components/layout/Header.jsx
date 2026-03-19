import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

export default function Header() {
  const { profile, signOut } = useAuth()
  return (
    <header className="h-14 bg-food-card border-b border-food-border flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-food-text-s text-sm">{profile?.username}</span>
        {profile?.avatar_url
          ? <img src={profile.avatar_url} className="w-8 h-8 rounded-full border border-food-border object-cover" />
          : <div className="w-8 h-8 rounded-full bg-food-accent-d flex items-center justify-center text-food-accent text-sm font-semibold">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
        }
        <Button variant="ghost" onClick={signOut} className="text-xs px-2 py-1">Sign out</Button>
      </div>
    </header>
  )
}
