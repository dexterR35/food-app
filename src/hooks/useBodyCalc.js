import { useMemo } from 'react'
import { calcBMR, calcTDEE, calcDailyTarget, calcMacros } from '../utils/bodyCalc'

export function useBodyCalc(profile) {
  return useMemo(() => {
    if (!profile?.height_cm || !profile?.weight_kg || !profile?.age || !profile?.gender) {
      return null
    }
    const bmr = calcBMR(profile)
    const tdee = calcTDEE(bmr, profile.activity_level ?? 'sedentary')
    const dailyTarget = calcDailyTarget(tdee, profile.goal ?? 'maintain')
    const macros = calcMacros(dailyTarget)
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), dailyTarget, ...macros }
  }, [profile?.height_cm, profile?.weight_kg, profile?.age, profile?.gender, profile?.activity_level, profile?.goal])
}
