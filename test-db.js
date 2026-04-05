#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not set in .env file');
  process.exit(1);
}

console.log('🔍 Testing database connection...');
console.log(`📍 Server: ${DATABASE_URL.split('@')[1]?.split(':')[0] || 'unknown'}`);

const client = new Client({ connectionString: DATABASE_URL });

(async () => {
  try {
    // Connect
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check tables
    const tablesResult = await client.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );

    const tables = tablesResult.rows.map(r => r.table_name);
    
    if (tables.length === 0) {
      console.log('❌ No tables found in database');
      console.log('📝 Run: SUPABASE_SETUP.md to create the schema\n');
    } else {
      console.log('✅ Database tables:');
      tables.forEach(t => console.log(`   - ${t}`));
      console.log('');

      // Check row counts
      for (const table of tables) {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0].count;
        console.log(`   ${table}: ${count} rows`);
      }
      console.log('');
    }

    // Try to create a test user
    console.log('🧪 Testing user creation...');
    const testUserId = require('crypto').randomUUID();
    try {
      await client.query(
        'INSERT INTO users (id, name, ntfy_topic) VALUES ($1, $2, $3)',
        [testUserId, `test_${Date.now()}`, 'test_topic']
      );
      console.log('✅ User creation successful\n');
    } catch (e) {
      if (e.code === '23505') { // Unique violation - name already exists
        console.log('✅ User creation works (got expected unique constraint error)\n');
      } else {
        throw e;
      }
    }

    console.log('🎉 All checks passed! Database is ready to use.');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused');
      console.error('   Make sure DATABASE_URL in .env is correct');
      console.error('   It should point to your Supabase database\n');
    } else if (error.message.includes('does not exist')) {
      console.error('❌ Table does not exist');
      console.error('   Follow SUPABASE_SETUP.md to create the schema\n');
    } else {
      console.error('❌ Error:', error.message);
      if (error.code) console.error('   Code:', error.code);
      if (error.detail) console.error('   Detail:', error.detail);
      console.error('');
    }
  } finally {
    await client.end();
  }
})();
