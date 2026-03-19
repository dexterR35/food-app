import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

const profileSchema = z.object({
  username: z.string().min(2),
  nickname: z.string().optional(),
  department: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

const inputCls = "w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
const labelCls = "text-food-text-m text-xs mb-1 block"

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: profile ?? {} })

  async function handleProfileSave(values) {
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

      {/* Body calculator link */}
      <div className="bg-food-elevated border border-food-border rounded-xl p-4 flex items-center justify-between">
        <p className="text-food-text-s text-sm">Body calculator, calorie targets and meal suggestions have moved to their own page.</p>
        <a href="/body" className="text-food-accent text-sm font-semibold hover:underline whitespace-nowrap ml-4">Open →</a>
      </div>
    </div>
  )
}
