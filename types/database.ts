export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: number
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
          is_active: boolean
          head_coach_id: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          head_coach_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          head_coach_id?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          role_id: number
          team_id: string | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role_id: number
          team_id?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: number
          team_id?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      drills: {
        Row: {
          id: string
          name: string
          description: string
          duration: number
          category: DrillCategory
          type: string
          difficulty_level: DifficultyLevel
          age_group: string
          min_players: number
          max_players: number
          equipment_needed: string[] | null
          space_required: string | null
          objectives: string[]
          key_coaching_points: string[]
          progression: string | null
          sport: string
          position_specificity: string[] | null
          tactical_element: string | null
          visual_aid: string | null
          intensity_level: IntensityLevel | null
          is_warm_up: boolean
          is_cool_down: boolean
          metrics_for_evaluation: string[] | null
          safety_considerations: string | null
          created_by: string
          team_id: string | null
          is_public: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          tags: string[] | null
          variation_of: string | null
          variation_description: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          duration: number
          category: DrillCategory
          type: string
          difficulty_level: DifficultyLevel
          age_group: string
          min_players: number
          max_players: number
          equipment_needed?: string[] | null
          space_required?: string | null
          objectives: string[]
          key_coaching_points: string[]
          progression?: string | null
          sport: string
          position_specificity?: string[] | null
          tactical_element?: string | null
          visual_aid?: string | null
          intensity_level?: IntensityLevel | null
          is_warm_up: boolean
          is_cool_down: boolean
          metrics_for_evaluation?: string[] | null
          safety_considerations?: string | null
          created_by: string
          team_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          tags?: string[] | null
          variation_of?: string | null
          variation_description?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          duration?: number
          category?: DrillCategory
          type?: string
          difficulty_level?: DifficultyLevel
          age_group?: string
          min_players?: number
          max_players?: number
          equipment_needed?: string[] | null
          space_required?: string | null
          objectives?: string[]
          key_coaching_points?: string[]
          progression?: string | null
          sport?: string
          position_specificity?: string[] | null
          tactical_element?: string | null
          visual_aid?: string | null
          intensity_level?: IntensityLevel | null
          is_warm_up?: boolean
          is_cool_down?: boolean
          metrics_for_evaluation?: string[] | null
          safety_considerations?: string | null
          created_by?: string
          team_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          tags?: string[] | null
          variation_of?: string | null
          variation_description?: string | null
        }
      }
      practice_plans: {
        Row: {
          id: string
          name: string
          created_by: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      practice_plan_items: {
        Row: {
          id: string
          practice_plan_id: string
          drill_id: string | null
          duration: number
          order_index: number
          item_type: 'drill' | 'break'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practice_plan_id: string
          drill_id?: string | null
          duration: number
          order_index: number
          item_type: 'drill' | 'break'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practice_plan_id?: string
          drill_id?: string | null
          duration?: number
          order_index?: number
          item_type?: 'drill' | 'break'
          created_at?: string
          updated_at?: string
        }
      }
      drill_types: {
        Row: {
          id: string
          name: DrillType
          color_class: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: DrillType
          color_class: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: DrillType
          color_class?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Role = Tables<'roles'>
export type RoleInsert = Insertable<'roles'>
export type RoleUpdate = Updatable<'roles'>

export type Team = Tables<'teams'>
export type TeamInsert = Insertable<'teams'>
export type TeamUpdate = Updatable<'teams'>

export type UserProfile = Tables<'user_profiles'>
export type UserProfileInsert = Insertable<'user_profiles'>
export type UserProfileUpdate = Updatable<'user_profiles'>

export type TeamMember = Tables<'team_members'>
export type TeamMemberInsert = Insertable<'team_members'>
export type TeamMemberUpdate = Updatable<'team_members'>

export type Drill = Tables<'drills'>
export type DrillInsert = Insertable<'drills'>
export type DrillUpdate = Updatable<'drills'>

export type PracticePlan = Tables<'practice_plans'>
export type PracticePlanInsert = Insertable<'practice_plans'>
export type PracticePlanUpdate = Updatable<'practice_plans'>

export type PracticePlanItem = Tables<'practice_plan_items'>
export type PracticePlanItemInsert = Insertable<'practice_plan_items'>
export type PracticePlanItemUpdate = Updatable<'practice_plan_items'>

export type DrillTypeConfig = Tables<'drill_types'>
export type DrillTypeConfigInsert = Insertable<'drill_types'>
export type DrillTypeConfigUpdate = Updatable<'drill_types'>

export interface EnhancedUser {
  id: string;
  email?: string;
  role_id: number | null;
  role_name: string;
  team_id: string | null;
  team_name: string;
  is_approved: boolean;
  // Add any other properties from the Supabase User object that you need
}

export type DrillCategory =
  | 'Warm-up'
  | 'Cool-down'
  | 'Offense'
  | 'Defense'
  | 'Conditioning'
  | 'Skill Development'
  | 'Team Building'
  | 'Scrimmage';

export type DifficultyLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced';

export type IntensityLevel =
  | 'Low'
  | 'Medium'
  | 'High';

export type DrillType = 'Warm-up' | 'Break' | 'Conditioning' | 'Offense' | 'Defense' | 'Cool-down';
