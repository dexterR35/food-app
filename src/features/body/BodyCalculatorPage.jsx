import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  Scale, Flame, Target, TrendingDown, TrendingUp, Minus,
  Sun, Coffee, Moon, Apple, Save, Beef, Wheat, Droplets,
  Pencil, CheckCircle, Ruler, Heart, Zap, Clock, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useBodyCalc } from '../../hooks/useBodyCalc'
import { useBoard } from '../board/hooks/useBoard'
import { useMyOrder } from '../board/hooks/useSubmitOrder'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { SectionCard, StatRow } from '../../components/ui/StatCard'

/* ─── Catalog for meal suggestions ──────────────────────────────────────── */
function useCatalog() {
  return useQuery({
    queryKey: ['catalog-body'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_items').select('id,name,calories,price,category,image_url,description')
        .eq('is_active', true).order('calories')
      if (error) throw error
      return data ?? []
    },
  })
}

/* ─── Schema ─────────────────────────────────────────────────────────────── */
const bodySchema = z.object({
  height_cm:      z.coerce.number().int().min(50, 'Min 50 cm').max(300, 'Max 300 cm'),
  weight_kg:      z.coerce.number().min(20, 'Min 20 kg').max(500, 'Max 500 kg'),
  age:            z.coerce.number().int().min(10, 'Min 10').max(120, 'Max 120'),
  gender:         z.enum(['male', 'female', 'other']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal:           z.enum(['lose', 'maintain', 'gain']),
  neck_cm:        z.coerce.number().min(10).max(80).optional().or(z.literal('').transform(() => null)).nullable(),
  waist_cm:       z.coerce.number().min(40).max(250).optional().or(z.literal('').transform(() => null)).nullable(),
  hip_cm:         z.coerce.number().min(40).max(250).optional().or(z.literal('').transform(() => null)).nullable(),
  wrist_cm:       z.coerce.number().min(8).max(35).optional().or(z.literal('').transform(() => null)).nullable(),
})

/* ─── Constants ──────────────────────────────────────────────────────────── */
const GOAL_INFO = {
  lose:     { label: 'Lose weight',  Icon: TrendingDown, color: 'text-food-crimson', adj: '−500 kcal/day', rate: '≈ 0.5 kg/week'  },
  maintain: { label: 'Maintain',     Icon: Minus,        color: 'text-food-text-m',  adj: '±0 kcal/day',  rate: 'Hold weight'      },
  gain:     { label: 'Gain muscle',  Icon: TrendingUp,   color: 'text-food-accent',  adj: '+300 kcal/day', rate: '≈ 0.25 kg/week' },
}

const ACTIVITY_LABELS = {
  sedentary:   'Sedentary — desk job, no exercise',
  light:       'Light — 1–3 days/week',
  moderate:    'Moderate — 3–5 days/week',
  active:      'Active — 6–7 days/week',
  very_active: 'Very active — athlete / physical job',
}

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', Icon: Sun,    pct: 0.25 },
  { key: 'lunch',     label: 'Lunch',     Icon: Coffee, pct: 0.35 },
  { key: 'dinner',    label: 'Dinner',    Icon: Moon,   pct: 0.30 },
  { key: 'snack',     label: 'Snack',     Icon: Apple,  pct: 0.10 },
]

/* ─── Small shared components ───────────────────────────────────────────── */
const inputBase  = 'w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors'
const inputOn    = `${inputBase} bg-food-elevated border-food-border text-food-text placeholder:text-food-text-m focus:border-food-accent`
const inputOff   = `${inputBase} bg-food-bg border-food-border/50 text-food-text-s cursor-not-allowed`
const labelCls   = 'text-food-text-m text-xs font-medium mb-1 block'

function Inp({ label, error, editing, ...props }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input className={editing ? inputOn : inputOff} disabled={!editing} {...props} />
      {error && <p className="text-food-crimson text-[10px] mt-0.5">{error.message}</p>}
    </div>
  )
}

function Sel({ label, editing, children, ...props }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select className={editing ? inputOn : inputOff} disabled={!editing} {...props}>
        {children}
      </select>
    </div>
  )
}


