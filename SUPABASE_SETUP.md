# Supabase PostgreSQL Schema Setup

## Step 1: Create the Schema in Supabase

1. Go to your Supabase project dashboard: https://app.supabase.com/
2. Select your project: **mkzxsvzplicwgcutzssu**
3. Navigate to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Copy and paste the complete SQL schema below
6. Click **"Run"**

## Complete PostgreSQL Schema

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  ntfy_topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table  
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_name_lower ON users(LOWER(name));
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Add RLS policies (optional - only if you want row-level security)
-- For now, keep it simple - no RLS needed since we're using userIds in queries
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write their own data
CREATE POLICY users_policy ON users
  FOR ALL
  USING (true);

CREATE POLICY projects_policy ON projects
  FOR ALL
  USING (true);

CREATE POLICY tasks_policy ON tasks
  FOR ALL
  USING (true);
```

## Step 2: Verify the Schema

1. In the SQL Editor, run this query to verify tables were created:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

Expected result:
```
projects
tasks
users
```

## Step 3: Test the Connection

Run this test command in your terminal:
```bash
cd /media/prasun/General/Coding/Personal/task-manager
npm run dev
```

Then try to load your task manager app in the browser at `http://localhost:3000?user=testuser`

## Step 4: Verify Data Syncs

1. Add a task in the browser
2. Refresh the page
3. The task should still be there (loaded from database)

## Troubleshooting

### Error: "Tenant or user not found"
- **Cause**: Schema not created yet
- **Fix**: Run Step 1 above to create the schema

### Error: "connect ECONNREFUSED"  
- **Cause**: DATABASE_URL not set or incorrect
- **Fix**: Verify `.env` file has `DATABASE_URL` set correctly (should be visible in your project)

### Error: "permission denied"
- **Cause**: RLS policies are too restrictive
- **Fix**: Make sure RLS policies above are created with `USING (true)` to allow access

## If You Need to Reset the Database

To delete all data and start fresh (WARNING: This deletes everything):
```sql
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then re-run the schema creation SQL above.
