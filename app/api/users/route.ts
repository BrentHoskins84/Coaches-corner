import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Check if the user is authenticated and is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the user's role
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single()

  if (profileError || !userProfile || userProfile.roles.name !== 'Administrator') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse the request body
  const { email, roleId, teamId } = await request.json()

  // Create the user using the admin client
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { role_id: roleId, team_id: teamId }
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Create the user profile
  const { error: profileCreateError } = await supabase
    .from('user_profiles')
    .insert({
      id: data.user.id,
      role_id: roleId,
      team_id: teamId,
      is_approved: true
    })

  if (profileCreateError) {
    return NextResponse.json({ error: profileCreateError.message }, { status: 400 })
  }

  return NextResponse.json({ user: data.user })
}
