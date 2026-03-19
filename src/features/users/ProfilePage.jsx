import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Flame, Scale } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useBodyCalc } from '../../hooks/useBodyCalc'
import Button from '../../components/ui/Button'

const profileSchema = z.object({
  username: z.string().min(2),
  nickname: z.string().optional(),
  department: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

const bodySchema = z.object({
  height_cm: z.coerce.number().int().min(50).max(300).nullable(),
  weight_kg: z.coerce.number().min(20).max(500).nullable(),
  age: z.coerce.number().int().min(10).max(120).nullable(),
  gender: z.enum(['male', 'female', 'other']).nullable(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).nullable(),
  goal: z.enum(['lose', 'maintain', 'gain']).nullable(),
})

const inputCls = "w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
const labelCls = "text-food-text-m text-xs mb-1 block"

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const calc = useBodyCalc(profile)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: profile ?? {} })
  const bodyForm = useForm({ resolver: zodResolver(bodySchema), defaultValues: profile ?? {} })

  async function handleProfileSave(values) {
    setSaving(true)
    const { error } = await supabase.from('users').update(values).eq('id', profile.id)
    if (!error) await refreshProfile()
    setSaving(false)
  }

  async function handleBodySave(values) {
    setSaving(true)
    const { error } = await supabase.from('users').update(values).eq('id', profile.id)
    if (!error) await refreshProfile()
    setSaving(false)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    const path = `${profile.id}/avatar.${file.name.split('.').pop()}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', profile.id)
      await refreshProfile()
    }
    setUploading(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-food-text">Profile</h1>

      {/* Avatar */}
      <div className="bg-food-card border border-food-border rounded-xl p-5 flex items-center gap-5">
        <div className="relative">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} className="w-16 h-16 rounded-full object-cover border-2 border-food-border" />
            : <div className="w-16 h-16 rounded-full bg-food-accent-d flex items-center justify-center text-food-accent text-2xl font-bold">{profile?.username?.[0]?.toUpperCase()}</div>
          }
          <label className="absolute bottom-0 right-0 w-6 h-6 bg-food-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-food-accent-h transition-colors">
            <Camera className="w-3 h-3 text-white" />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>
        <div>
          <p className="text-food-text font-semibold">{profile?.username}</p>
          <p className="text-food-text-m text-sm">{profile?.email}</p>
          <p className="text-food-text-m text-xs">{profile?.department}</p>
          {uploading && <p className="text-food-text-m text-xs mt-1">Uploading…</p>}
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-food-card border border-food-border rounded-xl p-5">
        <h2 className="text-food-text font-semibold mb-4">Personal Info</h2>
        <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Username</label><input {...profileForm.register('username')} className={inputCls} /></div>
          <div><label className={labelCls}>Nickname</label><input {...profileForm.register('nickname')} className={inputCls} /></div>
          <div className="col-span-2"><label className={labelCls}>Department</label><input {...profileForm.register('department')} className={inputCls} /></div>
          <div className="col-span-2 flex justify-end"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></div>
        </form>
      </div>

      {/* Body calculator form */}
      <div className="bg-food-card border border-food-border rounded-xl p-5">
        <h2 className="text-food-text font-semibold mb-4 flex items-center gap-2"><Scale className="w-4 h-4 text-food-accent" />Body Calculator</h2>
        <form onSubmit={bodyForm.handleSubmit(handleBodySave)} className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Height (cm)</label><input {...bodyForm.register('height_cm')} type="number" className={inputCls} /></div>
          <div><label className={labelCls}>Weight (kg)</label><input {...bodyForm.register('weight_kg')} type="number" step="0.1" className={inputCls} /></div>
          <div><label className={labelCls}>Age</label><input {...bodyForm.register('age')} type="number" className={inputCls} /></div>
          <div>
            <label className={labelCls}>Gender</label>
            <select {...bodyForm.register('gender')} className={inputCls}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Activity Level</label>
            <select {...bodyForm.register('activity_level')} className={inputCls}>
              <option value="sedentary">Sedentary (desk job)</option>
              <option value="light">Light (1-3x/week)</option>
              <option value="moderate">Moderate (3-5x/week)</option>
              <option value="active">Active (6-7x/week)</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Goal</label>
            <select {...bodyForm.register('goal')} className={inputCls}>
              <option value="lose">Lose weight</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain</option>
            </select>
          </div>
          <div className="col-span-2 flex justify-end"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></div>
        </form>
      </div>

      {/* Results */}
      {calc && (
        <div className="bg-food-card border border-food-border rounded-xl p-5">
          <h2 className="text-food-text font-semibold mb-4 flex items-center gap-2"><Flame className="w-4 h-4 text-food-accent" />Your Targets</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'BMR', value: `${calc.bmr} kcal` },
              { label: 'TDEE', value: `${calc.tdee} kcal` },
              { label: 'Daily Target', value: `${calc.dailyTarget} kcal`, accent: true },
              { label: 'Protein', value: `${calc.protein_g}g` },
              { label: 'Carbs', value: `${calc.carbs_g}g` },
              { label: 'Fat', value: `${calc.fat_g}g` },
            ].map(({ label, value, accent }) => (
              <div key={label} className="bg-food-elevated rounded-lg p-3">
                <div className="text-food-text-m text-xs mb-1">{label}</div>
                <div className={`text-xl font-bold ${accent ? 'text-food-accent' : 'text-food-text'}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
