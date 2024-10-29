-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE drill_category AS ENUM (
  'Warm-up', 'Cool-down', 'Offense', 'Defense', 'Conditioning', 'Skill Development',
  'Team Building', 'Scrimmage', 'Special Teams', 'Recovery', 'Mental Preparation', 'Other'
);

-- Create tables
CREATE TABLE public.users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE TABLE public.roles (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.teams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  division text,
  sport text,
  logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE TABLE public.user_team_roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  team_id uuid REFERENCES public.teams(id) NOT NULL,
  role_id integer REFERENCES public.roles(id) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, team_id, role_id)
);

CREATE TABLE public.role_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  old_role_id integer REFERENCES public.roles(id),
  new_role_id integer REFERENCES public.roles(id) NOT NULL,
  team_id uuid REFERENCES public.teams(id),
  changed_by uuid REFERENCES public.users(id) NOT NULL,
  changed_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.drills (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  duration interval NOT NULL,
  category drill_category,
  type text,
  difficulty_level text,
  age_group text,
  min_players integer,
  max_players integer,
  equipment_needed text[],
  objectives text[],
  key_coaching_points text[],
  progression text,
  sport text,
  position_specificity text[],
  tactical_element text,
  metrics_for_evaluation text[],
  created_by uuid REFERENCES public.users(id) NOT NULL,
  team_id uuid REFERENCES public.teams(id),
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  -- Optional fields
  space_required text,
  visual_aid text,
  intensity_level text,
  is_warm_up boolean,
  is_cool_down boolean,
  safety_considerations text,
  tags text[],
  -- Variation fields
  variation_of uuid REFERENCES public.drills(id),
  variation_description text
);

CREATE TABLE public.practice_plans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  team_id uuid REFERENCES public.teams(id) NOT NULL,
  created_by uuid REFERENCES public.users(id) NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  total_duration interval GENERATED ALWAYS AS (end_time - start_time) STORED,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

CREATE TABLE public.practice_plan_drills (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  practice_plan_id uuid REFERENCES public.practice_plans(id) NOT NULL,
  drill_id uuid REFERENCES public.drills(id) NOT NULL,
  order_index integer NOT NULL,
  duration interval NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.team_invitations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) NOT NULL,
  email text NOT NULL,
  role_id integer REFERENCES public.roles(id) NOT NULL,
  invited_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  UNIQUE (team_id, email)
);

CREATE TABLE public.audit_log (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.practice_plan_versions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  practice_plan_id uuid REFERENCES public.practice_plans(id) NOT NULL,
  version_number integer NOT NULL,
  data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (practice_plan_id, version_number)
);

-- Insert default roles
INSERT INTO public.roles (name) VALUES
  ('Administrator'),
  ('Head Coach'),
  ('Assistant Coach'),
  ('Team Manager'),
  ('Player'),
  ('Parent');

-- Create indexes
CREATE INDEX idx_user_team_roles_user_id ON public.user_team_roles(user_id);
CREATE INDEX idx_user_team_roles_team_id ON public.user_team_roles(team_id);
CREATE INDEX idx_user_team_roles_role_id ON public.user_team_roles(role_id);
CREATE INDEX idx_drills_created_by ON public.drills(created_by);
CREATE INDEX idx_drills_variation_of ON public.drills(variation_of);
CREATE INDEX idx_practice_plans_team_id ON public.practice_plans(team_id);
CREATE INDEX idx_practice_plan_drills_practice_plan_id ON public.practice_plan_drills(practice_plan_id);
CREATE INDEX idx_practice_plan_drills_drill_id ON public.practice_plan_drills(drill_id);

-- Add constraints
ALTER TABLE public.drills ADD CONSTRAINT check_drill_duration CHECK (duration > interval '0');
ALTER TABLE public.practice_plans ADD CONSTRAINT check_practice_time CHECK (end_time > start_time);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_plan_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_plan_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view non-deleted profiles" ON public.users
  FOR SELECT USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Roles are viewable by all authenticated users" ON public.roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Teams are viewable by team members" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = id
        AND user_team_roles.user_id = auth.uid()
    ) AND deleted_at IS NULL
  );

CREATE POLICY "Teams can be created by Head Coaches" ON public.teams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id = (SELECT id FROM public.roles WHERE name = 'Head Coach')
    )
  );

CREATE POLICY "Teams can be updated by Head Coaches" ON public.teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = id
        AND user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id = (SELECT id FROM public.roles WHERE name = 'Head Coach')
    )
  );

CREATE POLICY "UserTeamRoles are viewable by team members" ON public.user_team_roles
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_team_roles AS utr
      WHERE utr.team_id = user_team_roles.team_id
        AND utr.user_id = auth.uid()
    )
  );

CREATE POLICY "UserTeamRoles can be created by Head Coaches" ON public.user_team_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = team_id
        AND user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id = (SELECT id FROM public.roles WHERE name = 'Head Coach')
    )
  );

CREATE POLICY "UserTeamRoles can be updated by Head Coaches" ON public.user_team_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = team_id
        AND user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id = (SELECT id FROM public.roles WHERE name = 'Head Coach')
    )
  );

CREATE POLICY "RoleHistory is viewable by Administrators" ON public.role_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id = (SELECT id FROM public.roles WHERE name = 'Administrator')
    )
  );

CREATE POLICY "RoleHistory can be inserted by Administrators and Head Coaches" ON public.role_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id IN (
          SELECT id FROM public.roles WHERE name IN ('Administrator', 'Head Coach')
        )
    )
  );

