import { useMemo } from 'react'
import {
  calcBMR, calcTDEE, calcDailyTarget, calcMacros,
  calcBMI, bmiCategory,
  calcBodyFat, bodyFatCategory,
  calcLBM, calcFatMass,
  calcIBW, calcWHR, whrCategory, calcWHtR, whtrCategory,
  calcFrameSize, calcProteinRange, calcWater, calcGoalProjection,
} from '../utils/bodyCalc'

export function useBodyCalc(profile) {
  return useMemo(() => {
    if (!profile?.height_cm || !profile?.weight_kg || !profile?.age || !profile?.gender) {
      return null
    }

    const p = profile

    // Energy
    const bmr         = calcBMR(p)
    const tdee        = calcTDEE(bmr, p.activity_level ?? 'sedentary')
    const dailyTarget = calcDailyTarget(tdee, p.goal ?? 'maintain')
    const macros      = calcMacros(dailyTarget)

    // Body composition
    const bmi      = calcBMI(p)
    const bmiCat   = bmiCategory(bmi)
    const bodyFat  = calcBodyFat(p)
    const bfCat    = bodyFatCategory(bodyFat, p.gender)
    const lbm      = calcLBM(p.weight_kg, bodyFat)
    const fatMass  = calcFatMass(p.weight_kg, bodyFat)

    // Health markers
    const ibw         = calcIBW(p)
    const whr         = calcWHR(p)
    const whrCat      = whrCategory(whr, p.gender)
    const whtr        = calcWHtR(p)
    const whtrCat     = whtrCategory(whtr)
    const frameSize   = calcFrameSize(p)

    // Protein range (uses lean body mass if available, else estimates at 82%)
    const proteinRange = calcProteinRange(lbm ?? p.weight_kg * 0.82, p.goal ?? 'maintain')

    // Hydration
    const waterL = calcWater(p.weight_kg, p.activity_level ?? 'sedentary')

    // Goal projection
    const projection = calcGoalProjection(p.weight_kg, ibw, p.goal ?? 'maintain')

    return {
      // Energy
      bmr, tdee, dailyTarget,
      ...macros,
      weeklyBalance: (dailyTarget - tdee) * 7,

      // Body composition
      bmi, bmiCat,
      bodyFat, bfCat,
      lbm, fatMass,

      // Health
      ibw, whr, whrCat, whtr, whtrCat, frameSize,

      // Protein
      proteinRange,

      // Hydration
      waterL,

      // Projection
      projection,
    }
  }, [
    profile?.height_cm, profile?.weight_kg, profile?.age, profile?.gender,
    profile?.activity_level, profile?.goal,
    profile?.neck_cm, profile?.waist_cm, profile?.hip_cm, profile?.wrist_cm,
  ])
}
