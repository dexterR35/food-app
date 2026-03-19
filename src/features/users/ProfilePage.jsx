import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

const profileSchema = z.object({
  username:   z.string().min(2, 'Username must be at least 2 characters'),
  nickname:   z.string().optional(),
  department: z.string().optional(),
})

const inputCls = "w-full bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
const labelCls = "text-food-text-m text-xs mb-1 block"
const valueCls = "text-food-text text-sm py-2"

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username:   profile?.username   ?? '',
      nickname:   profile?.nickname   ?? '',
      department: profile?.department ?? '',
    },
  })

  function startEdit() {
    form.reset({
      username:   profile?.username   ?? '',
      nickname:   profile?.nickname   ?? '',
      department: profile?.department ?? '',
    })
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    form.reset()
  }

  async function handleSave(values) {
    setSaving(true)
    const { error } = await supabase
      .from('users')
      .update({
        username:   values.username,
        nickname:   values.nickname   || null,
        department: values.department || null,
      })
      .eq('id', profile.id)

    if (error) {
      toast.error(`Failed to save: ${error.message}`)
    } else {
      await refreshProfile()
      toast.success('Profile updated!')
      setEditing(false)
    }
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
      toast.success('Avatar updated!')
    } else {
      toast.error('Failed to upload avatar.')
    }
    setUploading(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-food-text">Profile</h1>

      {/* Avatar */}
      <div className="bg-food-card border border-indigo-500/30 rounded-xl p-5 flex items-center gap-5">
        <div className="relative">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} className="w-16 h-16 rounded-full object-cover border-2 border-food-border" alt="avatar" />
            : <div className="w-16 h-16 rounded-full bg-food-accent-d flex items-center justify-center text-food-accent text-2xl font-bold">{profile?.username?.[0]?.toUpperCase()}</div>
          }
          <label className="absolute bottom-0 right-0 w-6 h-6 bg-food-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-food-accent-h transition-colors">
            <Camera className="w-3 h-3 text-white" />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>
        <div>
          <p className="text-food-text font-semibold">{profile?.nickname || profile?.username}</p>
          <p className="text-food-text-m text-sm">{profile?.email}</p>
          {profile?.department && <p className="text-food-text-m text-xs mt-0.5">{profile.department}</p>}
          {uploading && <p className="text-food-text-m text-xs mt-1">Uploading…</p>}
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-food-card border border-indigo-500/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-food-text font-semibold">Personal Info</h2>
          {!editing && (
            <Button size="sm" variant="ghost" onClick={startEdit}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={form.handleSubmit(handleSave)} className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Username</label>
              <input {...form.register('username')} className={inputCls} />
              {form.formState.errors.username && (
                <p className="text-red-400 text-xs mt-1">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Nickname</label>
              <input {...form.register('nickname')} className={inputCls} placeholder="Optional display name" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Department</label>
              <input {...form.register('department')} className={inputCls} placeholder="e.g. Engineering, Marketing…" />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
              <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>Username</p>
              <p className={valueCls}>{profile?.username || '—'}</p>
            </div>
            <div>
              <p className={labelCls}>Nickname</p>
              <p className={valueCls}>{profile?.nickname || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className={labelCls}>Department</p>
              <p className={valueCls}>{profile?.department || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Body calculator link */}
      <div className="bg-food-elevated border border-food-border rounded-xl p-4 flex items-center justify-between">
        <p className="text-food-text-s text-sm">Body calculator, calorie targets and meal suggestions have moved to their own page.</p>
        <a href="/body" className="text-food-accent text-sm font-semibold hover:underline whitespace-nowrap ml-4">Open →</a>
      </div>
    </div>
  )
}
