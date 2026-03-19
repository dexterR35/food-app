import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  Scale, Flame, Target, TrendingDown, TrendingUp, Minus,
  Sun, Coffee, Moon, Apple, Save, Beef, Wheat, Droplets,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useBodyCalc } from '../../hooks/useBodyCalc'
import { useBoard } from '../board/hooks/useBoard'
import { useMyOrder } from '../board/hooks/useSubmitOrder'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

/* ─── Food items query (catalog, for suggestions) ────────────────────────── */
function useCatalog() {
  return useQuery({
    queryKey: ['catalog-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_items')
        .select('id, name, calories, price, category, image_url, description')
        .eq('is_active', true)
        .order('calories', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

/* ─── Schemas & constants ─────────────────────────────────────────────────── */
const bodySchema = z.object({
  height_cm:      z.coerce.number().int().min(50).max(300),
  weight_kg:      z.coerce.number().min(20).max(500),
  age:            z.coerce.number().int().min(10).max(120),
  gender:         z.enum(['male', 'female', 'other']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal:           z.enum(['lose', 'maintain', 'gain']),
})

const ACTIVITY_LABELS = {
  sedentary:  'Sedentary — desk job, no exercise',
  light:      'Light — 1–3 days / week',
  moderate:   'Moderate — 3–5 days / week',
  active:     'Active — 6–7 days / week',
  very_active:'Very active — athlete / physical job',
}

const GOAL_INFO = {
  lose:     { label: 'Lose',     Icon: TrendingDown, color: 'text-food-crimson', adj: '−500 kcal/day', rate: '≈ 0.5 kg/week'   },
  maintain: { label: 'Maintain', Icon: Minus,        color: 'text-food-text-m',  adj: '±0 kcal/day',  rate: 'Hold weight'       },
  gain:     { label: 'Gain',     Icon: TrendingUp,   color: 'text-food-accent',  adj: '+300 kcal/day', rate: '≈ 0.25 kg/week'  },
}

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', Icon: Sun,    pct: 0.25 },
  { key: 'lunch',     label: 'Lunch',     Icon: Coffee, pct: 0.35 },
  { key: 'dinner',    label: 'Dinner',    Icon: Moon,   pct: 0.30 },
  { key: 'snack',     label: 'Snack',     Icon: Apple,  pct: 0.10 },
]

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function MacroBar({ label, grams, kcal, textCls, barCls, Icon }) {
  const maxKcal = 1000
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1.5 font-medium ${textCls}`}>
          <Icon className="w-3.5 h-3.5" />{label}
        </span>
        <span className="text-food-text font-bold">
          {grams}g <span className="text-food-text-m font-normal">({kcal} kcal)</span>
        </span>
      </div>
      <div className="h-2 bg-food-elevated rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barCls}`}
          style={{ width: `${Math.min(100, (kcal / maxKcal) * 100)}%` }}
        />
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
        {item.description && (
          <p className="text-food-text-m text-xs mt-0.5 line-clamp-1">{item.description}</p>
        )}
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

function StatCard({ label, value, unit, sub, Icon, textCls, bgCls, highlight }) {
  return (
    <div className={`${bgCls} border ${highlight ? 'border-food-accent/30' : 'border-food-border'} rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-food-text-m text-xs font-semibold uppercase tracking-wide">{label}</span>
        <Icon className={`w-4 h-4 ${textCls}`} />
      </div>
      <div className={`text-2xl font-black ${highlight ? 'text-food-accent' : 'text-food-text'}`}>
        {value}{unit && <span className="text-xs font-semibold text-food-text-m ml-1">{unit}</span>}
      </div>
      <p className="text-food-text-m text-[11px] mt-1">{sub}</p>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
const inputCls = 'w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors'
const labelCls = 'text-food-text-m text-xs font-medium mb-1 block'

export default function BodyCalculatorPage() {
  const { profile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const { data: board }      = useBoard()
  const { data: todayOrder } = useMyOrder(board?.id)
  const { data: catalog = [], isLoading: catalogLoading } = useCatalog()

  // Calculations use the saved profile — live-updates after Save
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
    },
  })

  const watchedGoal = watch('goal')
  const goalInfo = GOAL_INFO[watchedGoal] ?? GOAL_INFO.maintain

  // BMI
  const bmi = profile?.weight_kg && profile?.height_cm
    ? +(profile.weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1)
    : null
  const bmiCategory = bmi == null ? null
    : bmi < 18.5 ? { label: 'Underweight', color: 'text-blue-400' }
    : bmi < 25   ? { label: 'Normal',      color: 'text-food-accent' }
    : bmi < 30   ? { label: 'Overweight',  color: 'text-amber-500' }
    :               { label: 'Obese',       color: 'text-food-crimson' }

  // Today's calories
  const consumedToday = todayOrder?.total_calories ?? 0
  const remaining     = calc ? Math.max(0, calc.dailyTarget - consumedToday) : null
  const consumedPct   = calc ? Math.min(100, (consumedToday / calc.dailyTarget) * 100) : 0

  // Meal plan suggestions — best-fit items per meal slot
  const mealPlan = useMemo(() => {
    if (!calc || !catalog.length) return []
    return MEALS.map(meal => {
      const budget     = Math.round(calc.dailyTarget * meal.pct)
      const candidates = catalog
        .filter(i => i.calories > 0 && i.calories <= budget)
        .sort((a, b) => b.calories - a.calories) // closest to budget first
      return { ...meal, budget, suggestions: candidates.slice(0, 2) }
    })
  }, [calc, catalog])

  async function onSubmit(values) {
    setSaving(true)
    const { error } = await supabase.from('users').update(values).eq('id', profile.id)
    if (!error) {
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  // Stat card rows
  const statCards = calc ? [
    {
      label: 'BMR',         value: calc.bmr,  unit: 'kcal',
      sub: 'Calories your body burns at complete rest (Mifflin-St Jeor)',
      Icon: Flame, textCls: 'text-amber-500', bgCls: 'bg-food-card',
    },
    {
      label: 'TDEE',        value: calc.tdee, unit: 'kcal',
      sub: 'Total Daily Energy Expenditure with your activity level',
      Icon: Target, textCls: 'text-blue-400', bgCls: 'bg-food-card',
    },
    {
      label: 'Daily Target', value: calc.dailyTarget, unit: 'kcal',
      sub: goalInfo.adj + ' · ' + goalInfo.rate,
      Icon: goalInfo.Icon, textCls: goalInfo.color, bgCls: 'bg-food-accent-d', highlight: true,
    },
    {
      label: 'Est. Change',
      value: profile?.goal === 'lose' ? '−0.5 kg' : profile?.goal === 'gain' ? '+0.25 kg' : '±0 kg',
      unit: '',
      sub: 'per week at this calorie target',
      Icon: goalInfo.Icon, textCls: goalInfo.color, bgCls: 'bg-food-elevated',
    },
  ] : []

  return (
    <div className="space-y-0 -m-6 flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>

      {/* Page header */}
      <div className="px-6 py-4 border-b border-food-border bg-food-card flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-food-accent-d flex items-center justify-center">
          <Scale className="w-5 h-5 text-food-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-food-text">Body Calculator</h1>
          <p className="text-food-text-m text-xs">Mifflin-St Jeor · personalized daily targets · menu-based meal suggestions</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT sidebar: form ─────────────────────────────────────────── */}
        <aside className="w-80 shrink-0 border-r border-food-border bg-food-card flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-food-text font-semibold text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-food-accent" />My Metrics
              </p>

              {/* Measurements */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Height (cm)</label>
                  <input {...register('height_cm')} type="number" placeholder="175" className={inputCls} />
                  {errors.height_cm && <p className="text-food-crimson text-[10px] mt-0.5">50–300 cm</p>}
                </div>
                <div>
                  <label className={labelCls}>Weight (kg)</label>
                  <input {...register('weight_kg')} type="number" step="0.1" placeholder="70" className={inputCls} />
                  {errors.weight_kg && <p className="text-food-crimson text-[10px] mt-0.5">20–500 kg</p>}
                </div>
                <div>
                  <label className={labelCls}>Age</label>
                  <input {...register('age')} type="number" placeholder="30" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select {...register('gender')} className={inputCls}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / prefer not</option>
                  </select>
                </div>
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

              {/* Goal — radio cards */}
              <div>
                <label className={labelCls}>Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(GOAL_INFO).map(([val, info]) => {
                    const isSelected = watchedGoal === val
                    return (
                      <label
                        key={val}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border cursor-pointer transition-colors text-center ${
                          isSelected
                            ? 'border-food-accent bg-food-accent-d text-food-accent'
                            : 'border-food-border hover:border-food-border-h text-food-text-s hover:text-food-text'
                        }`}
                      >
                        <input type="radio" value={val} {...register('goal')} className="sr-only" />
                        <info.Icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold leading-none">{info.label}</span>
                      </label>
                    )
                  })}
                </div>
                {watchedGoal && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-food-text-m bg-food-elevated rounded-lg px-3 py-2">
                    <goalInfo.Icon className={`w-3 h-3 ${goalInfo.color} shrink-0`} />
                    <span>{goalInfo.adj} · {goalInfo.rate}</span>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={saving} className="w-full justify-center">
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
              </Button>
            </form>

            {/* BMI gauge */}
            {bmi !== null && (
              <div className="bg-food-elevated rounded-xl p-4 space-y-2">
                <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest">BMI</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-food-text">{bmi}</span>
                  <span className={`text-sm font-bold pb-0.5 ${bmiCategory?.color}`}>{bmiCategory?.label}</span>
                </div>
                {/* Colored scale bar */}
                <div className="relative h-2.5 rounded-full overflow-hidden flex">
                  <div className="w-[28%] bg-blue-400 rounded-l-full" />
                  <div className="w-[26%] bg-food-accent" />
                  <div className="w-[20%] bg-amber-400" />
                  <div className="flex-1 bg-food-crimson rounded-r-full" />
                  {/* needle */}
                  <div
                    className="absolute top-0 h-full w-1 bg-white rounded-full shadow-md"
                    style={{ left: `${Math.min(96, Math.max(2, ((bmi - 15) / 25) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-food-text-m">
                  <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                </div>
              </div>
            )}

            {/* Today's progress */}
            {calc && (
              <div className="bg-food-elevated rounded-xl p-4 space-y-3">
                <p className="text-food-text-m text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-food-crimson" />Today's Progress
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-food-text-s">Consumed</span>
                  <span className="font-bold text-food-crimson">{consumedToday} kcal</span>
                </div>
                <div className="h-2.5 bg-food-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${consumedPct >= 100 ? 'bg-food-crimson' : 'bg-food-accent'}`}
                    style={{ width: `${consumedPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-food-text-s">Remaining</span>
                  <span className={`font-bold ${remaining === 0 ? 'text-food-crimson' : 'text-food-accent'}`}>
                    {remaining} kcal
                  </span>
                </div>
                <p className="text-[11px] text-food-text-m text-center border-t border-food-border pt-2">
                  Target: <strong>{calc.dailyTarget} kcal / day</strong>
                </p>
              </div>
            )}

          </div>
        </aside>

        {/* ── RIGHT: results + suggestions ──────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {!calc ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-food-elevated flex items-center justify-center">
                <Scale className="w-8 h-8 text-food-text-m opacity-50" />
              </div>
              <div>
                <p className="text-food-text font-bold text-lg">Fill in your metrics</p>
                <p className="text-food-text-m text-sm max-w-xs mt-1">
                  Enter height, weight, age, gender and goal in the sidebar to get your personalised nutrition targets.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Stat cards ── */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map(c => <StatCard key={c.label} {...c} />)}
              </div>

              {/* ── Macros ── */}
              <div className="bg-food-card border border-food-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-food-text font-bold text-sm">Daily Macro Targets</h2>
                  <span className="text-food-text-m text-[11px]">
                    Protein 30% · Carbs 45% · Fat 25%
                  </span>
                </div>
                <div className="space-y-3.5">
                  <MacroBar
                    label="Protein"
                    grams={calc.protein_g}
                    kcal={calc.protein_g * 4}
                    textCls="text-food-crimson"
                    barCls="bg-food-crimson"
                    Icon={Beef}
                  />
                  <MacroBar
                    label="Carbohydrates"
                    grams={calc.carbs_g}
                    kcal={calc.carbs_g * 4}
                    textCls="text-amber-500"
                    barCls="bg-amber-500"
                    Icon={Wheat}
                  />
                  <MacroBar
                    label="Fat"
                    grams={calc.fat_g}
                    kcal={calc.fat_g * 9}
                    textCls="text-blue-400"
                    barCls="bg-blue-400"
                    Icon={Droplets}
                  />
                </div>
                <p className="text-[11px] text-food-text-m border-t border-food-border pt-3">
                  4 kcal/g protein · 4 kcal/g carbohydrates · 9 kcal/g fat
                </p>
              </div>

              {/* ── Menu-based meal suggestions ── */}
              <div className="bg-food-card border border-food-border rounded-2xl p-5 space-y-5">
                <div>
                  <h2 className="text-food-text font-bold text-sm">Menu-Based Meal Plan</h2>
                  <p className="text-food-text-m text-xs mt-1">
                    Items from your app's food catalog that best fit each meal slot for your
                    <strong className="text-food-accent"> {calc.dailyTarget} kcal/day</strong> target.
                  </p>
                </div>

                {catalogLoading ? (
                  <LoadingSpinner />
                ) : catalog.length === 0 ? (
                  <p className="text-food-text-m text-sm italic">No food items in catalog yet.</p>
                ) : (
                  <div className="space-y-7">
                    {mealPlan.map(meal => (
                      <div key={meal.key}>
                        <div className="flex items-center gap-2 mb-3">
                          <meal.Icon className="w-4 h-4 text-food-accent" />
                          <span className="text-food-text font-bold text-sm">{meal.label}</span>
                          <span className="ml-auto text-[11px] font-semibold text-food-text-m bg-food-elevated px-2.5 py-1 rounded-full">
                            ≤ {meal.budget} kcal
                          </span>
                        </div>
                        {meal.suggestions.length === 0 ? (
                          <p className="text-food-text-m text-xs italic pl-6">
                            No catalog items fit this slot's calorie budget.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {meal.suggestions.map(item => (
                              <SuggestionCard key={item.id} item={item} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Algorithm note ── */}
              <div className="bg-food-elevated rounded-xl p-4 space-y-1 text-xs text-food-text-m">
                <p className="font-semibold text-food-text-s">How it's calculated</p>
                <p>
                  BMR uses the <strong>Mifflin-St Jeor equation</strong> — the most validated formula
                  for non-athlete adults. TDEE multiplies BMR by your activity factor (1.2–1.9).
                  Goal adjusts by −500 / 0 / +300 kcal/day targeting a safe, sustainable rate of change.
                </p>
                <p>Meal slots: Breakfast 25% · Lunch 35% · Dinner 30% · Snack 10% of daily target.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
