import { calcBMR, calcTDEE, calcDailyTarget, calcMacros } from '../bodyCalc'

describe('calcBMR', () => {
  it('calculates male BMR', () => {
    // 70kg, 175cm, 30yo male: (10*70)+(6.25*175)-(5*30)+5 = 700+1093.75-150+5 = 1648.75
    expect(calcBMR({ weight_kg: 70, height_cm: 175, age: 30, gender: 'male' })).toBeCloseTo(1648.75)
  })
  it('calculates female BMR', () => {
    // 60kg, 165cm, 25yo female: (10*60)+(6.25*165)-(5*25)-161 = 600+1031.25-125-161 = 1345.25
    expect(calcBMR({ weight_kg: 60, height_cm: 165, age: 25, gender: 'female' })).toBeCloseTo(1345.25)
  })
  it('calculates other BMR as average', () => {
    const male = calcBMR({ weight_kg: 70, height_cm: 175, age: 30, gender: 'male' })
    const female = calcBMR({ weight_kg: 70, height_cm: 175, age: 30, gender: 'female' })
    const other = calcBMR({ weight_kg: 70, height_cm: 175, age: 30, gender: 'other' })
    expect(other).toBeCloseTo((male + female) / 2)
  })
  it('returns null for incomplete profile', () => {
    expect(calcBMR({ weight_kg: null, height_cm: 175, age: 30, gender: 'male' })).toBeNull()
  })
})

describe('calcTDEE', () => {
  it('applies sedentary multiplier', () => {
    expect(calcTDEE(1600, 'sedentary')).toBeCloseTo(1920)
  })
  it('applies moderate multiplier', () => {
    expect(calcTDEE(1600, 'moderate')).toBeCloseTo(2480)
  })
})

describe('calcDailyTarget', () => {
  it('reduces for lose goal', () => { expect(calcDailyTarget(2000, 'lose')).toBe(1500) })
  it('keeps same for maintain', () => { expect(calcDailyTarget(2000, 'maintain')).toBe(2000) })
  it('increases for gain', () => { expect(calcDailyTarget(2000, 'gain')).toBe(2300) })
})

describe('calcMacros', () => {
  it('returns protein/carbs/fat in grams', () => {
    const m = calcMacros(2000)
    expect(m.protein_g).toBe(Math.round((2000 * 0.30) / 4))
    expect(m.fat_g).toBe(Math.round((2000 * 0.25) / 9))
    expect(m.carbs_g).toBe(Math.round((2000 * 0.45) / 4))
  })
})
