'use server'

import { createClient } from "@/utils/supabase/server"
import { PracticePlan, PracticePlanItem, PracticePlanInsert, PracticePlanItemInsert } from "@/types/database"
import { revalidatePath } from "next/cache"

// Create a new practice plan
export async function createPracticePlan(
  plan: PracticePlanInsert,
  items: PracticePlanItemInsert[]
) {
  try {
    const supabase = await createClient()

    // First, create the practice plan
    const { data: practicePlan, error: planError } = await supabase
      .from('practice_plans')
      .insert(plan)
      .select()
      .single()

    if (planError) throw planError

    // Then, create all the items with the practice plan ID
    const itemsWithPlanId = items.map(item => ({
      ...item,
      practice_plan_id: practicePlan.id
    }))

    const { error: itemsError } = await supabase
      .from('practice_plan_items')
      .insert(itemsWithPlanId)

    if (itemsError) throw itemsError

    revalidatePath('/practice-plans')
    return { data: practicePlan, error: null }
  } catch (error) {
    console.error('Error creating practice plan:', error)
    return { data: null, error: 'Failed to create practice plan' }
  }
}

// Get all practice plans for the current user
export async function getPracticePlans() {
  try {
    const supabase = await createClient()

    const { data: plans, error } = await supabase
      .from('practice_plans')
      .select(`
        *,
        practice_plan_items (
          *,
          drill:drills (*)
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: plans, error: null }
  } catch (error) {
    console.error('Error fetching practice plans:', error)
    return { data: null, error: 'Failed to fetch practice plans' }
  }
}

// Get a single practice plan by ID
export async function getPracticePlanById(id: string) {
  try {
    const supabase = await createClient()

    const { data: plan, error } = await supabase
      .from('practice_plans')
      .select(`
        *,
        practice_plan_items (
          *,
          drill:drills (*)
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    return { data: plan, error: null }
  } catch (error) {
    console.error('Error fetching practice plan:', error)
    return { data: null, error: 'Failed to fetch practice plan' }
  }
}

// Update a practice plan
export async function updatePracticePlan(
  id: string,
  plan: Partial<PracticePlan>,
  items?: PracticePlanItemInsert[]
) {
  try {
    const supabase = await createClient()

    // Update the practice plan
    const { error: planError } = await supabase
      .from('practice_plans')
      .update(plan)
      .eq('id', id)

    if (planError) throw planError

    // If items are provided, update them
    if (items) {
      // First, delete all existing items
      const { error: deleteError } = await supabase
        .from('practice_plan_items')
        .delete()
        .eq('practice_plan_id', id)

      if (deleteError) throw deleteError

      // Then insert the new items
      const itemsWithPlanId = items.map(item => ({
        ...item,
        practice_plan_id: id
      }))

      const { error: itemsError } = await supabase
        .from('practice_plan_items')
        .insert(itemsWithPlanId)

      if (itemsError) throw itemsError
    }

    revalidatePath('/practice-plans')
    revalidatePath(`/practice-plans/${id}`)
    return { data: { id }, error: null }
  } catch (error) {
    console.error('Error updating practice plan:', error)
    return { data: null, error: 'Failed to update practice plan' }
  }
}

// Delete a practice plan (soft delete)
export async function deletePracticePlan(id: string) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()

    if (!user.data.user) {
      throw new Error('Not authenticated')
    }

    // First delete all practice plan items
    const { error: itemsError } = await supabase
      .from('practice_plan_items')
      .delete()
      .eq('practice_plan_id', id)

    if (itemsError) throw itemsError

    // Then delete the practice plan
    const { error: planError } = await supabase
      .from('practice_plans')
      .delete()
      .eq('id', id)
      .eq('created_by', user.data.user.id)

    if (planError) throw planError

    revalidatePath('/practice-plans')
    return { data: { id }, error: null }
  } catch (error) {
    console.error('Error deleting practice plan:', error)
    return { data: null, error: 'Failed to delete practice plan' }
  }
}
