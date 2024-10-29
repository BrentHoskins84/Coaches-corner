-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

CREATE TABLE user_team_roles (
  user_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  role_id INTEGER REFERENCES roles(id),
  PRIMARY KEY (user_id, team_id, role_id)
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id),
  role_id INTEGER REFERENCES roles(id),
  inviter_id UUID REFERENCES auth.users(id),
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Insert default roles
INSERT INTO roles (name) VALUES
  ('Administrator'),
  ('Head Coach'),
  ('Assistant Coach'),
  ('Team Manager'),
  ('Player'),
  ('Parent');

-- Create functions
CREATE OR REPLACE FUNCTION check_user_role(p_user_id UUID, p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_team_roles utr
    JOIN roles r ON utr.role_id = r.id
    WHERE utr.user_id = p_user_id AND r.name = p_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION assign_role(p_user_id UUID, p_team_id UUID, p_role_name TEXT)
RETURNS VOID AS $$
DECLARE
  v_role_id INTEGER;
BEGIN
  SELECT id INTO v_role_id FROM roles WHERE name = p_role_name;
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Invalid role name';
  END IF;

  IF p_role_name = 'Administrator' THEN
    RAISE EXCEPTION 'Administrators cannot be assigned to teams';
  END IF;

  INSERT INTO user_team_roles (user_id, team_id, role_id)
  VALUES (p_user_id, p_team_id, v_role_id)
  ON CONFLICT (user_id, team_id, role_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION assign_administrator(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_role_id INTEGER;
BEGIN
  SELECT id INTO v_role_id FROM roles WHERE name = 'Administrator';
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Administrator role not found';
  END IF;

  -- Remove any existing team roles
  DELETE FROM user_team_roles WHERE user_id = p_user_id;

  -- Insert the Administrator role without a team
  INSERT INTO user_team_roles (user_id, role_id)
  VALUES (p_user_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrators can access all teams"
ON teams
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_team_roles utr
    JOIN roles r ON utr.role_id = r.id
    WHERE utr.user_id = auth.uid() AND r.name = 'Administrator'
  )
);

CREATE POLICY "Users can access their own teams"
ON teams
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_team_roles
    WHERE user_id = auth.uid() AND team_id = teams.id
  )
);

ALTER TABLE user_team_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrators can manage all user_team_roles"
ON user_team_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM roles r
    WHERE r.id IN (
      SELECT role_id FROM user_team_roles
      WHERE user_id = auth.uid()
    )
    AND r.name = 'Administrator'
  )
);

CREATE POLICY "Users can view their own roles"
ON user_team_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Head Coaches can manage roles for their team"
ON user_team_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM roles r
    WHERE r.id IN (
      SELECT role_id FROM user_team_roles
      WHERE user_id = auth.uid() AND team_id = user_team_roles.team_id
    )
    AND r.name = 'Head Coach'
  )
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrators can view all audit logs"
ON audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_team_roles utr
    JOIN roles r ON utr.role_id = r.id
    WHERE utr.user_id = auth.uid() AND r.name = 'Administrator'
  )
);

ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrators can manage all invitations"
ON team_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_team_roles utr
    JOIN roles r ON utr.role_id = r.id
    WHERE utr.user_id = auth.uid() AND r.name = 'Administrator'
  )
);

CREATE POLICY "Head Coaches can manage invitations for their team"
ON team_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_team_roles utr
    JOIN roles r ON utr.role_id = r.id
    WHERE utr.user_id = auth.uid() AND r.name = 'Head Coach' AND utr.team_id = team_invitations.team_id
  )
);

-- Create trigger for audit logging
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_teams_changes
AFTER INSERT OR UPDATE OR DELETE ON teams
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_user_team_roles_changes
AFTER INSERT OR UPDATE OR DELETE ON user_team_roles
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_team_invitations_changes
AFTER INSERT OR UPDATE OR DELETE ON team_invitations
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
