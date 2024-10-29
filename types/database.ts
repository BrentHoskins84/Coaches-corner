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
