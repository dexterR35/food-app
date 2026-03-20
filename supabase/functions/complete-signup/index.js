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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase env vars.')
    }

    const { email, password, nickname } = await req.json()

    const normalizedEmail = String(email ?? '').trim().toLowerCase()
    const trimmedNickname = String(nickname ?? '').trim()
    const trimmedPassword = String(password ?? '')

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email.' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
    if (trimmedNickname.length < 2) {
      return new Response(JSON.stringify({ error: 'Nickname must be at least 2 characters.' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
    if (trimmedPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters.' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Validate invitation exists and not yet accepted
    const { data: invitation } = await adminClient
      .from('user_invitations')
      .select('id, accepted_at')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (!invitation) {
      return new Response(JSON.stringify({ error: 'No invitation found for this email.' }), {
        status: 403,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    if (invitation.accepted_at) {
      return new Response(JSON.stringify({ error: 'This invitation has already been used.' }), {
        status: 409,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Check if auth user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    const alreadyExists = existingUsers?.users?.some(u => u.email === normalizedEmail)
    if (alreadyExists) {
      return new Response(JSON.stringify({ error: 'An account with this email already exists.' }), {
        status: 409,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Create auth user with real password — trigger will create public.users profile
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: trimmedPassword,
      email_confirm: true,
      user_metadata: { nickname: trimmedNickname },
    })

    if (createErr) throw createErr

    // Mark invitation as accepted
    await adminClient
      .from('user_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)

    return new Response(JSON.stringify({ ok: true, userId: newUser.user.id }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
