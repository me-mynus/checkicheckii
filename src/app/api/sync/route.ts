import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { randomUUID } from 'crypto';

const createClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return new Client(databaseUrl);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, tasks, projects, user } = body;

    console.log('API Route called:', { userId, userName, tasksCount: tasks?.length, projectsCount: projects?.length });

    let resolvedUserId = userId;
    let resolvedUser = user;

    const client = createClient();
    await client.connect();
    console.log('Database connected');

    // If userName is provided but no userId, look up or create the user
    if (userName && !resolvedUserId) {
      const userResult = await client.query(
        'SELECT id FROM users WHERE LOWER(name) = LOWER($1)',
        [userName]
      );
      
      if (userResult.rows.length > 0) {
        resolvedUserId = userResult.rows[0].id;
      } else {
        // Create new user
        resolvedUserId = randomUUID();
        const ntfyTopic = userName.toLowerCase().replace(/\s+/g, '');
        resolvedUser = {
          id: resolvedUserId,
          name: userName,
          ntfyTopic: ntfyTopic,
        };
        
        await client.query(
          'INSERT INTO users (id, name, ntfy_topic, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
          [resolvedUserId, userName, ntfyTopic, new Date(), new Date()]
        );
        console.log('New user created:', userName);
      }
    }

    if (!resolvedUserId) {
      await client.end();
      return NextResponse.json({ error: 'userId or userName required' }, { status: 400 });
    }

    // Verify user exists in database for load operations
    if (!tasks && !projects) {
      const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [resolvedUserId]);
      if (userCheck.rows.length === 0) {
        // User doesn't exist yet, create it
        if (!resolvedUser || !resolvedUser.name) {
          await client.end();
          return NextResponse.json({ error: 'User not found. Please provide userName to create new user.' }, { status: 404 });
        }
        
        await client.query(
          'INSERT INTO users (id, name, ntfy_topic, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
          [resolvedUser.id, resolvedUser.name, resolvedUser.ntfyTopic, new Date(), new Date()]
        );
        console.log('User auto-created:', resolvedUser.name);
      }
    }

    // If tasks and projects are provided, this is a sync operation
    if (tasks !== undefined && projects !== undefined) {
      console.log('Performing sync operation');
      
      // Save user if provided
      if (resolvedUser) {
        await client.query(
          'INSERT INTO users (id, name, ntfy_topic, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name = $2, ntfy_topic = $3, updated_at = $5',
          [resolvedUser.id, resolvedUser.name, resolvedUser.ntfyTopic, new Date(), new Date()]
        );
        console.log('User saved');
      }

      // Delete existing data for this user
      await client.query('DELETE FROM tasks WHERE user_id = $1', [resolvedUserId]);
      await client.query('DELETE FROM projects WHERE user_id = $1', [resolvedUserId]);
      console.log('Existing data deleted');

      // Insert projects first so task foreign keys can reference them
      for (const project of projects) {
        await client.query(
          'INSERT INTO projects (id, name, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
          [project.id, project.name, resolvedUserId, new Date(project.createdAt), new Date(project.updatedAt || project.createdAt)]
        );
      }
      console.log(`Inserted ${projects.length} projects`);

      // Insert tasks after projects
      for (const task of tasks) {
        await client.query(
          `INSERT INTO tasks (id, name, completed, notification_enabled, notification_sent, due_date, project_id, user_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            task.id,
            task.name,
            task.completed,
            task.notificationEnabled,
            task.notificationSent,
            task.dueDate ? new Date(task.dueDate) : null,
            task.projectId || null,
            resolvedUserId,
            new Date(task.createdAt),
            new Date(task.updatedAt || task.createdAt),
          ]
        );
      }
      console.log(`Inserted ${tasks.length} tasks`);

      await client.end();
      
      return NextResponse.json({ message: 'Data synced successfully' });
    } else {
      // Load data
      console.log('Performing load operation');
      const tasksResult = await client.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [resolvedUserId]);
      const projectsResult = await client.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC', [resolvedUserId]);
      const userResult = await client.query('SELECT * FROM users WHERE id = $1', [resolvedUserId]);

      await client.end();
      
      const data = {
        tasks: tasksResult.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          name: row.name,
          dueDate: row.due_date ? row.due_date.toISOString() : null,
          projectId: row.project_id,
          completed: row.completed,
          notificationEnabled: row.notification_enabled,
          notificationSent: row.notification_sent,
          createdAt: row.created_at.toISOString(),
        })),
        projects: projectsResult.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          name: row.name,
          createdAt: row.created_at.toISOString(),
        })),
        user: userResult.rows[0] ? {
          id: userResult.rows[0].id,
          name: userResult.rows[0].name,
          ntfyTopic: userResult.rows[0].ntfy_topic,
        } : null,
      };

      console.log(`Loaded ${data.tasks.length} tasks, ${data.projects.length} projects`);
      
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('API Route error:', error);
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message)
        : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
