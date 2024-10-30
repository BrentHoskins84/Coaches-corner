export interface Role {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  role_id?: number;
  team_id?: string;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

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

export interface Drill {
  id: string;
  name: string;
  description: string;
  duration: number;
  category: DrillCategory;
  type: string;
  difficulty_level: DifficultyLevel;
  age_group: string;
  min_players: number;
  max_players: number;
  equipment_needed: string[];
  space_required?: string;
  objectives: string[];
  key_coaching_points: string[];
  progression?: string;
  sport: string;
  position_specificity: string[];
  tactical_element?: string;
  visual_aid?: string;
  intensity_level?: IntensityLevel;
  is_warm_up: boolean;
  is_cool_down: boolean;
  metrics_for_evaluation: string[];
  safety_considerations?: string;
  created_by: string;
  team_id?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  tags: string[];
  variation_of?: string;
  variation_description?: string;
}

export type DrillInsert = Omit<Drill, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

// ... existing types ...

export interface PracticePlan {
  id: string;
  name: string;
  created_by: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PracticePlanItem {
  id: string;
  practice_plan_id: string;
  drill_id?: string;
  duration: number;
  order_index: number;
  item_type: 'drill' | 'break';
  created_at: string;
  updated_at: string;
}

export type PracticePlanInsert = Omit<PracticePlan, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type PracticePlanItemInsert = Omit<PracticePlanItem, 'id' | 'created_at' | 'updated_at'>;


// Add to existing types
export type DrillType = 'Warm-up' | 'Break' | 'Conditioning' | 'Offense' | 'Defense' | 'Cool-down';

export interface DrillTypeConfig {
    id: string;
    name: DrillType;
    color_class: string;
    created_at: string;
    updated_at: string;
}
