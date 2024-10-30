'use server'

import { createClient } from "@/utils/supabase/server"
import { DrillTypeConfig } from "@/types/database"

export async function getDrillTypes() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('drill_types')
            .select('*')
            .order('name')

        if (error) {
            console.error('Error fetching drill types:', error)
            return { data: null, error }
        }

        // Convert array to Record type for easy lookup
        const typeColors: Record<string, string> = {}
        data.forEach((type: DrillTypeConfig) => {
            typeColors[type.name] = type.color_class
        })

        return { data: typeColors, error: null }
    } catch (error) {
        console.error('Error getting drill types:', error)
        return { data: null, error }
    }
}