function MacroBar({ label, grams, kcal, pct, textCls, barCls, Icon }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1.5 font-semibold ${textCls}`}>
          <Icon className="w-3.5 h-3.5" />{label} ({pct}%)
        </span>
        <span className="text-food-text font-bold">
          {grams}g <span className="text-food-text-m font-normal">· {kcal} kcal</span>
        </span>
      </div>
      <div className="h-2 bg-food-elevated rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barCls}`} style={{ width: `${Math.min(100, (kcal / 900) * 100)}%` }} />
      </div>
    </div>
  )
}

function SuggestionCard({ item }) {
  return (
    <div className="flex gap-3 bg-food-elevated border border-food-border rounded-xl p-3 hover:border-food-accent/50 transition-colors">
      <div className="w-14 h-14 rounded-lg bg-food-card overflow-hidden shrink-0">
        {item.image_url
          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🍽</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-food-text font-semibold text-sm line-clamp-1">{item.name}</p>
        {item.description && <p className="text-food-text-m text-xs mt-0.5 line-clamp-1">{item.description}</p>}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-food-crimson text-xs font-bold">
            <Flame className="w-3 h-3" />{item.calories} kcal
          </span>
          <span className="text-food-accent text-xs font-bold">{item.price.toFixed(2)} RON</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function BodyCalculatorPage() {
  const { profile, refreshProfile } = useAuth()
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  // Has saved body data → start in read-only; no data → start in edit mode
  const hasData = !!(profile?.height_cm && profile?.weight_kg && profile?.age && profile?.gender)
  const [editing, setEditing] = useState(!hasData)
  const [metricsCollapsed, setMetricsCollapsed] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('foodapp_body_metrics_collapsed') : null
      return raw === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem('foodapp_body_metrics_collapsed', String(metricsCollapsed))
    } catch {}
  }, [metricsCollapsed])

  const { data: board }      = useBoard()
  const { data: todayOrder } = useMyOrder(board?.id)
  const { data: catalog = [], isLoading: catalogLoading } = useCatalog()

  const calc = useBodyCalc(profile)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(bodySchema),
    defaultValues: {
      height_cm:      profile?.height_cm      ?? '',
      weight_kg:      profile?.weight_kg      ?? '',
      age:            profile?.age            ?? '',
      gender:         profile?.gender         ?? 'male',
      activity_level: profile?.activity_level ?? 'sedentary',
      goal:           profile?.goal           ?? 'maintain',
      neck_cm:        profile?.neck_cm        ?? '',
      waist_cm:       profile?.waist_cm       ?? '',
      hip_cm:         profile?.hip_cm         ?? '',
      wrist_cm:       profile?.wrist_cm       ?? '',
    },
  })

  const watchedGoal   = watch('goal')
  const watchedGender = watch('gender')
  const goalInfo      = GOAL_INFO[watchedGoal] ?? GOAL_INFO.maintain

  // Today's progress
  const consumed    = todayOrder?.total_calories ?? 0
  const remaining   = calc ? Math.max(0, calc.dailyTarget - consumed) : null
  const consumedPct = calc ? Math.min(100, (consumed / calc.dailyTarget) * 100) : 0

  // Meal plan suggestions
  const mealPlan = useMemo(() => {
    if (!calc || !catalog.length) return []
    return MEALS.map(meal => {
      const budget     = Math.round(calc.dailyTarget * meal.pct)
      const candidates = catalog
        .filter(i => i.calories > 0 && i.calories <= budget)
        .sort((a, b) => b.calories - a.calories)
      return { ...meal, budget, suggestions: candidates.slice(0, 2) }
    })
  }, [calc, catalog])

  async function onSubmit(values) {
    setSaving(true)
    // Clean up empty optional fields
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])
    )
    const { error } = await supabase.from('users').update(payload).eq('id', profile.id)
    if (!error) {
      await refreshProfile()
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  /* ── Helpers for stats display ── */
  function val(v, unit = '') { return v != null ? `${v}${unit}` : '—' }

  return (
    <div className="flex flex-col -m-6" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Header */}
      <div className="px-6 py-4 border-b border-food-border bg-food-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-food-accent-d flex items-center justify-center">
            <Scale className="w-5 h-5 text-food-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-food-text">Body Calculator</h1>
            <p className="text-food-text-m text-xs">
              Mifflin-St Jeor · US Navy body fat · full body composition analysis
            </p>
          </div>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-food-accent text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />Saved!
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ══ LEFT SIDEBAR — form ══════════════════════════════════════════ */}
        <aside
          className={`shrink-0 border-r border-food-border bg-food-card flex flex-col overflow-y-auto transition-[width] duration-200 ${metricsCollapsed ? 'w-20' : 'w-80'}`}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
            <div className={`flex-1 ${metricsCollapsed ? 'p-3 space-y-3' : 'p-5 space-y-6'}`}>

              {/* Section header with Edit toggle */}
              <div className="flex items-center justify-between gap-2">
                {metricsCollapsed ? (
                  <Scale className="w-5 h-5 text-food-accent shrink-0" />
                ) : (
                  <p className="text-food-text font-bold text-sm">My Metrics</p>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  {!metricsCollapsed && !editing && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 text-xs text-food-accent hover:text-food-accent-h font-semibold transition-colors"
                    >
                      <Pencil className="w-3 h-3" />Edit
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setMetricsCollapsed(v => !v)}
                    aria-label={metricsCollapsed ? 'Expand My Metrics' : 'Collapse My Metrics'}
                    title={metricsCollapsed ? 'Expand My Metrics' : 'Collapse My Metrics'}
                    className="w-8 h-8 rounded-xl border border-food-border bg-food-elevated hover:bg-food-card hover:border-food-border-h text-food-text-m flex items-center justify-center transition-colors"
                  >
                    {metricsCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-food-accent" />
                    ) : (
                      <ChevronLeft className="w-4 h-4 text-food-accent" />
                    )}
                  </button>
                </div>
              </div>

              {!metricsCollapsed && (
                <>
                  {/* ── Section 1: Essential ── */}
                  <div className="space-y-3">
                    <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Scale className="w-3 h-3" />Essential
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Inp label="Height (cm)" type="number" placeholder="175" editing={editing} error={errors.height_cm} {...register('height_cm')} />
                      <Inp label="Weight (kg)" type="number" step="0.1" placeholder="70" editing={editing} error={errors.weight_kg} {...register('weight_kg')} />
                      <Inp label="Age" type="number" placeholder="30" editing={editing} error={errors.age} {...register('age')} />
                      <Sel label="Gender" editing={editing} {...register('gender')}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Sel>
                    </div>
                  </div>

                  {/* ── Section 2: Body measurements ── */}
                  <div className="space-y-3">
                    <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Ruler className="w-3 h-3" />Body Measurements
                      <span className="text-food-text-m font-normal normal-case tracking-normal">— unlocks body fat %</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Inp label="Neck (cm)" type="number" step="0.1" placeholder="37" editing={editing} error={errors.neck_cm} {...register('neck_cm')} />
                      <Inp label="Waist (cm)" type="number" step="0.1" placeholder="80" editing={editing} error={errors.waist_cm} {...register('waist_cm')} />
                      <Inp label={`Hip (cm)${watchedGender === 'female' ? ' *' : ''}`} type="number" step="0.1" placeholder="95" editing={editing} error={errors.hip_cm} {...register('hip_cm')} />
                      <Inp label="Wrist (cm)" type="number" step="0.1" placeholder="17" editing={editing} error={errors.wrist_cm} {...register('wrist_cm')} />
                    </div>
                    <p className="text-food-text-m text-[10px]">
                      Measure at the narrowest point (waist), widest point (hip), and around the neck. Hip is required for females.
                    </p>
                  </div>

                  {/* ── Section 3: Lifestyle ── */}
                  <div className="space-y-3">
                    <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />Lifestyle
                    </p>
                    <Sel label="Activity Level" editing={editing} {...register('activity_level')}>
                      {Object.entries(ACTIVITY_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Sel>
                  </div>

                  {/* ── Section 4: Goal ── */}
                  <div className="space-y-3">
                    <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Target className="w-3 h-3" />Goal
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(GOAL_INFO).map(([val, info]) => {
                        const isSelected = watchedGoal === val
                        return (
                          <label
                            key={val}
                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-colors text-center ${
                              !editing ? 'cursor-default opacity-70' : 'cursor-pointer'
                            } ${isSelected
                                ? 'border-food-accent bg-food-accent-d text-food-accent'
                                : 'border-food-border text-food-text-s ' + (editing ? 'hover:border-food-border-h' : '')
                            }`}
                          >
                            <input type="radio" value={val} {...register('goal')} disabled={!editing} className="sr-only" />
                            <info.Icon className="w-4 h-4" />
                            <span className="text-[10px] font-bold leading-none">{info.label.split(' ')[0]}</span>
                          </label>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-2 bg-food-elevated rounded-lg px-3 py-2 text-[11px] text-food-text-m">
                      <goalInfo.Icon className={`w-3 h-3 ${goalInfo.color} shrink-0`} />
                      <span>{goalInfo.adj} · {goalInfo.rate}</span>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Save button — pinned at bottom of sidebar */}
            {editing && !metricsCollapsed && (
              <div className="p-5 border-t border-food-border shrink-0">
                <Button type="submit" disabled={saving} className="w-full justify-center">
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving…' : 'Save & Calculate'}
                </Button>
                {hasData && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="w-full mt-2 text-food-text-m text-xs hover:text-food-text transition-colors text-center"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </form>

          {/* Today's progress (always visible) */}
          {calc && (
            <div className={`${metricsCollapsed ? 'p-3 space-y-2' : 'p-5 space-y-3'} border-t border-food-border`}>
              <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-food-crimson" />
                {metricsCollapsed ? 'Today' : "Today's Progress"}
              </p>

              <div className={`flex justify-between ${metricsCollapsed ? 'text-xs' : 'text-sm'}`}>
                <span className="text-food-text-s">{metricsCollapsed ? 'Used' : 'Consumed'}</span>
                <span className="font-bold text-food-crimson">{consumed} kcal</span>
              </div>

              <div className={`${metricsCollapsed ? 'h-2' : 'h-2.5'} bg-food-elevated rounded-full overflow-hidden`}>
                <div
                  className={`h-full rounded-full transition-all ${consumedPct >= 100 ? 'bg-food-crimson' : 'bg-food-accent'}`}
                  style={{ width: `${consumedPct}%` }}
                />
              </div>

              <div className={`flex justify-between ${metricsCollapsed ? 'text-xs' : 'text-sm'}`}>
                <span className="text-food-text-s">{metricsCollapsed ? 'Left' : 'Remaining'}</span>
                <span className={`font-bold ${remaining === 0 ? 'text-food-crimson' : 'text-food-accent'}`}>
                  {remaining} kcal
                </span>
              </div>

              {!metricsCollapsed && (
                <p className="text-[11px] text-food-text-m text-center">
                  Target: <strong>{calc.dailyTarget} kcal / day</strong>
                </p>
              )}
            </div>
          )}
        </aside>

        {/* ══ RIGHT — statistics ══════════════════════════════════════════ */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {!calc ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-food-elevated flex items-center justify-center">
                <Scale className="w-8 h-8 text-food-text-m opacity-40" />
              </div>
              <div>
                <p className="text-food-text font-bold text-lg">Fill in your metrics</p>
                <p className="text-food-text-m text-sm mt-1 max-w-xs">
                  Enter height, weight, age and gender in the sidebar, then save to see your full body analysis.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Row 1: big hero numbers ── */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'BMR',         value: calc.bmr,         unit: 'kcal', sub: 'Calories at rest',          Icon: Flame,         textCls: 'text-amber-500',  bgCls: 'bg-food-card'     },
                  { label: 'TDEE',        value: calc.tdee,        unit: 'kcal', sub: 'With your activity level',  Icon: Target,        textCls: 'text-blue-400',   bgCls: 'bg-food-card'     },
                  { label: 'Daily target',value: calc.dailyTarget, unit: 'kcal', sub: goalInfo.adj,                Icon: goalInfo.Icon, textCls: goalInfo.color,    bgCls: 'bg-food-accent-d', highlight: true },
                  { label: 'Weekly balance',value: `${calc.weeklyBalance > 0 ? '+' : ''}${calc.weeklyBalance}`, unit: 'kcal', sub: calc.weeklyBalance < 0 ? 'deficit — losing fat' : calc.weeklyBalance > 0 ? 'surplus — gaining mass' : 'balanced', Icon: goalInfo.Icon, textCls: goalInfo.color, bgCls: 'bg-food-elevated' },
                ].map(c => (
                  <div key={c.label} className={`${c.bgCls} border ${c.highlight ? 'border-food-accent/30' : 'border-food-border'} rounded-2xl p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-food-text-m text-[10px] font-bold uppercase tracking-wide">{c.label}</span>
                      <c.Icon className={`w-4 h-4 ${c.textCls}`} />
                    </div>
                    <div className={`text-2xl font-black ${c.highlight ? 'text-food-accent' : 'text-food-text'}`}>
                      {c.value}<span className="text-xs font-semibold text-food-text-m ml-1">{c.unit}</span>
                    </div>
                    <p className="text-food-text-m text-[11px] mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Row 2: body comp + health ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Body composition */}
                <SectionCard title="Body Composition" icon={Scale} iconColor="text-food-accent">
                  <StatRow label="BMI" value={val(calc.bmi)} sub={calc.bmiCat?.label} color={calc.bmiCat?.color} />
                  <StatRow
                    label="Body Fat %"
                    value={calc.bodyFat != null ? `${calc.bodyFat}%` : '—'}
                    sub={calc.bodyFat != null ? calc.bfCat?.label : 'Add neck + waist measurements to unlock'}
                    color={calc.bfCat?.color}
                  />
                  <StatRow
                    label="Lean Body Mass"
                    value={val(calc.lbm, ' kg')}
                    sub="Muscles, bones, organs, water"
                    color={calc.lbm ? 'text-food-accent' : 'text-food-text-m'}
                  />
                  <StatRow
                    label="Fat Mass"
                    value={val(calc.fatMass, ' kg')}
                    sub="Total fat tissue"
                  />
                  <StatRow
                    label="Frame Size"
                    value={calc.frameSize ?? '—'}
                    sub={calc.frameSize ? 'Based on wrist circumference' : 'Add wrist measurement to unlock'}
                  />
                </SectionCard>

                {/* Health markers */}
                <SectionCard title="Health Markers" icon={Heart} iconColor="text-food-crimson">
                  <StatRow
                    label="Ideal Body Weight"
                    value={val(calc.ibw, ' kg')}
                    sub="Devine formula"
                    color="text-food-accent"
                  />
                  <StatRow
                    label="Waist-to-Hip Ratio"
                    value={calc.whr != null ? calc.whr : '—'}
                    sub={calc.whrCat?.label ?? 'Add waist + hip measurements'}
                    color={calc.whrCat?.color}
                  />
                  <StatRow
                    label="Waist-to-Height Ratio"
                    value={calc.whtr != null ? calc.whtr : '—'}
                    sub={calc.whtrCat?.label ?? 'Add waist measurement'}
                    color={calc.whtrCat?.color}
                  />
                  {calc.projection && (
                    <StatRow
                      label="Time to Goal"
                      value={calc.projection.weeks > 0 ? `~${calc.projection.months} months` : calc.projection.label}
                      sub={calc.projection.toChange ? `${calc.projection.toChange} kg to go at ${goalInfo.rate}` : ''}
                      color="text-food-accent"
                    />
                  )}
                  <StatRow
                    label="Daily Water"
                    value={val(calc.waterL, ' L')}
                    sub="Based on weight + activity level"
                    color="text-blue-400"
                  />
                </SectionCard>
              </div>

              {/* ── Macros ── */}
              <div className="bg-food-card border border-food-border rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-food-text font-bold text-sm">Daily Macro Targets</h3>
                  {calc.proteinRange && (
                    <p className="text-food-text-m text-[11px] text-right shrink-0">
                      Protein range for your goal:<br />
                      <strong className="text-food-crimson">{calc.proteinRange.min}–{calc.proteinRange.max}g</strong>
                    </p>
                  )}
                </div>
                <div className="space-y-3.5">
                  <MacroBar label="Protein" pct={30} grams={calc.protein_g} kcal={calc.protein_g * 4} textCls="text-food-crimson" barCls="bg-food-crimson" Icon={Beef} />
                  <MacroBar label="Carbohydrates" pct={45} grams={calc.carbs_g} kcal={calc.carbs_g * 4} textCls="text-amber-500" barCls="bg-amber-500" Icon={Wheat} />
                  <MacroBar label="Fat" pct={25} grams={calc.fat_g} kcal={calc.fat_g * 9} textCls="text-blue-400" barCls="bg-blue-400" Icon={Droplets} />
                </div>
                <div className="pt-2 border-t border-food-border text-[11px] text-food-text-m flex flex-wrap gap-3">
                  <span>4 kcal/g protein</span>
                  <span>4 kcal/g carbohydrates</span>
                  <span>9 kcal/g fat</span>
                </div>
              </div>

              {/* ── BMI scale visual ── */}
              {calc.bmi && (
                <div className="bg-food-card border border-food-border rounded-2xl p-5 space-y-3">
                  <h3 className="text-food-text font-bold text-sm flex items-center gap-2">
                    <Scale className="w-4 h-4 text-food-accent" />BMI Scale
                    <span className={`ml-auto text-base font-black ${calc.bmiCat?.color}`}>{calc.bmi} — {calc.bmiCat?.label}</span>
                  </h3>
                  <div className="relative h-3 rounded-full overflow-hidden flex">
                    <div className="w-[20%] bg-blue-400 rounded-l-full" />
                    <div className="w-[25%] bg-food-accent" />
                    <div className="w-[20%] bg-amber-400" />
                    <div className="w-[17%] bg-orange-500" />
                    <div className="flex-1 bg-food-crimson rounded-r-full" />
                    <div
                      className="absolute top-0 h-full w-1.5 bg-white rounded-full shadow-md"
                      style={{ left: `${Math.min(97, Math.max(2, ((calc.bmi - 13) / 28) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-food-text-m">
                    <span>{'<'}16 Severe</span>
                    <span>18.5 Normal</span>
                    <span>25 Over</span>
                    <span>30 Obese I</span>
                    <span>35+ Obese II</span>
                  </div>
                </div>
              )}

              {/* ── Goal projection ── */}
              {calc.projection && calc.projection.weeks > 0 && (
                <div className="bg-food-accent-d border border-food-accent/20 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-food-accent flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-food-text font-bold">
                      Reach your ideal weight in ~{calc.projection.months} months
                    </p>
                    <p className="text-food-text-s text-sm mt-0.5">
                      {calc.projection.toChange} kg to go · {goalInfo.rate} · staying at {calc.dailyTarget} kcal/day
                    </p>
                  </div>
                </div>
              )}

              {/* ── Meal suggestions ── */}
              <div className="bg-food-card border border-food-border rounded-2xl p-5 space-y-5">
                <div>
                  <h3 className="text-food-text font-bold text-sm">Menu-Based Meal Plan</h3>
                  <p className="text-food-text-m text-xs mt-1">
                    Items from the catalog that fit each meal slot for your <strong className="text-food-accent">{calc.dailyTarget} kcal/day</strong> target.
                  </p>
                </div>
                {catalogLoading ? <LoadingSpinner /> : catalog.length === 0 ? (
                  <p className="text-food-text-m text-sm italic">No food items in catalog yet.</p>
                ) : (
                  <div className="space-y-6">
                    {mealPlan.map(meal => (
                      <div key={meal.key}>
                        <div className="flex items-center gap-2 mb-3">
                          <meal.Icon className="w-4 h-4 text-food-accent" />
                          <span className="text-food-text font-bold text-sm">{meal.label}</span>
                          <span className="ml-auto text-[11px] font-semibold text-food-text-m bg-food-elevated px-2.5 py-1 rounded-full">
                            ≤ {meal.budget} kcal
                          </span>
                        </div>
                        {meal.suggestions.length === 0
                          ? <p className="text-food-text-m text-xs italic pl-6">No catalog items fit this slot's calorie budget.</p>
                          : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {meal.suggestions.map(item => <SuggestionCard key={item.id} item={item} />)}
                            </div>
                          )
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Algorithm note ── */}
              <div className="bg-food-elevated rounded-xl p-4 text-xs text-food-text-m space-y-1.5">
                <p className="font-semibold text-food-text-s">Algorithms used</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li><strong>BMR</strong> — Mifflin-St Jeor (1990), most validated for non-athlete adults</li>
                  <li><strong>Body Fat %</strong> — US Navy circumference method</li>
                  <li><strong>Ideal Weight</strong> — Devine formula (1974)</li>
                  <li><strong>WHR / WHtR</strong> — WHO cardiovascular risk thresholds</li>
                  <li><strong>Frame size</strong> — height-to-wrist ratio (Osteoporosis Society)</li>
                  <li><strong>Protein range</strong> — based on lean body mass and goal (ISSN guidelines)</li>
                  <li><strong>Hydration</strong> — 35 ml/kg body weight + activity correction</li>
                </ul>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
