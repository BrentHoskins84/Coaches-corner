'use server'

import { createClient } from "@/utils/supabase/server"
import { TeamInsert } from "@/types/database"
import { revalidatePath } from "next/cache"
import { Team } from '@/types/database'


interface UserProfileWithEmail {
  id: string;
  role_id: number;
  email: string | null;
}

interface TeamMember {
  id: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
}

// Create a new team
export async function createTeam(team: TeamInsert) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if the user is an administrator
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      throw new Error('Unauthorized')
    }

    // Assuming role_id 1 is for administrators
    if (userProfile.role_id !== 1) {
      throw new Error('Only administrators can create teams')
    }

    const { data, error } = await supabase
      .from('teams')
      .insert([team])
      .select()
      .single()

    if (error) throw error

    // Revalidate the teams page to show the new team
    revalidatePath('/teams')

    return { data, error: null }
  } catch (error) {
    console.error('Error creating team:', error)
    return { data: null, error: 'Error creating team' }
  }
}

// Get all teams (with optional filters)
export async function getTeams(filters?: {
  isActive?: boolean
  hasHeadCoach?: boolean
}): Promise<{ data: Team[] | null, error: string | null }> {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check user's role
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role_id, team_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      throw new Error('Unauthorized')
    }

    let query = supabase.from('teams').select('*')

    if (filters?.isActive !== undefined) query = query.eq('is_active', filters.isActive)
    if (filters?.hasHeadCoach !== undefined) {
      query = filters.hasHeadCoach ? query.not('head_coach_id', 'is', null) : query.is('head_coach_id', null)
    }

    // If not an administrator, only show the user's team
    if (userProfile.role_id !== 1) {
      query = query.eq('id', userProfile.team_id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching teams:', error)
    return { data: null, error: 'Error fetching teams' }
  }
}

// Get a single team by ID
export async function getTeamById(id: string) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check user's role and team
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role_id, team_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      throw new Error('Unauthorized')
    }

    // If not an administrator, only allow access to user's team
    if (userProfile.role_id !== 1 && userProfile.team_id !== id) {
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching team:', error)
    return { data: null, error: 'Error fetching team' }
  }
}

// Update a team
export async function updateTeam(id: string, updates: Partial<TeamInsert>) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check user's role and team
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role_id, team_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      throw new Error('Unauthorized')
    }

    // Only allow administrators or the team's head coach to update
    if (userProfile.role_id !== 1 && userProfile.team_id !== id) {
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Revalidate the teams pages
    revalidatePath('/teams')
    revalidatePath(`/teams/${id}`)

    return { data, error: null }
  } catch (error) {
    console.error('Error updating team:', error)
    return { data: null, error: 'Error updating team' }
  }
}

// Delete a team (soft delete)
export async function deleteTeam(id: string) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if the user is an administrator
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile || userProfile.role_id !== 1) {
      throw new Error('Only administrators can delete teams')
    }

    const { data, error } = await supabase
      .from('teams')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Revalidate the teams page
    revalidatePath('/teams')

    return { data, error: null }
  } catch (error) {
    console.error('Error deleting team:', error)
    return { data: null, error: 'Error deleting team' }
  }
}

export async function getAvailableHeadCoaches() {
  try {
    const supabase = await createClient()

    // First, get the user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, role_id')
      .eq('role_id', 2) // Assuming role_id 2 is for coaches
      .is('team_id', null)

    if (profilesError) {
      console.error('Supabase query error (profiles):', profilesError)
      throw profilesError
    }

    if (!profiles || profiles.length === 0) {
      return { data: [], error: null }
    }

    // Then, get the emails using rpc (stored procedure)
    const { data: users, error: usersError } = await supabase
      .rpc('get_user_emails', {
        user_ids: profiles.map(profile => profile.id)
      })

    if (usersError) {
      console.error('Supabase query error (users):', usersError)
      throw usersError
    }

    // Combine the data
    const availableHeadCoaches = profiles.map(profile => {
      const userEmail = users?.find((u: UserProfileWithEmail) => u.id === profile.id)?.email
      return {
        id: profile.id,
        email: userEmail || 'Email not found'
      }
    })

    return { data: availableHeadCoaches, error: null }
  } catch (error) {
    console.error('Error fetching available head coaches:', error)
    return { data: null, error: 'Error fetching available head coaches' }
  }
}

export async function getTeamMembers(teamId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        avatar_url,
        role:roles(name)
      `)
      .eq('team_id', teamId)

    if (error) throw error

    const teamMembers: TeamMember[] = (data as any[]).map(member => ({
      id: member.id,
      email: member.email,
      avatar_url: member.avatar_url,
      role: member.role && member.role.length > 0 ? member.role[0].name : 'Unknown'
    }))

    return { data: teamMembers, error: null }
  } catch (error) {
    console.error('Error fetching team members:', error)
    return { data: null, error: 'Error fetching team members' }
  }
}

