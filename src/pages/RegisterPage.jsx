import { useState } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import { sanitizeEmail } from '../utils/security'
import { useDebouncedAction } from '../hooks/useDebouncedAction'

const registerSchema = z.object({
  email: z.string().email('Please enter a valid work email.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(128),
})

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    const parsed = registerSchema.safeParse({
      email: sanitizeEmail(email),
      password: password.trim(),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input.')
      return
    }

    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp(parsed.data)
    if (error) setError(error.message)
    else setDone(true)
    setLoading(false)
  }

  const handleSubmitDebounced = useDebouncedAction(handleSubmit, 600)

  if (done) return (
    <div className="min-h-screen bg-food-bg flex items-center justify-center">
      <div className="bg-food-card border border-food-border rounded-xl p-8 w-full max-w-sm text-center">
        <p className="text-food-text font-semibold text-lg mb-2">Check your email</p>
        <p className="text-food-text-m text-sm">Confirm your email to finish invitation signup.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-food-bg flex items-center justify-center">
      <div className="bg-food-card border border-food-border rounded-xl p-8 w-full max-w-sm shadow-card">
        <h1 className="text-2xl font-bold text-food-text mb-1">Create account</h1>
        <p className="text-food-text-m text-sm mb-6">You need an admin invitation first</p>
        <form onSubmit={handleSubmitDebounced} className="space-y-4">
          <input className="w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors" type="email" placeholder="Work email" value={email} onChange={e => setEmail(sanitizeEmail(e.target.value))} required />
          <input className="w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors" type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
        </form>
        <p className="text-food-text-m text-sm text-center mt-4">
          Have an account? <Link to="/login" className="text-food-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
