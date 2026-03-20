import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const appUrl = Deno.env.get('APP_URL') || 'https://food-app-three-topaz.vercel.app'

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error('Missing Supabase env vars on edge function.')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth token.' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const {
      data: { user: caller },
      error: authErr,
    } = await callerClient.auth.getUser()

    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { data: callerProfile, error: profileErr } = await adminClient
      .from('users')
      .select('id, role, status')
      .eq('id', caller.id)
      .single()

    if (profileErr || !callerProfile || callerProfile.role !== 'admin' || callerProfile.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Only approved admins can invite users.' }), {
        status: 403,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { email } = await req.json()
    const normalizedEmail = String(email ?? '').trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email.' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { data: existingUser } = await adminClient
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists for this email.' }), {
        status: 409,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { data: existingInvite } = await adminClient
      .from('user_invitations')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingInvite) {
      return new Response(JSON.stringify({ error: 'Invitation already exists for this email.' }), {
        status: 409,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { error: insertErr } = await adminClient
      .from('user_invitations')
      .insert({ email: normalizedEmail, role: 'user', invited_by: caller.id })
    if (insertErr) throw insertErr

    const inviteOptions = { redirectTo: `${appUrl}/accept-invite` }
    const { error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
      normalizedEmail,
      inviteOptions
    )

    if (inviteErr) {
      await adminClient.from('user_invitations').delete().eq('email', normalizedEmail)
      throw inviteErr
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
