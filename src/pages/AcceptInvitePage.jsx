import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import { sanitizeEmail } from '../utils/security'

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
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(sanitizeEmail(searchParams.get('email') ?? ''))
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Pick up email from Supabase session (when user arrives via invite email link)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setEmail(session.user.email)
    })
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

    // Create the auth user with real password via edge function
    const { error: fnErr } = await supabase.functions.invoke('complete-signup', {
      body: {
        email,
        password: parsed.data.password,
        nickname: parsed.data.nickname,
      },
    })

    if (fnErr) {
      setError(fnErr.message)
      setLoading(false)
      return
    }

    // Sign in with the credentials they just set
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.data.password,
    })

    if (signInErr) {
      setError('Account created! Please go to login and sign in.')
      setLoading(false)
      return
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-food-bg flex items-center justify-center">
      <div className="bg-food-card border border-food-border rounded-xl p-8 w-full max-w-sm shadow-card">
        <h1 className="text-2xl font-bold text-food-text mb-1">Create your account</h1>
        <p className="text-food-text-m text-sm mb-6">You have been invited. Set your details to get started.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text-m text-sm outline-none cursor-not-allowed opacity-60"
            type="email"
            value={email}
            disabled
          />
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
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  )
}
