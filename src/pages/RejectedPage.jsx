import { XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

export default function RejectedPage() {
  const { signOut } = useAuth()
  return (
    <div className="min-h-screen bg-food-bg flex items-center justify-center">
      <div className="bg-food-card border border-food-border rounded-xl p-10 w-full max-w-sm text-center shadow-card">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-food-text font-semibold text-xl mb-2">Access denied</h2>
        <p className="text-food-text-m text-sm mb-6">Contact your admin for access.</p>
        <Button variant="secondary" onClick={signOut}>Sign out</Button>
      </div>
    </div>
  )
}
