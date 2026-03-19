/* ─── Activity & goal constants ─────────────────────────────────────────── */
const ACTIVITY = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
}
const GOAL_ADJUST = { lose: -500, maintain: 0, gain: 300 }

/* ─── Energy ─────────────────────────────────────────────────────────────── */

// Mifflin-St Jeor — most validated for general population
export function calcBMR({ weight_kg, height_cm, age, gender }) {
  if (!weight_kg || !height_cm || !age || !gender) return null
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  if (gender === 'male')   return Math.round(base + 5)
  if (gender === 'female') return Math.round(base - 161)
  return Math.round(base - 78) // other: midpoint
}

export function calcTDEE(bmr, activityLevel) {
  return Math.round(bmr * (ACTIVITY[activityLevel] ?? 1.2))
}

export function calcDailyTarget(tdee, goal) {
  return Math.round(tdee + (GOAL_ADJUST[goal] ?? 0))
}

// Standard 30/45/25 macro split
export function calcMacros(dailyTarget) {
  return {
    protein_g: Math.round((dailyTarget * 0.30) / 4),
    carbs_g:   Math.round((dailyTarget * 0.45) / 4),
    fat_g:     Math.round((dailyTarget * 0.25) / 9),
  }
}

/* ─── Body composition ──────────────────────────────────────────────────── */

// BMI
export function calcBMI({ weight_kg, height_cm }) {
  if (!weight_kg || !height_cm) return null
  return +(weight_kg / ((height_cm / 100) ** 2)).toFixed(1)
}

export function bmiCategory(bmi) {
  if (bmi == null) return null
  if (bmi < 16.0) return { label: 'Severely underweight', risk: 'high',   color: 'text-blue-500'    }
  if (bmi < 18.5) return { label: 'Underweight',          risk: 'low',    color: 'text-blue-400'    }
  if (bmi < 25.0) return { label: 'Normal weight',        risk: 'none',   color: 'text-food-accent' }
  if (bmi < 30.0) return { label: 'Overweight',           risk: 'medium', color: 'text-amber-500'   }
  if (bmi < 35.0) return { label: 'Obese (class I)',      risk: 'high',   color: 'text-food-crimson' }
  return              { label: 'Obese (class II+)',    risk: 'very high', color: 'text-food-crimson' }
}

// US Navy body-fat formula — most practical tape-based method
export function calcBodyFat({ weight_kg, height_cm, neck_cm, waist_cm, hip_cm, gender }) {
  if (!height_cm || !neck_cm || !waist_cm) return null
  if (waist_cm <= neck_cm) return null // physically invalid
  if (gender === 'male') {
    const pct = 86.010 * Math.log10(waist_cm - neck_cm) - 70.041 * Math.log10(height_cm) + 36.76
    return +Math.max(3, pct).toFixed(1)
  }
  if (gender === 'female') {
    if (!hip_cm) return null
    if (waist_cm + hip_cm <= neck_cm) return null
    const pct = 163.205 * Math.log10(waist_cm + hip_cm - neck_cm) - 97.684 * Math.log10(height_cm) - 78.387
    return +Math.max(10, pct).toFixed(1)
  }
  return null // gender 'other' — formula not validated
}

export function bodyFatCategory(pct, gender) {
  if (pct == null) return null
  if (gender === 'male') {
    if (pct < 6)  return { label: 'Essential fat',  color: 'text-blue-400'    }
    if (pct < 14) return { label: 'Athletic',        color: 'text-food-accent' }
    if (pct < 18) return { label: 'Fitness',         color: 'text-food-accent' }
    if (pct < 25) return { label: 'Average',         color: 'text-amber-500'   }
    return             { label: 'Obese',             color: 'text-food-crimson' }
  }
  // female
  if (pct < 14) return { label: 'Essential fat',  color: 'text-blue-400'    }
  if (pct < 21) return { label: 'Athletic',        color: 'text-food-accent' }
  if (pct < 25) return { label: 'Fitness',         color: 'text-food-accent' }
  if (pct < 32) return { label: 'Average',         color: 'text-amber-500'   }
  return             { label: 'Obese',             color: 'text-food-crimson' }
}

// Lean Body Mass & Fat Mass
export function calcLBM(weight_kg, bodyFatPct) {
  if (!weight_kg || bodyFatPct == null) return null
  return +(weight_kg * (1 - bodyFatPct / 100)).toFixed(1)
}

