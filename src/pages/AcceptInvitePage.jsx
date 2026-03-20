import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'

const schema = z.object({
  nickname: z.string().min(2, 'Nickname must be at least 2 characters.').max(40),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match.',
  path: ['confirm'],
})

export default function AcceptInvitePage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(undefined) // undefined = checking
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    const parsed = schema.safeParse({ nickname: nickname.trim(), password, confirm })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input.')
      return
    }

    setLoading(true)
    setError('')

    // Set the password on the auth user
    const { error: pwErr } = await supabase.auth.updateUser({ password: parsed.data.password })
    if (pwErr) {
      setError(pwErr.message)
      setLoading(false)
      return
    }

    // Save nickname to profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({ nickname: parsed.data.nickname }).eq('id', user.id)
    }

    setDone(true)
    setLoading(false)
    setTimeout(() => navigate('/'), 1500)
  }

  // Still checking session
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-food-bg flex items-center justify-center">
        <p className="text-food-text-m text-sm">Loading…</p>
      </div>
    )
  }

  // No session — invalid or expired link
  if (!session) {
    return (
      <div className="min-h-screen bg-food-bg flex items-center justify-center">
        <div className="bg-food-card border border-food-border rounded-xl p-8 w-full max-w-sm text-center">
          <p className="text-food-text font-semibold text-lg mb-2">Invalid invite link</p>
          <p className="text-food-text-m text-sm">This link has expired or already been used. Ask an admin to send a new invitation.</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-food-bg flex items-center justify-center">
        <div className="bg-food-card border border-food-border rounded-xl p-8 w-full max-w-sm text-center">
          <p className="text-food-text font-semibold text-lg mb-2">You're all set!</p>
          <p className="text-food-text-m text-sm">Redirecting you to the app…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-food-bg flex items-center justify-center">
      <div className="bg-food-card border border-food-border rounded-xl p-8 w-full max-w-sm shadow-card">
        <h1 className="text-2xl font-bold text-food-text mb-1">Welcome!</h1>
        <p className="text-food-text-m text-sm mb-6">Set your nickname and password to finish.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
            type="text"
            placeholder="Nickname (how others see you)"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={40}
            required
          />
          <input
            className="w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
            type="password"
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <input
            className="w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <Button className="w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Complete account'}
          </Button>
        </form>
      </div>
    </div>
  )
}
