import { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { sanitizeEmail } from '../utils/security'
import { useDebouncedAction } from '../hooks/useDebouncedAction'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(128),
})

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setError('')
    const parsed = loginSchema.safeParse({
      email: sanitizeEmail(email),
      password: password.trim(),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input.')
      return
    }

    setLoading(true)
    const { error } = await signIn(parsed.data.email, parsed.data.password)
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSubmitDebounced = useDebouncedAction(handleSubmit, 600)

  return (
    <div className="min-h-screen bg-food-bg flex items-center justify-center">
      <div className="bg-food-card border border-food-border rounded-xl p-8 w-full max-w-sm shadow-card">
        <h1 className="text-2xl font-bold text-food-text mb-1">🍽 FoodApp</h1>
        <p className="text-food-text-m text-sm mb-6">Sign in to your account</p>
        <form onSubmit={handleSubmitDebounced} className="space-y-4">
          <input className="w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors" type="email" placeholder="Email" value={email} onChange={e => setEmail(sanitizeEmail(e.target.value))} required />
          <input className="w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
        </form>
      </div>
    </div>
  )
}