export function calcFatMass(weight_kg, bodyFatPct) {
  if (!weight_kg || bodyFatPct == null) return null
  return +(weight_kg * (bodyFatPct / 100)).toFixed(1)
}

/* ─── Health markers ─────────────────────────────────────────────────────── */

// Devine formula — Ideal Body Weight
export function calcIBW({ height_cm, gender }) {
  if (!height_cm || !gender) return null
  const inches = height_cm / 2.54
  if (inches < 60) return null // formula only valid ≥ 60"
  const base = gender === 'female' ? 45.5 : 50
  return +(base + 2.3 * (inches - 60)).toFixed(1)
}

// Waist-to-Hip Ratio
export function calcWHR({ waist_cm, hip_cm }) {
  if (!waist_cm || !hip_cm) return null
  return +(waist_cm / hip_cm).toFixed(2)
}

export function whrCategory(whr, gender) {
  if (whr == null) return null
  if (gender === 'male') {
    if (whr < 0.90) return { label: 'Low risk',     color: 'text-food-accent' }
    if (whr < 1.00) return { label: 'Moderate risk', color: 'text-amber-500'  }
    return               { label: 'High risk',      color: 'text-food-crimson' }
  }
  if (whr < 0.80) return { label: 'Low risk',     color: 'text-food-accent' }
  if (whr < 0.90) return { label: 'Moderate risk', color: 'text-amber-500'  }
  return               { label: 'High risk',      color: 'text-food-crimson' }
}

// Waist-to-Height Ratio — single threshold for all genders
export function calcWHtR({ waist_cm, height_cm }) {
  if (!waist_cm || !height_cm) return null
  return +(waist_cm / height_cm).toFixed(2)
}

export function whtrCategory(whtr) {
  if (whtr == null) return null
  if (whtr < 0.40) return { label: 'Slim',          color: 'text-blue-400'    }
  if (whtr < 0.50) return { label: 'Healthy',        color: 'text-food-accent' }
  if (whtr < 0.60) return { label: 'Overweight',     color: 'text-amber-500'   }
  return               { label: 'Centrally obese', color: 'text-food-crimson' }
}

// Frame size from wrist circumference
export function calcFrameSize({ wrist_cm, height_cm, gender }) {
  if (!wrist_cm || !height_cm) return null
  const r = height_cm / wrist_cm
  if (gender === 'male') {
    if (r > 10.4) return 'Small'
    if (r > 9.6)  return 'Medium'
    return 'Large'
  }
  // female
  if (r > 11.0) return 'Small'
  if (r > 10.1) return 'Medium'
  return 'Large'
}

/* ─── Protein targeting ─────────────────────────────────────────────────── */
// Goal-specific protein ranges (g per kg lean body mass)
export function calcProteinRange(lbm, goal) {
  if (!lbm) return null
  const ranges = { lose: [1.4, 1.8], maintain: [1.0, 1.4], gain: [1.8, 2.4] }
  const [lo, hi] = ranges[goal] ?? ranges.maintain
  return { min: Math.round(lbm * lo), max: Math.round(lbm * hi) }
}

/* ─── Hydration ─────────────────────────────────────────────────────────── */
export function calcWater(weight_kg, activityLevel) {
  if (!weight_kg) return null
  const extra = { sedentary: 0, light: 200, moderate: 400, active: 600, very_active: 800 }
  const ml = weight_kg * 35 + (extra[activityLevel] ?? 0)
  return +(ml / 1000).toFixed(1) // in litres
}

/* ─── Goal projection ────────────────────────────────────────────────────── */
export function calcGoalProjection(weight_kg, ibw, goal) {
  if (!weight_kg || !ibw || goal === 'maintain') return null
  const diff = +(weight_kg - ibw).toFixed(1)
  if (Math.abs(diff) < 0.5) return { diff: 0, weeks: 0, label: 'Already at ideal weight!' }
  const weeklyRate = goal === 'lose' ? 0.5 : 0.25
  const toChange   = goal === 'lose' ? Math.max(0, diff) : Math.max(0, -diff)
  if (toChange < 0.5) return { diff, weeks: 0, label: 'Nearly there!' }
  const weeks = Math.ceil(toChange / weeklyRate)
  return { diff, toChange, weeks, months: Math.round(weeks / 4.33) }
}
