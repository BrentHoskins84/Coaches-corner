'use server'

import { createClient } from "@/utils/supabase/server"
import { DrillInsert } from "@/types/database"
import { revalidatePath } from "next/cache"

// Create a new drill
export async function createDrill(drill: DrillInsert) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Add the created_by field
    drill.created_by = user.id

    const { data, error } = await supabase
      .from('drills')
      .insert([drill])
      .select()
      .single()

    if (error) throw error

    // Revalidate the drills page to show the new drill
    revalidatePath('/drills')

    return { data, error: null }
  } catch (error) {
    console.error('Error creating drill:', error)
    return { data: null, error: 'Error creating drill' }
  }
}

// Get all drills (with optional filters)
export async function getDrills(filters?: {
  category?: string
  sport?: string
  isPublic?: boolean
}) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('drills')
      .select('*')
      .is('deleted_at', null)

    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.sport) query = query.eq('sport', filters.sport)
    if (filters?.isPublic !== undefined) query = query.eq('is_public', filters.isPublic)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching drills:', error)
    return { data: null, error: 'Error fetching drills' }
  }
}

// Get a single drill by ID
export async function getDrillById(params: Promise<string> | string) {
  try {
    const id = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('drills')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching drill:', error)
    return { data: null, error: 'Error fetching drill' }
  }
}

// Update a drill
export async function updateDrill(id: string, updates: Partial<DrillInsert>) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('drills')
      .update(updates)
      .eq('id', id)
      .eq('created_by', user.id)
      .select()
      .single()

    if (error) throw error

    // Revalidate the drills pages
    revalidatePath('/drills')
    revalidatePath(`/drills/${id}`)

    return { data, error: null }
  } catch (error) {
    console.error('Error updating drill:', error)
    return { data: null, error: 'Error updating drill' }
  }
}

// Delete a drill (soft delete)
export async function deleteDrill(id: string) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('drills')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('created_by', user.id)
      .select()
      .single()

    if (error) throw error

    // Revalidate the drills page
    revalidatePath('/drills')

    return { data, error: null }
  } catch (error) {
    console.error('Error deleting drill:', error)
    return { data: null, error: 'Error deleting drill' }
  }
}
