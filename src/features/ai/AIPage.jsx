import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Sparkles, Send, RotateCcw, Bot, User, TrendingDown,
  TrendingUp, Minus, Flame, Target, Scale, Save, CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useBodyCalc } from '../../hooks/useBodyCalc'
import { useAIChat } from '../body/hooks/useAIChat'

/* ─── Catalog query ──────────────────────────────────────────────────────── */
function useCatalog() {
  return useQuery({
    queryKey: ['catalog-ai'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_items')
        .select('id, name, calories, price, category, description')
        .eq('is_active', true)
        .order('category')
      if (error) throw error
      return data ?? []
    },
  })
}

/* ─── Goal update mutation ───────────────────────────────────────────────── */
const goalSchema = z.object({
  goal:           z.enum(['lose', 'maintain', 'gain']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
})

const GOAL_INFO = {
  lose:     { label: 'Lose weight',   Icon: TrendingDown, color: 'text-food-crimson', adj: '−500 kcal/day · ≈0.5 kg/week'    },
  maintain: { label: 'Maintain',      Icon: Minus,        color: 'text-food-text-m',  adj: 'Hold current weight'              },
  gain:     { label: 'Gain muscle',   Icon: TrendingUp,   color: 'text-food-accent',  adj: '+300 kcal/day · ≈0.25 kg/week'   },
}

const ACTIVITY_LABELS = {
  sedentary:   'Sedentary',
  light:       'Light (1–3×/wk)',
  moderate:    'Moderate (3–5×/wk)',
  active:      'Active (6–7×/wk)',
  very_active: 'Very active',
}

const QUICK_PROMPTS = [
  'What should I eat today to hit my goal?',
  'Build me a high-protein meal plan from the menu.',
  'Which menu items should I avoid for my goal?',
  'How many meals should I have per day?',
  'Explain my macros in simple terms.',
  'Am I in a calorie deficit today?',
  'Best pre-workout snack from the menu?',
  'Give me a cheat meal that won\'t destroy my progress.',
]

function buildSystemPrompt(profile, calc, catalog) {
  const goalLabel = {
    lose:     'lose weight (−500 kcal/day deficit, ≈0.5 kg/week)',
    maintain: 'maintain current weight',
    gain:     'gain muscle (lean bulk, +300 kcal/day surplus, ≈0.25 kg/week)',
  }

  const menu = catalog.length
    ? catalog.map(i =>
        `  • ${i.name} — ${i.calories} kcal | ${i.price.toFixed(2)} RON${i.category ? ` | ${i.category}` : ''}${i.description ? ` | "${i.description}"` : ''}`
      ).join('\n')
    : '  (no items in catalog yet)'

  return `You are an expert, friendly nutrition coach embedded inside a company food-ordering app.

USER PROFILE:
  Weight: ${profile?.weight_kg ?? '?'} kg | Height: ${profile?.height_cm ?? '?'} cm
  Age: ${profile?.age ?? '?'} | Gender: ${profile?.gender ?? '?'}
  Activity level: ${ACTIVITY_LABELS[profile?.activity_level] ?? '?'}
  Goal: ${goalLabel[profile?.goal] ?? 'not set'}

${calc ? `CALCULATED NUTRITION TARGETS (Mifflin-St Jeor formula):
  BMR: ${calc.bmr} kcal/day (at rest)
  TDEE: ${calc.tdee} kcal/day (with activity)
  Daily calorie target: ${calc.dailyTarget} kcal/day
  Protein: ${calc.protein_g}g | Carbs: ${calc.carbs_g}g | Fat: ${calc.fat_g}g` : 'TARGETS: not yet calculated (profile incomplete)'}

COMPANY MENU (these are the ONLY food items available to order):
${menu}

YOUR ROLE:
- Give specific, practical nutrition advice tailored to this user's exact profile and goal.
- When suggesting meals, ONLY use items from the menu above. Show item name, calories, and price.
- If asked to build a meal plan, pick real items and show total calories + how it fits the daily target.
- Keep responses clear and to the point (max 6-8 sentences unless building a full plan).
- Be warm, encouraging, and occasionally witty — but always accurate.
- If the profile is incomplete, gently ask what info is missing.
- Currency: RON. Calories: kcal.`
}

/* ─── Message bubble ─────────────────────────────────────────────────────── */
function Bubble({ m }) {
  const isUser = m.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-food-accent' : 'bg-food-elevated border border-food-border'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-food-accent" />
        }
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-food-accent text-white rounded-tr-sm'
          : 'bg-food-elevated text-food-text border border-food-border rounded-tl-sm'
      }`}>
        {m.content}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AIPage() {
  const { profile, refreshProfile } = useAuth()
  const queryClient = useQueryClient()
  const calc = useBodyCalc(profile)
  const { data: catalog = [] } = useCatalog()
  const { messages, loading, error, send, reset } = useAIChat()

  const [input, setInput]     = useState('')
  const [goalSaved, setGoalSaved] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const systemPrompt = useMemo(
    () => buildSystemPrompt(profile, calc, catalog),
    [profile, calc, catalog]
  )

  /* Goal form */
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goal:           profile?.goal           ?? 'maintain',
      activity_level: profile?.activity_level ?? 'sedentary',
    },
  })
  const watchedGoal = watch('goal')
  const goalInfo = GOAL_INFO[watchedGoal] ?? GOAL_INFO.maintain

  async function saveGoal(values) {
    const { error } = await supabase.from('users').update(values).eq('id', profile.id)
    if (error) { toast.error('Failed to save goal.'); return }
    await refreshProfile()
    queryClient.invalidateQueries({ queryKey: ['catalog-ai'] })
    setGoalSaved(true)
    setTimeout(() => setGoalSaved(false), 2500)
    toast.success('Goal updated!')
  }

  /* Chat */
  async function handleSend(text) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    await send(msg, systemPrompt)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const inputCls = 'w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm outline-none focus:border-food-accent transition-colors'
  const labelCls = 'text-food-text-m text-xs font-medium mb-1 block'

  return (
    <div className="flex flex-col -m-6" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-food-border bg-food-card flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-food-accent-d flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-food-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-food-text">AI Nutrition Coach</h1>
          <p className="text-food-text-m text-xs">
            Powered by Gemini · knows your profile & menu · helps you reach your goal
          </p>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT — profile snapshot + goal editor ── */}
        <aside className="w-72 shrink-0 p-4 bg-food-bg overflow-y-auto">
          <div className="bg-food-card border border-food-border rounded-2xl p-5 space-y-5">

            {/* Stats snapshot */}
            {calc && (
              <div className="space-y-3">
                <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest">
                  Your Targets
                </p>
                {[
                  { label: 'BMR',          value: `${calc.bmr} kcal`,        Icon: Flame,  color: 'text-amber-500' },
                  { label: 'TDEE',         value: `${calc.tdee} kcal`,       Icon: Target, color: 'text-blue-400'  },
                  { label: 'Daily Target', value: `${calc.dailyTarget} kcal`, Icon: goalInfo.Icon, color: goalInfo.color },
                ].map(({ label, value, Icon, color }) => (
                  <div key={label} className="flex items-center justify-between bg-food-elevated rounded-xl px-3 py-2.5">
                    <span className="flex items-center gap-2 text-food-text-s text-xs font-medium">
                      <Icon className={`w-3.5 h-3.5 ${color}`} />{label}
                    </span>
                    <span className="text-food-text font-bold text-sm">{value}</span>
                  </div>
                ))}

                {/* Macro pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { label: `${calc.protein_g}g protein`, color: 'bg-food-crimson-d text-food-crimson' },
                    { label: `${calc.carbs_g}g carbs`,    color: 'bg-amber-50 text-amber-600' },
                    { label: `${calc.fat_g}g fat`,        color: 'bg-blue-50 text-blue-600'   },
                  ].map(({ label, color }) => (
                    <span key={label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
                  ))}
                </div>
              </div>
            )}

            {!calc && (
              <div className="bg-food-elevated rounded-xl p-4 text-center space-y-2">
                <Scale className="w-8 h-8 text-food-text-m opacity-40 mx-auto" />
                <p className="text-food-text-m text-xs">
                  Fill in your metrics on the{' '}
                  <a href="/body" className="text-food-accent font-semibold hover:underline">Body Calc</a>{' '}
                  page to get personalised advice.
                </p>
              </div>
            )}

            <hr className="border-food-border" />

            {/* Goal editor */}
            <form onSubmit={handleSubmit(saveGoal)} className="space-y-4">
              <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest">
                Update Goal
              </p>

              {/* Goal radio cards */}
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(GOAL_INFO).map(([val, info]) => {
                  const selected = watchedGoal === val
                  return (
                    <label key={val} className={`flex flex-col items-center gap-1 p-2 rounded-xl border cursor-pointer transition-all text-center ${
                      selected
                        ? 'border-food-accent bg-food-accent-d text-food-accent'
                        : 'border-food-border hover:border-food-border-h text-food-text-s'
                    }`}>
                      <input type="radio" value={val} {...register('goal')} className="sr-only" />
                      <info.Icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold leading-none">{info.label.split(' ')[0]}</span>
                    </label>
                  )
                })}
              </div>

              {/* Goal description */}
              <div className="flex items-center gap-2 bg-food-elevated rounded-lg px-3 py-2 text-[11px] text-food-text-m">
                <goalInfo.Icon className={`w-3 h-3 ${goalInfo.color} shrink-0`} />
                <span>{goalInfo.adj}</span>
              </div>

              {/* Activity */}
              <div>
                <label className={labelCls}>Activity Level</label>
                <select {...register('activity_level')} className={inputCls}>
                  {Object.entries(ACTIVITY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 rounded-xl bg-food-accent hover:bg-food-accent-h text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {goalSaved
                  ? <><CheckCircle className="w-3.5 h-3.5" />Saved!</>
                  : <><Save className="w-3.5 h-3.5" />{isSubmitting ? 'Saving…' : 'Update Goal'}</>
                }
              </button>
            </form>

            <hr className="border-food-border" />

            {/* Quick prompts */}
            <div className="space-y-2">
              <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest">Quick asks</p>
              <div className="space-y-1.5">
                {QUICK_PROMPTS.slice(0, 5).map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    className="w-full text-left text-xs text-food-text-s border border-food-border hover:border-food-accent/50 hover:text-food-text bg-food-elevated hover:bg-food-accent-d rounded-lg px-3 py-2 transition-all leading-snug disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* ── RIGHT — chat ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-food-bg">

          {/* Chat thread */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-center pb-10">
                <div className="w-16 h-16 rounded-2xl bg-food-accent-d flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-food-accent" />
                </div>
                <div>
                  <p className="text-food-text font-bold text-lg">Hey! I'm your nutrition coach.</p>
                  <p className="text-food-text-m text-sm mt-1 max-w-sm">
                    Ask me anything — what to eat today, how to hit your macros, or which menu items fit your goal.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                  {QUICK_PROMPTS.map(q => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left text-xs text-food-text-s border border-food-border hover:border-food-accent/60 hover:text-food-text bg-food-card hover:bg-food-accent-d rounded-xl px-4 py-3 transition-all leading-snug"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => <Bubble key={i} m={m} />)}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-food-elevated border border-food-border flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-food-accent" />
                </div>
                <div className="bg-food-elevated border border-food-border rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-food-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-food-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-food-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Error bar */}
          {error && (
            <div className="px-6 py-2 bg-food-crimson-d border-t border-food-crimson/20 text-food-crimson text-xs">
              {error}
            </div>
          )}

          {/* Input bar */}
          <div className="border-t border-food-border bg-food-card px-6 py-4 shrink-0">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about your goals, today's menu, macros, meal plans…"
                rows={1}
                disabled={loading}
                className="flex-1 bg-food-elevated border border-food-border rounded-xl px-4 py-3 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors resize-none disabled:opacity-50 leading-relaxed"
              />
              {messages.length > 0 && (
                <button
                  onClick={reset}
                  title="New chat"
                  className="w-11 h-11 self-end rounded-xl border border-food-border hover:border-food-border-h text-food-text-m hover:text-food-text flex items-center justify-center transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="w-11 h-11 self-end rounded-xl bg-food-accent hover:bg-food-accent-h text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-food-text-m text-[11px] text-center mt-2">
              Enter to send · Shift+Enter for new line · AI knows your profile and company menu
            </p>
          </div>

        </main>
      </div>
    </div>
  )
}