CREATE POLICY "Drills are viewable by team members or if public" ON public.drills
  FOR SELECT USING (
    is_public OR
    created_by = auth.uid() OR
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = drills.team_id
        AND user_team_roles.user_id = auth.uid()
    )) AND deleted_at IS NULL
  );

CREATE POLICY "Drills can be created by authenticated users" ON public.drills
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Drills can be updated by creators or Head Coaches" ON public.drills
  FOR UPDATE USING (
    created_by = auth.uid() OR
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = drills.team_id
        AND user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id = (SELECT id FROM public.roles WHERE name = 'Head Coach')
    ))
  );

CREATE POLICY "Practice plans are viewable by team members or if public" ON public.practice_plans
  FOR SELECT USING (
    is_public OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = practice_plans.team_id
        AND user_team_roles.user_id = auth.uid()
    ) AND deleted_at IS NULL
  );

CREATE POLICY "Practice plans can be created by Head Coaches and Assistant Coaches" ON public.practice_plans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = team_id
        AND user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id IN (
          SELECT id FROM public.roles WHERE name IN ('Head Coach', 'Assistant Coach')
        )
    )
  );

CREATE POLICY "Practice plans can be updated by creators or Head Coaches" ON public.practice_plans
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = practice_plans.team_id
        AND user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id = (SELECT id FROM public.roles WHERE name = 'Head Coach')
    )
  );

CREATE POLICY "Practice plan drills are viewable by team members" ON public.practice_plan_drills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.practice_plans
      JOIN public.user_team_roles ON practice_plans.team_id = user_team_roles.team_id
      WHERE practice_plans.id = practice_plan_drills.practice_plan_id
        AND user_team_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Practice plan drills can be created by Head Coaches and Assistant Coaches" ON public.practice_plan_drills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.practice_plans
      JOIN public.user_team_roles ON practice_plans.team_id = user_team_roles.team_id
      WHERE practice_plans.id =   practice_plan_drills.practice_plan_id
        AND user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id IN (
          SELECT id FROM public.roles WHERE name IN ('Head Coach', 'Assistant Coach')
        )
    )
  );

CREATE POLICY "Practice plan drills can be updated by Head Coaches and Assistant Coaches" ON public.practice_plan_drills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.practice_plans
      JOIN public.user_team_roles ON practice_plans.team_id = user_team_roles.team_id
      WHERE practice_plans.id = practice_plan_drills.practice_plan_id
        AND user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id IN (
          SELECT id FROM public.roles WHERE name IN ('Head Coach', 'Assistant Coach')
        )
    )
  );

CREATE POLICY "Team invitations are viewable by team members" ON public.team_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.team_id = team_invitations.team_id
        AND user_team_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Audit log is viewable by Administrators" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_team_roles
      WHERE user_team_roles.user_id = auth.uid()
        AND user_team_roles.role_id = (SELECT id FROM public.roles WHERE name = 'Administrator')
    )
  );

CREATE POLICY "Practice plan versions are viewable by team members" ON public.practice_plan_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.practice_plans
      JOIN public.user_team_roles ON practice_plans.team_id = user_team_roles.team_id
      WHERE practice_plans.id = practice_plan_versions.practice_plan_id
        AND user_team_roles.user_id = auth.uid()
    )
  );

-- Create functions and triggers
CREATE OR REPLACE FUNCTION check_head_coach_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role_id = (SELECT id FROM public.roles WHERE name = 'Head Coach') THEN
    IF (SELECT COUNT(*) FROM public.user_team_roles
        WHERE team_id = NEW.team_id
        AND role_id = NEW.role_id) >= 2 THEN
      RAISE EXCEPTION 'A team can have at most 2 head coaches';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_head_coach_limit
BEFORE INSERT OR UPDATE ON public.user_team_roles
FOR EACH ROW EXECUTE FUNCTION check_head_coach_limit();

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log(table_name, record_id, action, old_data, new_data, changed_by)
  VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP,
          CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
          CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
          auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_teams_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.teams
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_drills_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.drills
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_practice_plans_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.practice_plans
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE OR REPLACE FUNCTION create_practice_plan_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.practice_plan_versions (practice_plan_id, version_number, data, created_by)
  VALUES (NEW.id,
          COALESCE((SELECT MAX(version_number) FROM public.practice_plan_versions WHERE practice_plan_id = NEW.id), 0) + 1,
          row_to_json(NEW),
          auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practice_plan_version_trigger
AFTER INSERT OR UPDATE ON public.practice_plans
FOR EACH ROW EXECUTE FUNCTION create_practice_plan_version();

-- Soft delete trigger function
CREATE OR REPLACE FUNCTION soft_delete_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create soft delete triggers for relevant tables
CREATE TRIGGER soft_delete_users
BEFORE DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION soft_delete_trigger_func();

CREATE TRIGGER soft_delete_teams
BEFORE DELETE ON public.teams
FOR EACH ROW EXECUTE FUNCTION soft_delete_trigger_func();

CREATE TRIGGER soft_delete_drills
BEFORE DELETE ON public.drills
FOR EACH ROW EXECUTE FUNCTION soft_delete_trigger_func();

CREATE TRIGGER soft_delete_practice_plans
BEFORE DELETE ON public.practice_plans
FOR EACH ROW EXECUTE FUNCTION soft_delete_trigger_func();

-- Function to set default role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');

  -- Assign default role (e.g., 'Player')
  INSERT INTO public.user_team_roles (user_id, team_id, role_id)
  VALUES (NEW.id, NULL, (SELECT id FROM public.roles WHERE name = 'Player'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to set default role when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
