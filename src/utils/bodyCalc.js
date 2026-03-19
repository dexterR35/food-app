const ACTIVITY = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
}
const GOAL_ADJUST = { lose: -500, maintain: 0, gain: 300 }

export function calcBMR({ weight_kg, height_cm, age, gender }) {
  if (!weight_kg || !height_cm || !age || !gender) return null
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  if (gender === 'male') return base + 5
  if (gender === 'female') return base - 161
  return base - 78 // other: midpoint of +5 and -161
}

export function calcTDEE(bmr, activityLevel) {
  return bmr * (ACTIVITY[activityLevel] ?? 1.2)
}

export function calcDailyTarget(tdee, goal) {
  return Math.round(tdee + (GOAL_ADJUST[goal] ?? 0))
}

export function calcMacros(dailyTarget) {
  return {
    protein_g: Math.round((dailyTarget * 0.30) / 4),
    fat_g:     Math.round((dailyTarget * 0.25) / 9),
    carbs_g:   Math.round((dailyTarget * 0.45) / 4),
  }
}
